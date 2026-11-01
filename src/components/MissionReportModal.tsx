import React from 'react';
import { LandingSite, TelemetrySample } from '../types';
import { formatCoordinates } from '../utils/coordinates';
import { SOLAR_CONSTANT_W_M2 } from '../utils/analyzer';

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: LandingSite;
  telemetry: TelemetrySample;
  currentDate: Date;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  onClose,
  site,
  telemetry,
  currentDate,
}) => {
  if (!isOpen) return null;

  const solarFlux = Math.round(telemetry.solarIlluminationFraction * SOLAR_CONSTANT_W_M2);
  const totalPowerWatts = Math.round(solarFlux * 10 * 0.32);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            mission: 'Artemis III Polar Landing Screening',
            generatedBy: 'Project P.A.T.H. (NASA Space Apps Challenge)',
            timestampUtc: currentDate.toISOString(),
            targetSite: site,
            telemetry: telemetry,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PATH_Mission_Brief_${site.designation}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Header Brief Section */}
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 print:border-black print:text-black">
                NASA ARTEMIS III
              </span>
              <span className="text-xs font-mono text-slate-500">MISSION FLIGHT BRIEF</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-white mt-1 print:text-black">
              PROJECT P.A.T.H. DISPATCH ASSESSMENT
            </h2>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 print:text-black">
            <div>REF: {site.designation}</div>
            <div className="text-[10px] text-slate-500">{currentDate.toISOString().replace('T', ' ').slice(0, 16)} UTC</div>
          </div>
        </div>

        {/* Go/No-Go Badge */}
        <div
          className={`p-4 rounded-xl border text-center font-mono ${
            telemetry.windowRating === 'optimal'
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 print:bg-emerald-100 print:text-emerald-900'
              : telemetry.windowRating === 'marginal'
              ? 'bg-amber-950/40 border-amber-700 text-amber-300 print:bg-amber-100 print:text-amber-900'
              : 'bg-rose-950/40 border-rose-700 text-rose-300 print:bg-rose-100 print:text-rose-900'
          }`}
        >
          <div className="text-xs uppercase tracking-widest font-bold">Flight Dispatch Decision</div>
          <div className="text-xl font-black mt-1">
            {telemetry.windowRating === 'optimal'
              ? 'MISSION GO FOR DESCENT'
              : telemetry.windowRating === 'marginal'
              ? 'CAUTION: MARGINAL POWER/COMMS'
              : 'MISSION NO-GO: OCCLUSION HAZARD'}
          </div>
        </div>

        {/* Target Site Details */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Target Site Specification</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
            <div>
              <span className="text-slate-500 block text-[10px]">NAME</span>
              <span className="font-semibold text-slate-200 print:text-black">{site.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">COORDINATES</span>
              <span className="font-semibold text-slate-200 print:text-black">{formatCoordinates(site.coordinates)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ELEVATION</span>
              <span className="font-semibold text-slate-200 print:text-black">{site.coordinates.elevationMeters ?? 0} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PSR PROXIMITY</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {site.permanentlyShadowedNearby ? 'Yes (Volatiles)' : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Breakdown Grid */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Evaluated Telemetry Metrics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-black">
              <div className="font-bold text-amber-400 print:text-amber-700">⚡ Solar Power Status</div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Elevation:</span>
                <span className="font-bold">{telemetry.sun.elevation.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Azimuth:</span>
                <span>{telemetry.sun.azimuth.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Array Generation:</span>
                <span className="font-bold text-emerald-400 print:text-emerald-800">{totalPowerWatts} Watts</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-black">
              <div className="font-bold text-cyan-400 print:text-cyan-700">📡 Direct-to-Earth (DTE) Link</div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Elevation:</span>
                <span className="font-bold">{telemetry.earth.elevation.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Azimuth:</span>
                <span>{telemetry.earth.azimuth.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between text-slate-300 print:text-black">
                <span>Link State:</span>
                <span className="font-bold text-emerald-400 print:text-emerald-800 uppercase">{telemetry.dteStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Flight Evaluation Rules */}
        <div className="space-y-1.5 font-mono text-xs bg-slate-900/40 p-3.5 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
          <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Flight Evaluation Factors</div>
          {telemetry.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-300 print:text-black text-[11px]">
              <span className="text-sky-400">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sky-400 hover:bg-slate-800 transition-colors"
            >
              📥 Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/30"
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
