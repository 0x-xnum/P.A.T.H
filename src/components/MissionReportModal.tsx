import React, { useState, useMemo } from 'react';
import { LandingSite, TelemetrySample } from '../types';
import { formatCoordinates } from '../utils/coordinates';
import { evaluateWindowForecast, calculatePhotovoltaicPowerWatts } from '../utils/analyzer';

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: LandingSite;
  telemetry: TelemetrySample;
  currentDate: Date;
}

type MissionDurationId = 'instant' | '24h' | '7d' | '14d' | '30d';

interface DurationOption {
  id: MissionDurationId;
  label: string;
  badge?: string;
  days: number;
  stepHours: number;
  description: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    id: 'instant',
    label: 'Instantaneous',
    days: 0,
    stepHours: 0,
    description: 'Epoch snapshot',
  },
  {
    id: '24h',
    label: '24-Hour Sol',
    badge: '1-Sol EVA',
    days: 1,
    stepHours: 1,
    description: 'Single EVA excursion',
  },
  {
    id: '7d',
    label: '7-Day Nominal',
    badge: 'NASA Artemis III Baseline',
    days: 7,
    stepHours: 3,
    description: 'Nominal surface stay',
  },
  {
    id: '14d',
    label: '14-Day Tactical',
    badge: 'Polar Sunlit Pass',
    days: 14,
    stepHours: 6,
    description: 'Max continuous sunlight pass',
  },
  {
    id: '30d',
    label: '30-Day Sol Cycle',
    badge: 'Full Rotation',
    days: 30,
    stepHours: 12,
    description: 'Full 29.5-day synodic lunar sol',
  },
];

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  onClose,
  site,
  telemetry,
  currentDate,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<MissionDurationId>('7d');

  const activeDurationConfig = useMemo(() => {
    return DURATION_OPTIONS.find((d) => d.id === selectedDuration) || DURATION_OPTIONS[2];
  }, [selectedDuration]);

  // Compute telemetry samples based on chosen duration
  const samples: TelemetrySample[] = useMemo(() => {
    if (selectedDuration === 'instant') {
      return [telemetry];
    }
    return evaluateWindowForecast(
      site,
      currentDate,
      activeDurationConfig.days,
      activeDurationConfig.stepHours
    );
  }, [site, currentDate, selectedDuration, activeDurationConfig, telemetry]);

  // Compute cumulative mission viability statistics
  const windowMetrics = useMemo(() => {
    const totalSamples = samples.length;

    if (selectedDuration === 'instant') {
      const instantPowerWatts = calculatePhotovoltaicPowerWatts(
        telemetry.solarIlluminationFraction,
        telemetry.sun.elevation
      );
      return {
        totalHours: 0,
        totalSamples: 1,
        sunlitPercent: telemetry.solarIlluminationFraction > 0 ? 100 : 0,
        dtePercent: telemetry.dteStatus === 'connected' ? 100 : telemetry.dteStatus === 'marginal' ? 50 : 0,
        longestGoHours: telemetry.windowRating === 'optimal' ? 1 : 0,
        cumulativeKWh: Number(((instantPowerWatts / 1000) * 1).toFixed(2)),
        minPowerWatts: instantPowerWatts,
        maxPowerWatts: instantPowerWatts,
        avgPowerWatts: instantPowerWatts,
        overallRating: telemetry.windowRating,
        hazardCount: telemetry.windowRating === 'hazardous' ? 1 : 0,
        marginalCount: telemetry.windowRating === 'marginal' ? 1 : 0,
        optimalCount: telemetry.windowRating === 'optimal' ? 1 : 0,
        minEarthElevation: telemetry.earth.elevation,
        maxEarthElevation: telemetry.earth.elevation,
        minSunElevation: telemetry.sun.elevation,
        maxSunElevation: telemetry.sun.elevation,
      };
    }

    const stepHours = activeDurationConfig.stepHours;
    const totalHours = activeDurationConfig.days * 24;

    let sunlitCount = 0;
    let dteSafeCount = 0;
    let minPower = Infinity;
    let maxPower = -Infinity;
    let sumPower = 0;
    let hazardCount = 0;
    let marginalCount = 0;
    let optimalCount = 0;

    let minEarthElevation = Infinity;
    let maxEarthElevation = -Infinity;
    let minSunElevation = Infinity;
    let maxSunElevation = -Infinity;

    // Continuous safe streak tracking
    let currentStreak = 0;
    let maxStreak = 0;

    const samplePowers = samples.map((sample) => {
      const power = calculatePhotovoltaicPowerWatts(
        sample.solarIlluminationFraction,
        sample.sun.elevation
      );
      sumPower += power;
      minPower = Math.min(minPower, power);
      maxPower = Math.max(maxPower, power);

      minEarthElevation = Math.min(minEarthElevation, sample.earth.elevation);
      maxEarthElevation = Math.max(maxEarthElevation, sample.earth.elevation);
      minSunElevation = Math.min(minSunElevation, sample.sun.elevation);
      maxSunElevation = Math.max(maxSunElevation, sample.sun.elevation);

      if (sample.solarIlluminationFraction > 0) {
        sunlitCount++;
      }
      if (sample.dteStatus === 'connected' || sample.dteStatus === 'marginal') {
        dteSafeCount++;
      }

      if (sample.windowRating === 'hazardous') {
        hazardCount++;
        currentStreak = 0;
      } else {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
        if (sample.windowRating === 'optimal') {
          optimalCount++;
        } else {
          marginalCount++;
        }
      }
      return power;
    });

    // Rigorous numerical integration using the Trapezoidal Rule across N-1 time intervals
    let totalKWh = 0;
    for (let i = 0; i < samplePowers.length - 1; i++) {
      const avgIntervalPowerWatts = (samplePowers[i] + samplePowers[i + 1]) / 2;
      totalKWh += (avgIntervalPowerWatts / 1000) * stepHours;
    }

    const sunlitPercent = Math.round((sunlitCount / totalSamples) * 100);
    const dtePercent = Math.round((dteSafeCount / totalSamples) * 100);
    const longestGoHours = Math.round(maxStreak * stepHours);
    const avgPowerWatts = Math.round(sumPower / totalSamples);

    let overallRating: 'optimal' | 'marginal' | 'hazardous' = 'optimal';
    if (hazardCount > 0 && hazardCount / totalSamples > 0.1) {
      overallRating = 'hazardous';
    } else if (hazardCount > 0 || optimalCount / totalSamples < 0.7) {
      overallRating = 'marginal';
    } else {
      overallRating = 'optimal';
    }

    return {
      totalHours,
      totalSamples,
      sunlitPercent,
      dtePercent,
      longestGoHours,
      cumulativeKWh: Number(totalKWh.toFixed(1)),
      minPowerWatts: minPower === Infinity ? 0 : minPower,
      maxPowerWatts: maxPower === -Infinity ? 0 : maxPower,
      avgPowerWatts,
      overallRating,
      hazardCount,
      marginalCount,
      optimalCount,
      minEarthElevation,
      maxEarthElevation,
      minSunElevation,
      maxSunElevation,
    };
  }, [samples, selectedDuration, activeDurationConfig, telemetry]);

  // Downsample waypoints for printable table display (keep 8-12 rows)
  const waypointsToDisplay = useMemo(() => {
    if (selectedDuration === 'instant') return samples;
    const targetRows = 9;
    const stride = Math.max(1, Math.floor(samples.length / targetRows));
    const result: { sample: TelemetrySample; metHours: number }[] = [];

    samples.forEach((sample, idx) => {
      if (idx % stride === 0 || idx === samples.length - 1) {
        result.push({
          sample,
          metHours: idx * activeDurationConfig.stepHours,
        });
      }
    });
    return result;
  }, [samples, selectedDuration, activeDurationConfig]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportPayload = {
      project: 'Project P.A.T.H. (Polar Artemis Telemetry & Horizon-Planner)',
      challenge: 'NASA Space Apps Challenge 2026 - Lunar Landing Site Navigator',
      event: 'Cairo Local Event (IEEE Egypt Section / Elsewedy University of Technology)',
      documentRef: `PATH-ART3-SCREENING-${site.designation}`,
      classification: 'INDEPENDENT STUDY // EDUCATIONAL SCREENING PROTOTYPE',
      disclaimer: 'Independent prototype developed for NASA Space Apps 2026. Not an official NASA flight dynamics dispatch tool.',
      generationTimestampUtc: new Date().toISOString(),
      evaluationStartUtc: currentDate.toISOString(),
      evaluationDuration: activeDurationConfig.label,
      durationDays: activeDurationConfig.days,
      targetSite: {
        id: site.id,
        name: site.name,
        designation: site.designation,
        coordinates: site.coordinates,
        elevationMeters: site.coordinates.elevationMeters,
        description: site.description,
        permanentlyShadowedNearby: site.permanentlyShadowedNearby,
        scientificValue: site.scientificValue,
        officialCitation: site.officialCitation,
      },
      cumulativeViabilityScorecard: {
        flightVerdict:
          windowMetrics.overallRating === 'optimal'
            ? 'NOMINAL SCREENING WINDOW'
            : windowMetrics.overallRating === 'marginal'
            ? 'ADVISORY: MARGINAL OPERATIONAL WINDOW'
            : 'HAZARD: OCCLUSION / COMMS BLACKOUT DETECTED',
        totalEvaluatedHours: windowMetrics.totalHours,
        solarIlluminationUptimePercent: windowMetrics.sunlitPercent,
        directToEarthCommsUptimePercent: windowMetrics.dtePercent,
        longestContinuousSafeWindowHours: windowMetrics.longestGoHours,
        cumulativeEnergyHarvestKWh: windowMetrics.cumulativeKWh,
        minPowerWatts: windowMetrics.minPowerWatts,
        maxPowerWatts: windowMetrics.maxPowerWatts,
        avgPowerWatts: windowMetrics.avgPowerWatts,
        minEarthElevationDeg: Number(windowMetrics.minEarthElevation.toFixed(2)),
        maxEarthElevationDeg: Number(windowMetrics.maxEarthElevation.toFixed(2)),
      },
      fullTimeSeriesTelemetry: samples,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(reportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `PATH_Artemis_Brief_${site.designation}_${selectedDuration}_${currentDate.toISOString().slice(0, 10)}.json`
    );
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const windowEndDate = new Date(
    currentDate.getTime() + (activeDurationConfig.days * 24 * 3600 * 1000 || 0)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Header Document Block */}
        <div className="border-b-2 border-slate-700 pb-5 print:border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40 print:border-black print:text-black print:bg-slate-100">
                  PROJECT P.A.T.H. • NASA SPACE APPS 2026
                </span>
                <span className="text-[10px] font-mono text-slate-400 print:text-black">
                  INDEPENDENT LUNAR SCREENING PROTOTYPE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-1.5 print:text-black">
                ARTEMIS III LUNAR SURFACE SCREENING BRIEF
              </h1>
              <div className="text-xs font-mono text-slate-400 mt-0.5 print:text-black">
                REPORT REF:{' '}
                <span className="text-sky-400 font-bold print:text-black">
                  PATH-ART3-SCREENING-{site.designation}
                </span>{' '}
                • REV: 2026.4
              </div>
            </div>

            <div className="sm:text-right text-xs font-mono bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg print:border-black print:bg-white print:p-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider print:text-black">
                Evaluation Window
              </div>
              <div className="font-bold text-slate-200 text-xs print:text-black">
                {currentDate.toISOString().slice(0, 16).replace('T', ' ')} UTC
              </div>
              {selectedDuration !== 'instant' && (
                <div className="text-[11px] text-sky-400 font-semibold print:text-black">
                  to {windowEndDate.toISOString().slice(0, 16).replace('T', ' ')} UTC
                </div>
              )}
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 print:text-black">
                STATUS: INDEPENDENT OPEN STUDY // SPACE APPS CAIRO
              </div>
            </div>
          </div>
        </div>

        {/* Mission Operational Duration Selector Tabs (Hidden in Print) */}
        <div className="print:hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Mission Duration Window Analysis
            </span>
            <span className="text-[11px] font-mono text-sky-400">
              {activeDurationConfig.description}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDuration(opt.id)}
                  className={`px-3 py-2 rounded-lg text-left font-mono transition-all duration-150 ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  {opt.badge && (
                    <div
                      className={`text-[9px] truncate mt-0.5 ${
                        isSelected ? 'text-sky-100' : 'text-slate-500'
                      }`}
                    >
                      {opt.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Mission Screening Verdict Banner */}
        <div
          className={`p-4 rounded-xl border-2 text-center font-mono transition-colors ${
            windowMetrics.overallRating === 'optimal'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 print:bg-emerald-50 print:border-emerald-700 print:text-emerald-950'
              : windowMetrics.overallRating === 'marginal'
              ? 'bg-amber-950/40 border-amber-500 text-amber-300 print:bg-amber-50 print:border-amber-700 print:text-amber-950'
              : 'bg-rose-950/40 border-rose-500 text-rose-300 print:bg-rose-50 print:border-rose-700 print:text-rose-950'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-black">
            <span>TACTICAL MISSION SCREENING VERDICT</span>
            <span>•</span>
            <span>{activeDurationConfig.label.toUpperCase()} WINDOW</span>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">
            {windowMetrics.overallRating === 'optimal'
              ? 'TACTICAL SCREENING: NOMINAL ILLUMINATION & DTE VISIBILITY'
              : windowMetrics.overallRating === 'marginal'
              ? 'TACTICAL SCREENING: ADVISORY (GRAZING SOLAR / MARGINAL COMMS)'
              : 'TACTICAL SCREENING: OCCLUSION / COMMS BLACKOUT HAZARD'}
          </div>
          <p className="text-xs mt-1.5 opacity-90 max-w-2xl mx-auto font-sans print:font-mono">
            {windowMetrics.overallRating === 'optimal'
              ? `Site provides continuous solar clearance over local LOLA ridge profiles with persistent geometric Direct-to-Earth line-of-sight across ${activeDurationConfig.label}. Nominal for Artemis III crewed surface stay.`
              : windowMetrics.overallRating === 'marginal'
              ? `Low-elevation grazing solar path or marginal Earth elevation detected during window. Supplementary battery reserves and orbital relay readiness recommended.`
              : `Site experiences terrain occlusion or line-of-sight blackout behind crater rim obstacle masks. Risk of thermal freeze and telecommunication outage.`}
          </p>
        </div>

        {/* Cumulative Feasibility Scorecard Grid */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] print:text-black">
            Mission Feasibility & Environmental Scorecard ({activeDurationConfig.label})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Solar Uptime */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
              <span className="text-[10px] text-amber-400 font-bold block uppercase print:text-amber-700">
                ⚡ Solar Illumination
              </span>
              <div className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                {windowMetrics.sunlitPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 print:text-black">
                Peak: <span className="font-bold text-amber-300">{windowMetrics.maxPowerWatts} W</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                Sun El: {windowMetrics.minSunElevation.toFixed(1)}° to {windowMetrics.maxSunElevation.toFixed(1)}°
              </div>
            </div>

            {/* Metric 2: DTE Link Uptime */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase print:text-cyan-700">
                📡 Direct-to-Earth Link
              </span>
              <div className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                {windowMetrics.dtePercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 print:text-black">
                Earth El: <span className="font-bold text-cyan-300">+{windowMetrics.minEarthElevation.toFixed(1)}° min</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                Clear of LOLA ridge mask
              </div>
            </div>

            {/* Metric 3: Longest Safe Window */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase print:text-emerald-700">
                ⏱️ Uninterrupted GO Window
              </span>
              <div className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                {windowMetrics.longestGoHours}h
              </div>
              <div className="text-[10px] text-slate-400 mt-1 print:text-black">
                Safe continuous operations
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                Hazard outages: {windowMetrics.hazardCount} steps
              </div>
            </div>

            {/* Metric 4: Cumulative Energy Harvest */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
              <span className="text-[10px] text-purple-400 font-bold block uppercase print:text-purple-700">
                🔋 10m² Array Energy
              </span>
              <div className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                {windowMetrics.cumulativeKWh} <span className="text-xs font-normal">kWh</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 print:text-black">
                Avg Generation: <span className="font-bold text-slate-200">{windowMetrics.avgPowerWatts} W</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                AM0 Flux: 1361 W/m² (32% eff)
              </div>
            </div>
          </div>
        </div>

        {/* Visual Chronological Flight Timeline Strip */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold print:text-black">
            <span>Chronological Mission Timeline Gantt ({samples.length} Timesteps)</span>
            <span>
              {activeDurationConfig.stepHours > 0 ? `Step: ${activeDurationConfig.stepHours}h` : 'Epoch'}
            </span>
          </div>

          {/* Timeline Bar */}
          <div className="flex h-5 w-full rounded-md overflow-hidden border border-slate-700 print:border-black">
            {samples.map((s, idx) => {
              const bgClass =
                s.windowRating === 'optimal'
                  ? 'bg-emerald-500'
                  : s.windowRating === 'marginal'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
              const met = idx * activeDurationConfig.stepHours;
              return (
                <div
                  key={idx}
                  className={`flex-1 ${bgClass} hover:opacity-80 transition-opacity`}
                  title={`MET +${met}h (${s.timestamp.slice(0, 16).replace('T', ' ')} UTC): ${s.windowRating.toUpperCase()}`}
                />
              );
            })}
          </div>

          {/* Legend and Time Markers */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 print:text-black pt-0.5">
            <div>T+00h (Touchdown)</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Optimal GO
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Marginal Caution
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Occlusion Hazard
              </span>
            </div>
            <div>
              {selectedDuration === 'instant' ? 'T+00h' : `T+${activeDurationConfig.days * 24}h`}
            </div>
          </div>
        </div>

        {/* Target Site Specification */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] print:text-black">
            Target Landing Site Specifications
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">SITE NAME</span>
              <span className="font-semibold text-slate-200 print:text-black">{site.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">COORDINATES</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {formatCoordinates(site.coordinates)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">ELEVATION</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {site.coordinates.elevationMeters ?? 0} m
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">PSR PROXIMITY</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {site.permanentlyShadowedNearby ? 'Yes (< 2 km Cold Trap)' : 'None within 2 km'}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Dispatch Waypoints Table */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] print:text-black">
            Operational Mission Waypoints Schedule ({waypointsToDisplay.length} Key Epochs)
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 print:border-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 print:bg-slate-200 print:text-black print:border-black">
                  <th className="p-2">MET</th>
                  <th className="p-2">EPOCH (UTC)</th>
                  <th className="p-2">SUN EL / AZ</th>
                  <th className="p-2">PV POWER</th>
                  <th className="p-2">EARTH EL</th>
                  <th className="p-2">DTE LINK</th>
                  <th className="p-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                {waypointsToDisplay.map((item, i) => {
                  const s = 'sample' in item ? item.sample : item;
                  const met = 'metHours' in item ? `T+${item.metHours}h` : 'T+00h';
                  const pwr = calculatePhotovoltaicPowerWatts(
                    s.solarIlluminationFraction,
                    s.sun.elevation
                  );

                  return (
                    <tr
                      key={i}
                      className="hover:bg-slate-900/40 text-[11px] print:hover:bg-transparent"
                    >
                      <td className="p-2 font-bold text-sky-400 print:text-black">{met}</td>
                      <td className="p-2 text-slate-300 print:text-black">
                        {s.timestamp.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black">
                        {s.sun.elevation.toFixed(1)}° / {s.sun.azimuth.toFixed(0)}°
                      </td>
                      <td className="p-2 font-bold text-amber-400 print:text-black">
                        {pwr} W
                      </td>
                      <td className="p-2 text-slate-300 print:text-black">
                        +{s.earth.elevation.toFixed(1)}°
                      </td>
                      <td className="p-2">
                        <span
                          className={`uppercase text-[10px] font-bold ${
                            s.dteStatus === 'connected'
                              ? 'text-emerald-400 print:text-emerald-800'
                              : s.dteStatus === 'marginal'
                              ? 'text-amber-400 print:text-amber-800'
                              : 'text-rose-400 print:text-rose-800'
                          }`}
                        >
                          {s.dteStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            s.windowRating === 'optimal'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 print:bg-emerald-100 print:text-emerald-900'
                              : s.windowRating === 'marginal'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-700/50 print:bg-amber-100 print:text-amber-900'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-700/50 print:bg-rose-100 print:text-rose-900'
                          }`}
                        >
                          {s.windowRating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Topographic & Scientific Methodology Footnote */}
        <div className="space-y-1.5 font-mono text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] print:text-black">
            Methodology &amp; Simulation Prototype Disclaimers
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed print:text-black">
            <strong>Educational Prototype Notice:</strong> Project P.A.T.H. is an independent interactive simulation tool developed for the NASA Space Apps Challenge 2026. It is not an official NASA flight dynamics system. Celestial positions are generated via an analytical client-side ephemeris calibrated against NASA JPL Horizons DE441 (&lt; 0.5° mean error). Horizon obstacle profiles are synthetic 24-point azimuth masks parameterized from NASA LRO LOLA polar DEM data (512 px/deg). Power generation models an omnidirectional 10m² multi-faceted vertical polar array (3.18 m² projected cross-section, 32% efficiency) under AM0 flux (1361 W/m²). Direct-to-Earth visibility evaluates geometric line-of-sight above obstacle profiles, excluding RF antenna patterns and space network link margins.
          </p>
        </div>

        {/* Modal Actions (Hidden in Print) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs transition-colors"
          >
            Close Brief
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sky-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export Full Flight JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/30 flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print / Save Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
