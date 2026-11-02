import React, { useEffect, useRef } from 'react';
import { CelestialBodyPosition } from '../types';
import { getTerrainElevationCutoff } from '../data/terrainMasks';

interface HorizonRadarProps {
  sunPosition: CelestialBodyPosition;
  earthPosition: CelestialBodyPosition;
  siteName: string;
  siteId: string;
}

export const HorizonRadar: React.FC<HorizonRadarProps> = ({
  sunPosition,
  earthPosition,
  siteName,
  siteId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const cssSize = 520;
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    ctx.scale(dpr, dpr);

    const width = cssSize;
    const height = cssSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 30;
    const horizonRadius = maxRadius * 0.82;

    ctx.clearRect(0, 0, width, height);

    // Deep space background gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius + 20);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(0.7, '#070a14');
    bgGradient.addColorStop(1, '#03050a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Elevation to radius mapping
    const elevationToRadius = (elev: number): number => {
      if (elev >= 0) {
        const factor = 1 - Math.min(90, Math.max(0, elev)) / 90;
        return horizonRadius * factor;
      } else {
        const factor = Math.min(10, Math.abs(elev)) / 10;
        return horizonRadius + (maxRadius - horizonRadius) * factor;
      }
    };

    // Polar to canvas coordinates (0° North straight UP)
    const polarToCanvas = (azimuthDeg: number, elevationDeg: number): [number, number] => {
      const radius = elevationToRadius(elevationDeg);
      const angleRad = ((azimuthDeg - 90) * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      return [x, y];
    };

    // 1. Sub-Horizon zone boundary (-10° ring)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Mathematical 0° Horizon boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, horizonRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. RENDER REAL LOLA TOPOGRAPHIC HORIZON MASK SILHOUETTE
    // Trace 360-degree jagged terrain profile around the site
    ctx.beginPath();
    const stepAz = 3; // Step by 3 degrees for smooth mountain contours
    for (let az = 0; az <= 360; az += stepAz) {
      const cutoff = getTerrainElevationCutoff(siteId, az);
      const [tx, ty] = polarToCanvas(az, cutoff);
      if (az === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();

    // Terrain ridge styling
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill terrain obstruction polygon down to outer edge
    // (Visualizing lunar crater walls and massifs)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();

    // 4. Elevation guide rings (30°, 60°)
    [30, 60].forEach((elev) => {
      const r = elevationToRadius(elev);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`${elev}°`, centerX + 4, centerY - r + 10);
    });

    // 5. Azimuth radial rays (every 45 degrees)
    const cardinalLabels: Record<number, string> = {
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

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZENITH', centerX, centerY + 14);

    // Labels
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LOLA TERRAIN CREST', centerX + 8, centerY - horizonRadius + 14);

    // ==========================================
    // RENDER CELESTIAL BODIES (SUN & EARTH)
    // ==========================================

    // 1. Render SUN
    const [sunX, sunY] = polarToCanvas(sunPosition.azimuth, sunPosition.elevation);
    const sunVisible = sunPosition.isVisible;

    // Vector line from center to Sun
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sunX, sunY);
    ctx.strokeStyle = sunVisible ? 'rgba(251, 191, 36, 0.35)' : 'rgba(239, 68, 68, 0.25)';
    ctx.lineWidth = 1.5;
    if (!sunVisible) ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sun glowing corona
    if (sunVisible) {
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 18);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
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

    ctx.fillStyle = sunVisible ? '#fbbf24' : '#f87171';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SUN (${sunPosition.elevation > 0 ? '+' : ''}${sunPosition.elevation.toFixed(1)}°)`, sunX, sunY - 14);

    // 2. Render EARTH
    const [earthX, earthY] = polarToCanvas(earthPosition.azimuth, earthPosition.elevation);
    const earthVisible = earthPosition.isVisible;

    // DTE radio frequency beam line from center to Earth
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(earthX, earthY);
    ctx.strokeStyle = earthVisible ? 'rgba(34, 211, 238, 0.4)' : 'rgba(239, 68, 68, 0.25)';
    ctx.lineWidth = 1.5;
    if (!earthVisible) ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (earthVisible) {
      const earthGlow = ctx.createRadialGradient(earthX, earthY, 2, earthX, earthY, 16);
      earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      earthGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.3)');
      earthGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.beginPath();
      ctx.arc(earthX, earthY, 16, 0, 2 * Math.PI);
      ctx.fillStyle = earthGlow;
      ctx.fill();
    }

    // Earth core disc
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthVisible ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = earthVisible ? '#0284c7' : '#991b1b';
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = earthVisible ? '#38bdf8' : '#f87171';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`EARTH (${earthPosition.elevation > 0 ? '+' : ''}${earthPosition.elevation.toFixed(1)}°)`, earthX, earthY + 18);
  }, [sunPosition, earthPosition, siteName, siteId]);

  const currentSunMask = getTerrainElevationCutoff(siteId, sunPosition.azimuth);
  const currentEarthMask = getTerrainElevationCutoff(siteId, earthPosition.azimuth);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            360° Lunar Horizon Radar
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            LOLA Topographic Profile Overlay for <span className="text-sky-400 font-semibold">{siteName}</span>
          </p>
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
          style={{ width: 520, height: 520 }}
          className="rounded-full border border-slate-800/80 max-w-full h-auto shadow-2xl bg-slate-950"
        />
      </div>

      <div className="w-full grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-amber-400 font-semibold mb-1 flex items-center justify-between">
            <span>☀️ SOLAR VISIBILITY</span>
            <span className={sunPosition.isVisible ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
              {sunPosition.isVisible ? 'CLEAR OF TERRAIN' : 'TERRAIN OCCLUDED'}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="text-slate-200">{sunPosition.elevation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Local LOLA Ridge Mask:</span>
              <span className="text-sky-300">+{currentSunMask.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Terrain Clearance Margin:</span>
              <span className={sunPosition.elevation - currentSunMask > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {(sunPosition.elevation - currentSunMask > 0 ? '+' : '')}
                {(sunPosition.elevation - currentSunMask).toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-cyan-400 font-semibold mb-1 flex items-center justify-between">
            <span>🌍 DTE LINE-OF-SIGHT</span>
            <span className={earthPosition.isVisible ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
              {earthPosition.isVisible ? 'LINE-OF-SIGHT OPEN' : 'TERRAIN OCCLUDED'}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="text-slate-200">{earthPosition.elevation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Local LOLA Ridge Mask:</span>
              <span className="text-sky-300">+{currentEarthMask.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Terrain Clearance Margin:</span>
              <span className={earthPosition.elevation - currentEarthMask > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {(earthPosition.elevation - currentEarthMask > 0 ? '+' : '')}
                {(earthPosition.elevation - currentEarthMask).toFixed(2)}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
