import React from 'react';
import { TelemetrySample } from '../types';
import { SOLAR_CONSTANT_W_M2 } from '../utils/analyzer';

interface StatusCardProps {
  telemetry: TelemetrySample;
}

export const StatusCard: React.FC<StatusCardProps> = ({ telemetry }) => {
  const { windowRating, solarIlluminationFraction, dteStatus, sun, earth, reasons } = telemetry;

  // Compute estimated incident solar power on a standard 10 m^2 vertical solar array
  const solarFlux = Math.round(solarIlluminationFraction * SOLAR_CONSTANT_W_M2);
  const totalPowerWatts = Math.round(solarFlux * 10 * 0.32); // 32% high-efficiency triple-junction cells

  // Status banner styling & wording
  let bannerBg = 'bg-rose-950/40 border-rose-800 text-rose-300';
  let badgeColor = 'bg-rose-500 text-white';
  let statusTitle = 'NO-GO: CRITICAL OCCLUSION HAZARD';

  if (windowRating === 'optimal') {
    bannerBg = 'bg-emerald-950/40 border-emerald-800 text-emerald-300';
    badgeColor = 'bg-emerald-500 text-black';
    statusTitle = 'GO: OPTIMAL LANDING & POWER WINDOW';
  } else if (windowRating === 'marginal') {
    bannerBg = 'bg-amber-950/40 border-amber-800 text-amber-300';
    badgeColor = 'bg-amber-500 text-black';
    statusTitle = 'CAUTION: MARGINAL POWER / COMMS MARGIN';
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Top Banner Decision Matrix */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${bannerBg}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${badgeColor}`}>
              {windowRating.toUpperCase()}
            </span>
            <span className="text-xs font-mono tracking-wider opacity-80">MISSION DISPATCH ASSESSMENT</span>
          </div>
          <h3 className="text-base font-bold font-mono tracking-tight">{statusTitle}</h3>
        </div>

        <div className="text-xs font-mono text-right sm:border-l sm:border-current/20 sm:pl-4">
          <div className="opacity-75">DTE LINK STATE</div>
          <div className="font-bold text-sm uppercase tracking-wider">{dteStatus}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        {/* Photovoltaic Generation */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
          <div className="text-amber-400 font-semibold flex items-center justify-between">
            <span>⚡ SOLAR POWER MATRIX</span>
            <span className="text-[10px] text-slate-500">10m² Vertical Array</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {totalPowerWatts} <span className="text-sm font-normal text-slate-400">Watts</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Incident Flux:</span>
              <span className="text-slate-200">{solarFlux} W/m²</span>
            </div>
            <div className="flex justify-between">
              <span>Illumination Factor:</span>
              <span className="text-slate-200">{(solarIlluminationFraction * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Sun Elevation:</span>
              <span className={sun.elevation > 0 ? 'text-amber-300' : 'text-rose-400'}>
                {sun.elevation > 0 ? '+' : ''}{sun.elevation.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* Radio DTE Communications */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
          <div className="text-cyan-400 font-semibold flex items-center justify-between">
            <span>📡 DIRECT-TO-EARTH LINK</span>
            <span className="text-[10px] text-slate-500">DSN 34m Station</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 uppercase">
            {dteStatus === 'connected' ? (
              <span className="text-emerald-400">NOMINAL</span>
            ) : dteStatus === 'marginal' ? (
              <span className="text-amber-400">DEGRADED</span>
            ) : (
              <span className="text-rose-400">SEVERED</span>
            )}
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Earth Elevation:</span>
              <span className={earth.elevation > 0 ? 'text-cyan-300' : 'text-rose-400'}>
                {earth.elevation > 0 ? '+' : ''}{earth.elevation.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span>Distance to Earth:</span>
              <span className="text-slate-200">{earth.distanceKm.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span>Link Margin (est):</span>
              <span className="text-slate-200">
                {earth.elevation > 1 ? '+14.2 dB' : earth.elevation > 0 ? '+2.8 dB' : '-18.5 dB'}
              </span>
            </div>
          </div>
        </div>

        {/* Environmental Hazards */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
          <div className="text-purple-400 font-semibold flex items-center justify-between">
            <span>🛡️ FLIGHT RULES CHECK</span>
            <span className="text-[10px] text-slate-500">NASA Standards</span>
          </div>
          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-sky-400 mt-0.5">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
