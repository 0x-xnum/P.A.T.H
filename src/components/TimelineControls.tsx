import React, { useState, useEffect, useRef } from 'react';
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

  // Window bounds for slider: Oct 2026 to Dec 2027
  const minTime = Date.UTC(2026, 9, 1, 0, 0, 0); // Oct 1, 2026
  const maxTime = Date.UTC(2027, 11, 31, 23, 59, 59); // Dec 31, 2027
  const currentTimestamp = currentDate.getTime();

  // Manual input state
  const formatUtcForInput = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const [inputVal, setInputVal] = useState(formatUtcForInput(currentDate));
  const [inputError, setInputError] = useState<string | null>(null);

  // Keep manual input synced with simulation when not being actively edited
  useEffect(() => {
    setInputVal(formatUtcForInput(currentDate));
  }, [currentDate]);

  // Playback timer effect with boundary clamp
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextTime = currentDate.getTime() + playbackSpeed * 3600 * 1000;
      if (nextTime >= maxTime) {
        onChangeDate(new Date(maxTime));
        setIsPlaying(false);
      } else {
        onChangeDate(new Date(nextTime));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, currentDate, playbackSpeed, onChangeDate, maxTime]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTs = parseInt(e.target.value, 10);
    onChangeDate(new Date(newTs));
  };

  const handleStep = (deltaMs: number) => {
    const nextTime = Math.max(minTime, Math.min(maxTime, currentDate.getTime() + deltaMs));
    onChangeDate(new Date(nextTime));
  };

  const handleQuickJump = (year: number, month: number, day: number, hour: number = 12) => {
    const jumpTime = Math.max(minTime, Math.min(maxTime, Date.UTC(year, month - 1, day, hour, 0, 0)));
    onChangeDate(new Date(jumpTime));
  };

  const handleApplyManualDate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const match = inputVal.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    if (!match) {
      setInputError('Format: YYYY-MM-DDTHH:mm');
      return;
    }

    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const h = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;

    const parsedTs = Date.UTC(y, m, d, h, min, 0);
    if (isNaN(parsedTs)) {
      setInputError('Invalid date values');
      return;
    }

    const clamped = Math.max(minTime, Math.min(maxTime, parsedTs));
    onChangeDate(new Date(clamped));
  };

  // Jog Wheel Drag interaction
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const isDraggingWheel = useRef(false);
  const lastMouseX = useRef(0);

  const handleWheelMouseDown = (e: React.MouseEvent) => {
    isDraggingWheel.current = true;
    lastMouseX.current = e.clientX;
    window.addEventListener('mousemove', handleWheelMouseMove);
    window.addEventListener('mouseup', handleWheelMouseUp);
  };

  const handleWheelMouseMove = (e: MouseEvent) => {
    if (!isDraggingWheel.current) return;
    const deltaX = e.clientX - lastMouseX.current;
    if (Math.abs(deltaX) > 2) {
      // Each 3 pixels moved = 1 hour shift
      const hours = deltaX / 3;
      handleStep(hours * 3600 * 1000);
      lastMouseX.current = e.clientX;
    }
  };

  const handleWheelMouseUp = () => {
    isDraggingWheel.current = false;
    window.removeEventListener('mousemove', handleWheelMouseMove);
    window.removeEventListener('mouseup', handleWheelMouseUp);
  };

  // Mouse scroll wheel on jog dial: scroll up = forward 1h, scroll down = back 1h
  const handleScrollWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const stepHours = e.shiftKey ? 0.25 : 1; // Shift key for 15-minute precision
    if (e.deltaY < 0) {
      handleStep(stepHours * 3600 * 1000);
    } else {
      handleStep(-stepHours * 3600 * 1000);
    }
  };

  // Visual dial angle derived from epoch (one 360 deg cycle per 24 hours)
  const dialAngle = ((currentTimestamp / (24 * 3600 * 1000)) * 360) % 360;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header & Simulation status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
              Mission Timeline &amp; Epoch Scrubber
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950 border border-sky-800 text-sky-300">
              UTC SYNCHRONIZED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Direct UTC manual entry, precision aerospace jog dial &amp; orbital progression
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40'
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

      {/* Main Scrubber Slider */}
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
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Jump to ${sample.timestamp.slice(0, 10)}: ${sample.windowRating.toUpperCase()}`}
                    title={`${sample.timestamp.slice(0, 10)}: ${sample.windowRating.toUpperCase()}`}
                    className={`flex-1 ${color} hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-sky-400`}
                    onClick={() => onChangeDate(new Date(sample.timestamp))}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AEROSPACE JOG WHEEL & MANUAL ENTRY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-800/80">
        {/* Left: Interactive Rotary Jog Wheel & Stepper (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-semibold text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              FLIGHT DYNAMICS JOG DIAL
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Scroll mouse wheel or drag to scrub
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Backward Step Buttons */}
            <div className="flex flex-col sm:flex-row gap-1">
              <button
                onClick={() => handleStep(-24 * 3600 * 1000)}
                title="Step backward 24 hours"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                -24h
              </button>
              <button
                onClick={() => handleStep(-6 * 3600 * 1000)}
                title="Step backward 6 hours"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                -6h
              </button>
              <button
                onClick={() => handleStep(-1 * 3600 * 1000)}
                title="Step backward 1 hour"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                -1h
              </button>
              <button
                onClick={() => handleStep(-15 * 60 * 1000)}
                title="Step backward 15 minutes"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                -15m
              </button>
            </div>

            {/* The Visual Rotary Jog Wheel */}
            <div
              ref={wheelRef}
              onMouseDown={handleWheelMouseDown}
              onWheel={handleScrollWheel}
              title="Click & drag horizontally, or scroll mouse wheel over this dial (Hold Shift for 15m steps)"
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center cursor-ew-resize select-none group"
            >
              {/* Outer notched ring */}
              <div
                className="absolute inset-1 rounded-full border border-dashed border-sky-500/30 transition-transform duration-75"
                style={{ transform: `rotate(${dialAngle}deg)` }}
              >
                {/* 12 radial ticks around the wheel */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-0.5 h-1.5 bg-slate-400 group-hover:bg-sky-400 top-0 left-1/2 -translate-x-1/2 origin-bottom"
                    style={{
                      transform: `rotate(${deg}deg) translateY(0px)`,
                      transformOrigin: '50% 36px',
                    }}
                  />
                ))}
                {/* Active marker indicator notch */}
                <div
                  className="absolute w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] top-0.5 left-1/2 -translate-x-1/2"
                />
              </div>

              {/* Center knob cap */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-lg pointer-events-none">
                <span className="text-[9px] font-mono text-sky-400 font-bold tracking-tighter">
                  JOG
                </span>
                <span className="text-[8px] font-mono text-slate-500">
                  DIAL
                </span>
              </div>
            </div>

            {/* Forward Step Buttons */}
            <div className="flex flex-col sm:flex-row gap-1">
              <button
                onClick={() => handleStep(15 * 60 * 1000)}
                title="Step forward 15 minutes"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                +15m
              </button>
              <button
                onClick={() => handleStep(1 * 3600 * 1000)}
                title="Step forward 1 hour"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                +1h
              </button>
              <button
                onClick={() => handleStep(6 * 3600 * 1000)}
                title="Step forward 6 hours"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                +6h
              </button>
              <button
                onClick={() => handleStep(24 * 3600 * 1000)}
                title="Step forward 24 hours"
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors"
              >
                +24h
              </button>
            </div>
          </div>
        </div>

        {/* Right: Direct Date-Time Manual Entry (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="manual-epoch-input" className="text-[11px] font-mono font-semibold text-slate-300">
                MANUAL EPOCH ENTRY (UTC)
              </label>
              <button
                type="button"
                onClick={() => onChangeDate(new Date())}
                className="text-[10px] font-mono text-sky-400 hover:underline"
              >
                Jump to Real-Time
              </button>
            </div>

            <form onSubmit={handleApplyManualDate} className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="manual-epoch-input"
                  type="datetime-local"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-sky-200 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-mono font-semibold transition-colors"
                >
                  SET
                </button>
              </div>
              {inputError && (
                <p className="text-[10px] font-mono text-rose-400">{inputError}</p>
              )}
            </form>
          </div>

          <p className="text-[10px] font-mono text-slate-500 mt-2">
            Exact topocentric ephemeris &amp; line-of-sight evaluated instantly upon entry.
          </p>
        </div>
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-slate-500 text-[10px]">PRESET MISSIONS:</span>
        <button
          onClick={() => handleQuickJump(2026, 10, 15, 12)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          Artemis III Nominal (Oct 15, 2026)
        </button>
        <button
          onClick={() => handleQuickJump(2026, 12, 21, 12)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          South Pole Solstice (Dec 21, 2026)
        </button>
        <button
          onClick={() => handleQuickJump(2027, 3, 20, 12)}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
        >
          Spring Equinox (Mar 20, 2027)
        </button>
      </div>
    </div>
  );
};
