import React, { useEffect, useRef } from 'react';
import { CelestialBodyPosition } from '../types';

interface HorizonRadarProps {
  sunPosition: CelestialBodyPosition;
  earthPosition: CelestialBodyPosition;
  siteName: string;
}

export const HorizonRadar: React.FC<HorizonRadarProps> = ({ sunPosition, earthPosition, siteName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 30;

    ctx.clearRect(0, 0, width, height);

    // Deep space background gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius + 20);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(0.7, '#070a14');
    bgGradient.addColorStop(1, '#03050a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Helper: Map elevation angle (-10 to 90 deg) to radius from center
    // 90 deg (Zenith) = radius 0
    // 0 deg (Horizon) = radius maxRadius * 0.82
    // -10 deg (Sub-horizon) = radius maxRadius
    const horizonRadius = maxRadius * 0.82;

    const elevationToRadius = (elev: number): number => {
      if (elev >= 0) {
        // 0 to 90 deg mapped from horizonRadius to 0
        const factor = 1 - Math.min(90, Math.max(0, elev)) / 90;
        return horizonRadius * factor;
      } else {
        // 0 to -10 deg mapped from horizonRadius to maxRadius
        const factor = Math.min(10, Math.abs(elev)) / 10;
        return horizonRadius + (maxRadius - horizonRadius) * factor;
      }
    };

    // Helper: Convert azimuth (0=N, 90=E, 180=S, 270=W) and elevation to canvas (x, y)
    const polarToCanvas = (azimuthDeg: number, elevationDeg: number): [number, number] => {
      const radius = elevationToRadius(elevationDeg);
      const angleRad = ((azimuthDeg - 90) * Math.PI) / 180; // 0 deg North is straight UP
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      return [x, y];
    };

    // Draw Sub-Horizon zone (-10 deg to 0 deg)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Visible Sky zone (0 deg to 90 deg)
    ctx.beginPath();
    ctx.arc(centerX, centerY, horizonRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Concentric elevation guide rings (30 deg, 60 deg)
    const ringElevations = [30, 60];
    ringElevations.forEach((elev) => {
      const r = elevationToRadius(elev);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`${elev}°`, centerX + 4, centerY - r + 10);
    });

    // Azimuth radial lines (every 45 degrees)
    const cardinalLabels: { [key: number]: string } = {
      0: 'N (0°)',
      45: 'NE',
      90: 'E (90°)',
      135: 'SE',
      180: 'S (180°)',
      225: 'SW',
      270: 'W (270°)',
      315: 'NW',
    };

    for (let az = 0; az < 360; az += 45) {
      const angleRad = ((az - 90) * Math.PI) / 180;
      const xEnd = centerX + maxRadius * Math.cos(angleRad);
      const yEnd = centerY + maxRadius * Math.sin(angleRad);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(xEnd, yEnd);
      ctx.strokeStyle = az % 90 === 0 ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cardinal text label
      const labelDist = maxRadius + 18;
      const lx = centerX + labelDist * Math.cos(angleRad);
      const ly = centerY + labelDist * Math.sin(angleRad);

      ctx.fillStyle = az % 90 === 0 ? '#38bdf8' : '#64748b';
      ctx.font = az % 90 === 0 ? 'bold 10px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cardinalLabels[az], lx, ly);
    }

    // Zenith marker at center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // ==========================================
    // RENDER CELESTIAL BODIES (SUN & EARTH)
    // ==========================================

    // 1. Render SUN
    const [sunX, sunY] = polarToCanvas(sunPosition.azimuth, sunPosition.elevation);
    const sunVisible = sunPosition.elevation > 0;

    // Vector line from center to Sun
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sunX, sunY);
    ctx.strokeStyle = sunVisible ? 'rgba(251, 191, 36, 0.25)' : 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 1.5;
    if (!sunVisible) ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sun glowing corona
    if (sunVisible) {
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 18);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.4)');
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, 2 * Math.PI);
      ctx.fillStyle = sunGlow;
      ctx.fill();
    }

    // Sun core disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunVisible ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = sunVisible ? '#fbbf24' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sun tag label
    ctx.fillStyle = sunVisible ? '#fbbf24' : '#f87171';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SUN (${sunPosition.elevation > 0 ? '+' : ''}${sunPosition.elevation.toFixed(1)}°)`, sunX, sunY - 14);

    // 2. Render EARTH
    const [earthX, earthY] = polarToCanvas(earthPosition.azimuth, earthPosition.elevation);
    const earthVisible = earthPosition.elevation > 0;

    // DTE radio frequency beam line from center to Earth
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(earthX, earthY);
    ctx.strokeStyle = earthVisible ? 'rgba(34, 211, 238, 0.35)' : 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 1.5;
    if (!earthVisible) ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Earth radio frequency wave halo
    if (earthVisible) {
      const earthGlow = ctx.createRadialGradient(earthX, earthY, 2, earthX, earthY, 16);
      earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      earthGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
      earthGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.beginPath();
      ctx.arc(earthX, earthY, 16, 0, 2 * Math.PI);
      ctx.fillStyle = earthGlow;
      ctx.fill();
    }

    // Earth core disc (blue marble aesthetic)
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthVisible ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = earthVisible ? '#0284c7' : '#991b1b';
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Earth tag label
    ctx.fillStyle = earthVisible ? '#38bdf8' : '#f87171';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`EARTH (${earthPosition.elevation > 0 ? '+' : ''}${earthPosition.elevation.toFixed(1)}°)`, earthX, earthY + 18);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZENITH', centerX, centerY + 14);

    // Horizon boundary tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HORIZON (0°)', centerX + 8, centerY - horizonRadius + 12);
  }, [sunPosition, earthPosition, siteName]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            360° Lunar Horizon Radar
          </h2>
          <p className="text-xs text-slate-500 font-mono">Topocentric Polar Projection (Local Tangent Plane)</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-slate-300">SUN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="text-slate-300">EARTH</span>
          </div>
        </div>
      </div>

      <div className="relative my-2">
        <canvas
          ref={canvasRef}
          width={520}
          height={520}
          className="rounded-full border border-slate-800/80 max-w-full h-auto shadow-2xl bg-slate-950"
        />
      </div>

      <div className="w-full grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-amber-400 font-semibold mb-1 flex items-center justify-between">
            <span>☀️ SUN TELEMETRY</span>
            <span className={sunPosition.elevation > 0 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
              {sunPosition.elevation > 0 ? 'ABOVE HORIZON' : 'OCCLUDED'}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="text-slate-200">{sunPosition.elevation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Azimuth:</span>
              <span className="text-slate-200">{sunPosition.azimuth.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-cyan-400 font-semibold mb-1 flex items-center justify-between">
            <span>🌍 EARTH TELEMETRY</span>
            <span className={earthPosition.elevation > 0 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
              {earthPosition.elevation > 0 ? 'DTE VISIBLE' : 'BLACKOUT'}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="text-slate-200">{earthPosition.elevation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Azimuth:</span>
              <span className="text-slate-200">{earthPosition.azimuth.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
