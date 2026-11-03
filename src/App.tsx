import { useState, useMemo } from 'react';
import { LandingSite } from './types';
import { DEFAULT_LANDING_SITE } from './data/landingSites';
import { sampleTelemetry, evaluateWindowForecast } from './utils/analyzer';
import { getTerrainElevationCutoff } from './data/terrainMasks';
import { Header } from './components/Header';
import { SiteSelector } from './components/SiteSelector';
import { HorizonRadar } from './components/HorizonRadar';
import { LunarSurfaceMap } from './components/LunarSurfaceMap';
import { StatusCard } from './components/StatusCard';
import { TimelineControls } from './components/TimelineControls';
import { SiteLeaderboard } from './components/SiteLeaderboard';
import { MissionReportModal } from './components/MissionReportModal';

export default function App() {
  const [selectedSite, setSelectedSite] = useState<LandingSite>(DEFAULT_LANDING_SITE);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'radar' | 'surface'>('radar');
  // Default simulation timestamp: October 15, 2026 at 12:00 UTC (Nominal Artemis III exploration frame)
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(Date.UTC(2026, 9, 15, 12, 0, 0))
  );

  // Compute real-time sample telemetry
  const telemetry = useMemo(() => {
    return sampleTelemetry(selectedSite, currentDate);
  }, [selectedSite, currentDate]);

  // Compute 14-day tactical window forecast
  const forecastSamples = useMemo(() => {
    return evaluateWindowForecast(selectedSite, currentDate, 14, 6);
  }, [selectedSite, currentDate]);

  const sunTerrainCutoff = useMemo(() => {
    return getTerrainElevationCutoff(selectedSite.id, telemetry.sun.azimuth);
  }, [selectedSite.id, telemetry.sun.azimuth]);

  const earthTerrainCutoff = useMemo(() => {
    return getTerrainElevationCutoff(selectedSite.id, telemetry.earth.azimuth);
  }, [selectedSite.id, telemetry.earth.azimuth]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        currentDate={currentDate}
        selectedSiteName={selectedSite.name}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Mission Control Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Site Selection & Site Details (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <SiteSelector selectedSite={selectedSite} onSelectSite={setSelectedSite} />

            {/* Quick Scientific Briefing Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 space-y-2">
              <div className="text-sky-400 font-semibold flex items-center gap-2">
                <span>ℹ️ POLAR MISSION FLIGHT CRITERIA</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                The Moon's axis is tilted only 1.54°. South Pole crater rims experience grazing solar paths that sweep
                360° horizontally. Artemis III operations require persistent Sun for lander solar array power and direct
                line-of-sight to Earth for unassisted real-time telemetry.
              </p>
            </div>
          </div>

          {/* Right Column: 360° Horizon Radar / Surface Map Toggle (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-end gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveViewTab('radar')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  activeViewTab === 'radar'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🛰️ Sky Horizon Radar
              </button>
              <button
                onClick={() => setActiveViewTab('surface')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  activeViewTab === 'surface'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🗺️ South Pole Surface Map
              </button>
            </div>

            {activeViewTab === 'radar' ? (
              <HorizonRadar
                sunPosition={telemetry.sun}
                earthPosition={telemetry.earth}
                siteName={selectedSite.name}
                siteId={selectedSite.id}
              />
            ) : (
              <LunarSurfaceMap
                currentDate={currentDate}
                selectedSite={selectedSite}
                onSelectSite={setSelectedSite}
              />
            )}
          </div>
        </div>

        {/* Go/No-Go Mission Status & Telemetry Breakdown */}
        <StatusCard
          telemetry={telemetry}
          sunTerrainCutoff={sunTerrainCutoff}
          earthTerrainCutoff={earthTerrainCutoff}
        />

        {/* Multi-Site Comparative Leaderboard */}
        <SiteLeaderboard
          currentDate={currentDate}
          selectedSiteId={selectedSite.id}
          onSelectSite={setSelectedSite}
        />

        {/* Temporal Scrubber & Playback Timeline */}
        <TimelineControls
          currentDate={currentDate}
          onChangeDate={setCurrentDate}
          forecastSamples={forecastSamples}
        />

        {/* Official Mission Report Modal */}
        <MissionReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          site={selectedSite}
          telemetry={telemetry}
          currentDate={currentDate}
        />
      </main>

      {/* Footer Attribution */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 mt-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Project P.A.T.H. • NASA Space Apps Challenge 2026</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>NASA Moon Trek WMTS</span>
            <span>•</span>
            <span>LRO LOLA Topography</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
