import { useState, useMemo, useEffect } from 'react';
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
import { ScienceBriefModal } from './components/ScienceBriefModal';

export default function App() {
  const [selectedSite, setSelectedSite] = useState<LandingSite>(DEFAULT_LANDING_SITE);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'radar' | 'surface'>('radar');
  const [showArchived2022, setShowArchived2022] = useState<boolean>(false);

  // Persistent custom sites stored across user sessions
  const [customSites, setCustomSites] = useState<LandingSite[]>(() => {
    try {
      const saved = localStorage.getItem('path_custom_sites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('path_custom_sites', JSON.stringify(customSites));
    } catch {
      // LocalStorage access failure fallback
    }
  }, [customSites]);

  const handleCreateCustomSite = (site: LandingSite) => {
    setCustomSites((prev) => {
      const filtered = prev.filter((s) => s.id !== site.id);
      return [site, ...filtered];
    });
    setSelectedSite(site);
  };

  const handleUpdateCustomSite = (site: LandingSite) => {
    setCustomSites((prev) => prev.map((s) => (s.id === site.id ? site : s)));
    setSelectedSite(site);
  };

  const handleDeleteCustomSite = (siteId: string) => {
    setCustomSites((prev) => prev.filter((s) => s.id !== siteId));
    if (selectedSite.id === siteId) {
      setSelectedSite(DEFAULT_LANDING_SITE);
    }
  };

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
        onOpenScience={() => setIsScienceOpen(true)}
      />

      {/* Main Mission Control Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Row 1: Core Aerospace Mission Deck (Split Screen 12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Target Site Selection & Active Telemetry Status (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SiteSelector
              selectedSite={selectedSite}
              onSelectSite={setSelectedSite}
              customSites={customSites}
              onCreateCustomSite={handleCreateCustomSite}
              onUpdateCustomSite={handleUpdateCustomSite}
              onDeleteCustomSite={handleDeleteCustomSite}
              showArchived2022={showArchived2022}
              onToggleArchived2022={setShowArchived2022}
            />

            <StatusCard
              telemetry={telemetry}
              sunTerrainCutoff={sunTerrainCutoff}
              earthTerrainCutoff={earthTerrainCutoff}
            />
          </div>

          {/* Right Column: 360° Horizon Radar / Surface Map (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                TACTICAL HORIZON VISUALIZER
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveViewTab('radar')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeViewTab === 'radar'
                      ? 'bg-sky-600 text-white font-bold border border-sky-400/50'
                      : 'bg-[#090e18] border border-[#1b263b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛰️ Sky Horizon Radar
                </button>
                <button
                  onClick={() => setActiveViewTab('surface')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeViewTab === 'surface'
                      ? 'bg-sky-600 text-white font-bold border border-sky-400/50'
                      : 'bg-[#090e18] border border-[#1b263b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🗺️ South Pole Surface Map
                </button>
              </div>
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
                customSites={customSites}
                showArchived2022={showArchived2022}
              />
            )}
          </div>
        </div>

        {/* Row 2: Temporal Scrubber & Playback Timeline (Directly Underneath Visualizer) */}
        <TimelineControls
          currentDate={currentDate}
          onChangeDate={setCurrentDate}
          forecastSamples={forecastSamples}
        />

        {/* Row 3: Multi-Site Comparative Leaderboard */}
        <SiteLeaderboard
          currentDate={currentDate}
          selectedSiteId={selectedSite.id}
          onSelectSite={setSelectedSite}
          customSites={customSites}
          showArchived2022={showArchived2022}
        />

        {/* Row 4: Quick Scientific Briefing Box */}
        <div className="bg-[#090e18] border border-[#1b263b] rounded-lg p-3 text-xs font-mono text-slate-400 space-y-1">
          <div className="text-sky-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <span>ℹ️ NASA ARTEMIS III POLAR FLIGHT CRITERIA</span>
          </div>
          <p className="leading-relaxed text-[10px] text-slate-400">
            The Moon's axis is tilted only 1.54°. South Pole crater rims experience grazing solar paths that sweep
            360° horizontally. Artemis III operations require persistent Sun for lander solar array power and direct
            line-of-sight to Earth for unassisted real-time telemetry.
          </p>
        </div>

        {/* Official Mission Report Modal */}
        <MissionReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          site={selectedSite}
          telemetry={telemetry}
          currentDate={currentDate}
        />

        {/* Scientific Methodology & JPL Benchmark Modal */}
        <ScienceBriefModal
          isOpen={isScienceOpen}
          onClose={() => setIsScienceOpen(false)}
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
