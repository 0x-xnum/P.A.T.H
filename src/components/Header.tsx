import React from 'react';

interface HeaderProps {
  currentDate: Date;
  selectedSiteName: string;
  onOpenReport: () => void;
  onOpenScience: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  selectedSiteName,
  onOpenReport,
  onOpenScience,
}) => {
  const formattedUtc = currentDate.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

  return (
    <header className="border-b border-[#1b2537] bg-[#070b12] text-slate-200 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: NASA Identification & System ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#0e1726] border border-[#23354f] font-mono font-bold text-xs text-sky-400">
            <span className="tracking-tighter">P•A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 font-bold border border-sky-800/60 uppercase tracking-wider">
                NASA ARTEMIS III
              </span>
              <h1 className="text-sm sm:text-base font-bold font-mono tracking-tight text-slate-100">
                PROJECT P.A.T.H.
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">
                MOD-OPS // REV 2026.4
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Polar Artemis Telemetry &amp; Horizon-Planner • OpenMCT Console
            </p>
          </div>
        </div>

        {/* Right: Master Time Conductor, Active Target & Dispatch Action */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-[#0b121e] border border-[#1b273b] px-2.5 py-1 rounded flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">TGT:</span>
            <span className="text-slate-200 font-semibold truncate max-w-[140px] sm:max-w-none">
              {selectedSiteName}
            </span>
          </div>

          <div className="bg-[#0b121e] border border-[#1b273b] px-2.5 py-1 rounded flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500 text-[10px]">UTC:</span>
            <span className="text-slate-200 font-semibold">{formattedUtc}</span>
          </div>

          <button
            onClick={onOpenScience}
            className="bg-[#0e1726] hover:bg-[#15233a] border border-[#22354f] text-slate-300 hover:text-sky-300 px-2.5 py-1 rounded transition-colors text-[11px] flex items-center gap-1"
          >
            <span>🔬</span>
            <span>JPL DE441 Benchmark</span>
          </button>

          <button
            onClick={onOpenReport}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1 rounded transition-colors text-xs flex items-center gap-1.5 border border-sky-400/40"
          >
            <span>📄</span>
            <span>Flight Dispatch Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};
