import React from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { sampleTelemetry } from '../utils/analyzer';
import { getTerrainElevationCutoff } from '../data/terrainMasks';

interface SiteLeaderboardProps {
  currentDate: Date;
  selectedSiteId: string;
  onSelectSite: (site: LandingSite) => void;
  customSites: LandingSite[];
  showArchived2022: boolean;
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
  customSites,
  showArchived2022,
}) => {
  const visibleOfficialSites = showArchived2022
    ? ARTEMIS_CANDIDATE_SITES
    : ARTEMIS_CANDIDATE_SITES.filter((s) => s.category === '2024-refined');

  const allSitesToRank = [...visibleOfficialSites, ...customSites];

  // Compute rankings across all active candidates & custom targets for current timestamp
  const rankedSites: RankedSiteItem[] = allSitesToRank
    .map((site) => {
      const telemetry = sampleTelemetry(site, currentDate);
      const sunMask = getTerrainElevationCutoff(site.id, telemetry.sun.azimuth);
      const earthMask = getTerrainElevationCutoff(site.id, telemetry.earth.azimuth);

      const sunClearance = telemetry.sun.elevation - sunMask;
      const earthClearance = telemetry.earth.elevation - earthMask;

      // Authentic NASA Multi-Factor Feasibility Scoring (0 - 100):
      // Gated by LOLA Topographic Horizon Profile Clearance & Flight Rules:
      let score = 0;

      if (telemetry.windowRating === 'optimal') {
        // Safe site: Sun clears local ridge, Earth clears crater rim
        // Sun score (0 - 45): full marks if sunClearance >= 1.0 deg above ridge
        const sunScore = Math.min(45, Math.max(15, (Math.max(0, sunClearance) / 1.0) * 45));
        // Earth score (0 - 45): full marks if earthClearance >= 3.0 deg above terrain
        const earthScore = Math.min(45, Math.max(15, (Math.max(0, earthClearance) / 3.0) * 45));
        // Science Bonus (0 - 10): reward for proximity to Permanently Shadowed Region (PSR) volatiles
        const scienceBonus = site.permanentlyShadowedNearby ? 10 : 5;
        score = Math.round(Math.min(100, sunScore + earthScore + scienceBonus));
      } else if (telemetry.windowRating === 'marginal') {
        // Caution site: grazing sun or marginal RF line-of-sight
        const sunScore = Math.min(30, Math.max(5, (Math.max(0, sunClearance) / 0.5) * 30));
        const earthScore = Math.min(30, Math.max(5, (Math.max(0, earthClearance) / 1.5) * 30));
        score = Math.round(Math.min(65, Math.max(35, sunScore + earthScore + 5)));
      } else {
        // Hazardous site (NO-GO): Fatal terrain occlusion or comms blackout
        // Heavily penalized! A NO-GO site must NEVER score above a viable landing site.
        let partialViability = 0;
        if (sunClearance > 0) partialViability += 12; // sun is clear but comms is occluded
        if (earthClearance > 0) partialViability += 12; // comms clear but solar power occluded
        score = Math.round(Math.min(28, Math.max(5, partialViability)));
      }

      return {
        site,
        score,
        sunElev: telemetry.sun.elevation,
        earthElev: telemetry.earth.elevation,
        rating: telemetry.windowRating,
      };
    })
    .sort((a, b) => {
      // Priority 1: Optimal (GO) sites must ALWAYS rank above Marginal and Hazardous
      const ratingWeight = { optimal: 3, marginal: 2, hazardous: 1 };
      const ratingDiff = ratingWeight[b.rating] - ratingWeight[a.rating];
      if (ratingDiff !== 0) return ratingDiff;

      // Priority 2: Higher composite feasibility score
      if (b.score !== a.score) return b.score - a.score;

      // Priority 3: Higher Sun elevation margin
      return b.sunElev - a.sunElev;
    });

  return (
    <div className="bg-[#090e18] border border-[#1b263b] rounded-lg p-3.5 space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1b263b] pb-2.5">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            CANDIDATE SITE FEASIBILITY MATRIX
          </h2>
          <p className="text-[10px] text-slate-500">
            Comparative Screening Matrix Across Artemis Regions &amp; Custom Targets ({rankedSites.length} Sites)
          </p>
        </div>
        <span className="text-[11px] text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded">
          {rankedSites.filter((s) => s.rating === 'optimal').length} Sites Currently GO
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#1b263b] text-[10px] text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Candidate Region</th>
              <th className="py-2 px-3 text-center">Feasibility Score</th>
              <th className="py-2 px-3 text-right">Sun Elev</th>
              <th className="py-2 px-3 text-right">Earth Elev</th>
              <th className="py-2 px-3 text-center">Dispatch Status</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172235]">
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
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isSelected ? 'bg-sky-500/10 border-l-2 border-l-sky-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#{index + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-semibold">{item.site.name}</span>
                      {item.site.category === 'custom' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-950 border border-sky-700 text-sky-300">
                          CUSTOM
                        </span>
                      )}
                      {item.site.category === '2022-historical' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 border border-slate-700 text-slate-400">
                          2022 ARCHIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{item.site.designation}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block font-bold ${
                        item.score >= 80
                          ? 'text-emerald-400'
                          : item.score >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {item.score}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={
                        item.sunElev > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'
                      }
                    >
                      {item.sunElev > 0 ? `+${item.sunElev.toFixed(2)}°` : `${item.sunElev.toFixed(2)}°`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={
                        item.earthElev > 0 ? 'text-sky-300 font-semibold' : 'text-rose-400'
                      }
                    >
                      {item.earthElev > 0 ? `+${item.earthElev.toFixed(2)}°` : `${item.earthElev.toFixed(2)}°`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{statusBadge}</td>
                  <td className="py-2.5 px-3 text-right">
                    {isSelected ? (
                      <span className="text-[11px] text-sky-400 font-bold">ACTIVE</span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectSite(item.site);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded bg-[#0e1726] border border-[#22354f] hover:bg-sky-600 hover:text-white text-slate-300 transition-colors text-[11px]"
                      >
                        Inspect
                      </button>
                    )}
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
