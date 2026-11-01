import React from 'react';

interface HeaderProps {
  currentDate: Date;
  selectedSiteName: string;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, selectedSiteName, onOpenReport }) => {
  const formattedUtc = currentDate.toUTCString();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-xl font-mono text-sky-400 shadow-inner">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">PROJECT P.A.T.H.</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ARTEMIS III
              </span>
            </div>
            <p className="text-xs text-slate-400">Polar Artemis Telemetry &amp; Horizon-Planner</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span className="text-slate-500">TARGET:</span>
            <span className="text-slate-200 font-semibold">{selectedSiteName}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500">SIM TIME:</span>
            <span className="text-slate-200 font-semibold">{formattedUtc}</span>
          </div>

          <button
            onClick={onOpenReport}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-lg shadow-sky-600/20"
          >
            <span>📄</span>
            <span>Flight Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};
