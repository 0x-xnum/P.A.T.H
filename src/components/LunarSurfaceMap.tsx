import React, { useRef, useEffect } from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { sampleTelemetry } from '../utils/analyzer';
import { calculateSubSolarCoordinates } from '../utils/ephemeris';

interface LunarSurfaceMapProps {
  currentDate: Date;
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
}

export const LunarSurfaceMap: React.FC<LunarSurfaceMapProps> = ({
  currentDate,
  selectedSite,
  onSelectSite,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssSize = 520;
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    ctx.scale(dpr, dpr);

    const width = cssSize;
    const height = cssSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 25;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Dark lunar terrain background gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
    bgGradient.addColorStop(0, '#111827');
    bgGradient.addColorStop(0.5, '#0b0f19');
    bgGradient.addColorStop(1, '#030712');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Map latitude (-90 at center to -83 at outer edge) to canvas radius
    const latToRadius = (lat: number): number => {
      // lat is between -90 and -83
      const delta = Math.abs(lat) - 83; // 7 at -90, 0 at -83
      const clampedDelta = Math.max(0, Math.min(7, 7 - delta));
      return (clampedDelta / 7) * maxRadius;
    };

    // Convert (lat, lon) to canvas (x, y) in polar stereographic projection
    const lunarCoordsToCanvas = (lat: number, lon: number): [number, number] => {
      const radius = latToRadius(lat);
      // lon=0 is straight up, positive lon goes counter-clockwise/clockwise
      const angleRad = ((lon - 90) * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      return [x, y];
    };

    // Latitude guide concentric rings (88°S, 86°S, 84°S)
    const guideLats = [-88, -86, -84];
    guideLats.forEach((lat) => {
      const r = latToRadius(lat);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`${Math.abs(lat)}°S`, centerX + 4, centerY - r + 10);
    });

    // Outer map boundary (83°S limit)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Prominent permanently shadowed craters (simulated geographic crater outlines)
    const majorCraters = [
      { name: 'Shackleton', lat: -89.9, lon: 0.0, radiusKm: 10 },
      { name: 'Faustini', lat: -87.3, lon: 77.0, radiusKm: 19 },
      { name: 'Haworth', lat: -87.4, lon: 355.0, radiusKm: 17 },
      { name: 'Shoemaker', lat: -88.1, lon: 45.0, radiusKm: 25 },
      { name: 'de Gerlache', lat: -88.5, lon: 271.0, radiusKm: 16 },
      { name: 'Amundsen', lat: -84.5, lon: 82.8, radiusKm: 52 },
      { name: 'Nobile', lat: -85.2, lon: 53.5, radiusKm: 36 },
    ];

    majorCraters.forEach((crater) => {
      const [cx, cy] = lunarCoordsToCanvas(crater.lat, crater.lon);
      const pixelRadius = Math.max(8, (crater.radiusKm / 300) * maxRadius);

      // Crater interior (permanently shadowed ice trap)
      ctx.beginPath();
      ctx.arc(cx, cy, pixelRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)'; // faint cyan for volatile ice trap
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crater label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(crater.name, cx, cy + pixelRadius + 9);
    });

    // Draw Sub-Solar illumination direction vector
    const subSolar = calculateSubSolarCoordinates(currentDate);
    const sunAngleRad = ((subSolar.longitude - 90) * Math.PI) / 180;
    const arrowLen = maxRadius + 14;
    const ax = centerX + arrowLen * Math.cos(sunAngleRad);
    const ay = centerY + arrowLen * Math.sin(sunAngleRad);

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(centerX + (maxRadius - 10) * Math.cos(sunAngleRad), centerY + (maxRadius - 10) * Math.sin(sunAngleRad));
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('☀️ SUN VEC', ax, ay - 6);

    // Plot all Artemis Candidate Sites as interactive markers
    ARTEMIS_CANDIDATE_SITES.forEach((site) => {
      const [sx, sy] = lunarCoordsToCanvas(site.coordinates.latitude, site.coordinates.longitude);
      const isSelected = site.id === selectedSite.id;
      const telemetry = sampleTelemetry(site, currentDate);

      const isSafe = telemetry.windowRating === 'optimal';
      const isMarginal = telemetry.windowRating === 'marginal';

      let markerColor = '#ef4444'; // Red (Hazard)
      if (isSafe) markerColor = '#10b981'; // Green (Optimal)
      else if (isMarginal) markerColor = '#f59e0b'; // Amber (Marginal)

      // Outer glow for selected site
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, 2 * Math.PI);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Marker circle
      ctx.beginPath();
      ctx.arc(sx, sy, isSelected ? 6 : 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = markerColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Site Name Label
      ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
      ctx.font = isSelected ? 'bold 9px monospace' : '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(site.name.split(' ')[0], sx, sy - 8);
    });

    // South Pole center dot (90° S)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('90°S POLE', centerX, centerY + 14);
  }, [currentDate, selectedSite]);

  // Click on canvas to select nearest site
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const actualX = clickX * scaleX;
    const actualY = clickY * scaleY;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 25;

    // Helper: convert (lat, lon) to canvas (x, y)
    const latToRadius = (lat: number): number => {
      const delta = Math.abs(lat) - 83;
      const clampedDelta = Math.max(0, Math.min(7, 7 - delta));
      return (clampedDelta / 7) * maxRadius;
    };

    let nearestSite: LandingSite | null = null;
    let minDistance = 25; // click hit radius in pixels

    ARTEMIS_CANDIDATE_SITES.forEach((site) => {
      const radius = latToRadius(site.coordinates.latitude);
      const angleRad = ((site.coordinates.longitude - 90) * Math.PI) / 180;
      const sx = centerX + radius * Math.cos(angleRad);
      const sy = centerY + radius * Math.sin(angleRad);

      const dist = Math.hypot(actualX - sx, actualY - sy);
      if (dist < minDistance) {
        minDistance = dist;
        nearestSite = site;
      }
    });

    if (nearestSite) {
      onSelectSite(nearestSite);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            Lunar South Pole Surface Map
          </h2>
          <p className="text-xs text-slate-500 font-mono">Polar Stereographic Projection (83°S to 90°S Pole)</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300">GO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-300">CAUTION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-300">NO-GO</span>
          </div>
        </div>
      </div>

      <div className="relative my-2 cursor-pointer">
        <canvas
          ref={canvasRef}
          style={{ width: 520, height: 520 }}
          onClick={handleCanvasClick}
          className="rounded-full border border-slate-800/80 max-w-full h-auto shadow-2xl bg-slate-950"
        />
      </div>

      <div className="w-full text-center text-xs font-mono text-slate-400 mt-2">
        Click any site marker on the surface map to inspect local horizon radar &amp; telemetry
      </div>
    </div>
  );
};
