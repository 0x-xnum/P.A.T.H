import React, { useState, useEffect } from 'react';
import { TelemetrySample } from '../types';

interface TimelineControlsProps {
  currentDate: Date;
  onChangeDate: (newDate: Date) => void;
  forecastSamples: TelemetrySample[];
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentDate,
  onChangeDate,
  forecastSamples,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(6); // hours per second

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onChangeDate(new Date(currentDate.getTime() + playbackSpeed * 3600 * 1000));
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, currentDate, playbackSpeed, onChangeDate]);

  // Window bounds for slider: Oct 2026 to Dec 2027
  const minTime = Date.UTC(2026, 9, 1, 0, 0, 0); // Oct 1, 2026
  const maxTime = Date.UTC(2027, 11, 31, 23, 59, 59); // Dec 31, 2027
  const currentTimestamp = currentDate.getTime();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTs = parseInt(e.target.value, 10);
    onChangeDate(new Date(newTs));
  };

  const handleQuickJump = (year: number, month: number, day: number) => {
    onChangeDate(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            Mission Timeline Scrubber
          </h2>
          <p className="text-xs text-slate-500 font-mono">Simulate Diurnal Cycles &amp; Orbital Progressions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-sky-600 text-white hover:bg-sky-500'
            }`}
          >
            <span>{isPlaying ? '⏸ PAUSE' : '▶ SIMULATE'}</span>
          </button>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            {[1, 6, 24].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded ${
                  playbackSpeed === speed ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}h/s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main scrubber slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>OCT 2026</span>
          <span className="text-sky-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {currentDate.toISOString().replace('T', ' ').slice(0, 16)} UTC
          </span>
          <span>DEC 2027</span>
        </div>

        <input
          type="range"
          min={minTime}
          max={maxTime}
          step={3600 * 1000} // 1 hour step
          value={currentTimestamp}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400 border border-slate-800"
        />

        {/* 14-day forecast mini color strip */}
        {forecastSamples.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>+14-Day Tactical Window Outlook</span>
              <span>Green = Optimal | Amber = Marginal | Red = Hazard</span>
            </div>
            <div className="flex h-3 w-full rounded overflow-hidden border border-slate-800/80">
              {forecastSamples.map((sample, idx) => {
                let color = 'bg-rose-600/70';
                if (sample.windowRating === 'optimal') color = 'bg-emerald-500';
                else if (sample.windowRating === 'marginal') color = 'bg-amber-500/80';

                return (
                  <div
                    key={idx}
                    title={`${sample.timestamp.slice(0, 10)}: ${sample.windowRating.toUpperCase()}`}
                    className={`flex-1 ${color} hover:opacity-80 transition-opacity cursor-pointer`}
                    onClick={() => onChangeDate(new Date(sample.timestamp))}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-slate-500 text-[10px]">MISSION MILESTONES:</span>
        <button
          onClick={() => handleQuickJump(2026, 10, 15)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          Artemis III Nominal (Oct 2026)
        </button>
        <button
          onClick={() => handleQuickJump(2026, 12, 21)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          South Pole Solstice (Dec 2026)
        </button>
        <button
          onClick={() => handleQuickJump(2027, 3, 20)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          Spring Equinox (Mar 2027)
        </button>
      </div>
    </div>
  );
};
