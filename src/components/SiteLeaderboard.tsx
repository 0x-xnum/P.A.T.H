import React from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { sampleTelemetry } from '../utils/analyzer';

interface SiteLeaderboardProps {
  currentDate: Date;
  selectedSiteId: string;
  onSelectSite: (site: LandingSite) => void;
}

interface RankedSiteItem {
  site: LandingSite;
  score: number;
  sunElev: number;
  earthElev: number;
  rating: 'optimal' | 'marginal' | 'hazardous';
}

export const SiteLeaderboard: React.FC<SiteLeaderboardProps> = ({
  currentDate,
  selectedSiteId,
  onSelectSite,
}) => {
  // Compute rankings across all 12 official Artemis sites for the current timestamp
  const rankedSites: RankedSiteItem[] = ARTEMIS_CANDIDATE_SITES.map((site) => {
    const telemetry = sampleTelemetry(site, currentDate);

    // Score Formulation:
    // Sun Elevation weight: 50% (Max score if Sun > 1.5 deg)
    // Earth Elevation weight: 50% (Max score if Earth > 3.0 deg)
    let sunScore = 0;
    if (telemetry.sun.elevation > 0) {
      sunScore = Math.min(50, (telemetry.sun.elevation / 1.5) * 50);
    }

    let earthScore = 0;
    if (telemetry.earth.elevation > 0) {
      earthScore = Math.min(50, (telemetry.earth.elevation / 3.0) * 50);
    }

    const totalScore = Math.round(Math.max(0, Math.min(100, sunScore + earthScore)));

    return {
      site,
      score: totalScore,
      sunElev: telemetry.sun.elevation,
      earthElev: telemetry.earth.elevation,
      rating: telemetry.windowRating,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            Candidate Site Feasibility Leaderboard
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Comparative Screening Matrix Across All Official Artemis Regions
          </p>
        </div>
        <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded">
          {rankedSites.filter((s) => s.rating === 'optimal').length} Sites Currently GO
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Candidate Region</th>
              <th className="py-2.5 px-3 text-center">Feasibility Score</th>
              <th className="py-2.5 px-3 text-right">Sun Elev</th>
              <th className="py-2.5 px-3 text-right">Earth Elev</th>
              <th className="py-2.5 px-3 text-center">Dispatch Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rankedSites.map((item, index) => {
              const isSelected = item.site.id === selectedSiteId;

              let statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  NO-GO
                </span>
              );

              if (item.rating === 'optimal') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    GO
                  </span>
                );
              } else if (item.rating === 'marginal') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    CAUTION
                  </span>
                );
              }

              return (
                <tr
                  key={item.site.id}
                  className={`transition-colors hover:bg-slate-800/50 ${
                    isSelected ? 'bg-sky-500/10 border-l-2 border-sky-400' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-slate-400 font-bold">#{index + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{item.site.name}</div>
                    <div className="text-[10px] text-slate-500">{item.site.designation}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 font-bold">
                      <span
                        className={
                          item.score >= 75
                            ? 'text-emerald-400'
                            : item.score >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {item.score}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                    </div>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-semibold ${
                      item.sunElev > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {item.sunElev > 0 ? '+' : ''}
                    {item.sunElev.toFixed(2)}°
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-semibold ${
                      item.earthElev > 0 ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {item.earthElev > 0 ? '+' : ''}
                    {item.earthElev.toFixed(2)}°
                  </td>
                  <td className="py-3 px-3 text-center">{statusBadge}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectSite(item.site)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                        isSelected
                          ? 'bg-sky-500 text-black font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
