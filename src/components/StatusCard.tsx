import React from 'react';
import { TelemetrySample } from '../types';
import { SOLAR_CONSTANT_W_M2 } from '../utils/analyzer';

interface StatusCardProps {
  telemetry: TelemetrySample;
  sunTerrainCutoff: number;
  earthTerrainCutoff: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  telemetry,
  sunTerrainCutoff,
  earthTerrainCutoff,
}) => {
  const { windowRating, solarIlluminationFraction, dteStatus, sun, earth, reasons } = telemetry;

  // Compute estimated incident solar power on a standard 10 m^2 vertical solar array (4-sided polar configuration)
  const solarFlux = Math.round(solarIlluminationFraction * SOLAR_CONSTANT_W_M2);
  const totalPowerWatts = Math.round(solarFlux * 10 * 0.32); // 32% high-efficiency triple-junction cells

  const sunClearance = sun.elevation - sunTerrainCutoff;
  const earthClearance = earth.elevation - earthTerrainCutoff;

  let bannerClass = 'bg-rose-950/30 border-rose-800/80 text-rose-300';
  let badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
  let statusTitle = 'NO-GO: TOPOGRAPHIC OCCLUSION HAZARD';

  if (windowRating === 'optimal') {
    bannerClass = 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    statusTitle = 'GO: OPTIMAL ILLUMINATION & DTE WINDOW';
  } else if (windowRating === 'marginal') {
    bannerClass = 'bg-amber-950/30 border-amber-800/80 text-amber-300';
    badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    statusTitle = 'CAUTION: GRAZING POWER / MARGINAL LINE-OF-SIGHT';
  }

  return (
    <div className="bg-[#090e18] border border-[#1b263b] rounded-lg p-3.5 space-y-3 font-mono">
      {/* Top Banner Decision Matrix */}
      <div className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ${bannerClass}`}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor} uppercase tracking-wider`}>
              STATUS: {windowRating}
            </span>
            <span className="text-[10px] tracking-wider text-slate-400">
              NASA FLIGHT DYNAMICS DISPATCH SCREENING
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">{statusTitle}</h3>
        </div>

        <div className="text-xs text-right sm:border-l sm:border-current/20 sm:pl-3">
          <div className="text-[10px] text-slate-400">DTE LINK STATE</div>
          <div className={`font-bold uppercase tracking-wider text-xs ${
            dteStatus === 'connected' ? 'text-emerald-400' : dteStatus === 'marginal' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {dteStatus}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        {/* Photovoltaic Generation */}
        <div className="bg-[#060a12] border border-[#172235] p-3 rounded-md space-y-2">
          <div className="text-amber-400 font-semibold flex items-center justify-between text-[11px]">
            <span>⚡ PHOTOVOLTAIC YIELD</span>
            <span className="text-[10px] text-slate-500">10m² Array</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100">
            {totalPowerWatts} <span className="text-xs font-normal text-slate-400">Watts</span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400 pt-1.5 border-t border-[#172235]">
            <div className="flex justify-between">
              <span>Incident AM0 Flux:</span>
              <span className="text-slate-200">{solarFlux} W/m²</span>
            </div>
            <div className="flex justify-between">
              <span>Sun Elevation:</span>
              <span className={sun.elevation > 0 ? 'text-amber-300' : 'text-rose-400'}>
                {sun.elevation > 0 ? '+' : ''}{sun.elevation.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span>LOLA Ridge Margin:</span>
              <span className={sunClearance > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {sunClearance > 0 ? '+' : ''}{sunClearance.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* Radio DTE Communications */}
        <div className="bg-[#060a12] border border-[#172235] p-3 rounded-md space-y-2">
          <div className="text-cyan-400 font-semibold flex items-center justify-between text-[11px]">
            <span>📡 DIRECT-TO-EARTH (DTE)</span>
            <span className="text-[10px] text-slate-500">Deep Space Network</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 uppercase mt-0.5">
            {dteStatus === 'connected' ? (
              <span className="text-emerald-400">CLEAR LINE-OF-SIGHT</span>
            ) : dteStatus === 'marginal' ? (
              <span className="text-amber-400">MARGINAL MULTIPATH</span>
            ) : (
              <span className="text-rose-400">COMM BLACKOUT</span>
            )}
          </div>
          <div className="space-y-1 text-[10px] text-slate-400 pt-1.5 border-t border-[#172235]">
            <div className="flex justify-between">
              <span>Earth Elevation:</span>
              <span className={earth.elevation > 0 ? 'text-cyan-300' : 'text-rose-400'}>
                {earth.elevation > 0 ? '+' : ''}{earth.elevation.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span>Local Ridge Mask:</span>
              <span className="text-slate-300">+{earthTerrainCutoff.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Topographic Margin:</span>
              <span className={earthClearance > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {earthClearance > 0 ? '+' : ''}{earthClearance.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* LOLA Horizon Profile Rules */}
        <div className="bg-[#060a12] border border-[#172235] p-3 rounded-md space-y-1.5">
          <div className="text-sky-400 font-semibold flex items-center justify-between text-[11px]">
            <span>🛡️ TOPOGRAPHIC EVALUATION</span>
            <span className="text-[10px] text-slate-500">LRO DEM (512 px/deg)</span>
          </div>
          <div className="space-y-1.5 text-[10px] text-slate-300 leading-snug pt-1">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-sky-400 select-none">•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
