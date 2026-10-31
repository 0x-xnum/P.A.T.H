import React, { useState } from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { formatCoordinates } from '../utils/coordinates';

interface SiteSelectorProps {
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({ selectedSite, onSelectSite }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLat, setCustomLat] = useState('-88.50');
  const [customLon, setCustomLon] = useState('180.00');
  const [customElev, setCustomElev] = useState('1500');
  const [customName, setCustomName] = useState('Custom Site Alpha');

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const elev = parseFloat(customElev) || 0;

    if (isNaN(lat) || isNaN(lon)) return;

    const newCustomSite: LandingSite = {
      id: `custom-${Date.now()}`,
      name: customName || 'Custom Landing Target',
      designation: 'USER-TARGET-01',
      coordinates: {
        latitude: Math.max(-90, Math.min(90, lat)),
        longitude: lon,
        elevationMeters: elev,
      },
      description: 'User-specified target coordinates evaluated in local lunar topocentric frame.',
      permanentlyShadowedNearby: Math.abs(lat) > 85,
      isOfficialArtemisCandidate: false,
      scientificValue: 'Arbitrary landing coordinates designated for mission feasibility screening.',
    };

    onSelectSite(newCustomSite);
    setShowCustomModal(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
          Target Landing Zone
        </h2>
        <button
          onClick={() => setShowCustomModal(true)}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 underline decoration-sky-500/40"
        >
          + Custom Coords
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-mono text-slate-400">Select Artemis Candidate Region</label>
        <select
          value={selectedSite.id}
          onChange={(e) => {
            const found = ARTEMIS_CANDIDATE_SITES.find((s) => s.id === e.target.value);
            if (found) onSelectSite(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 transition-colors"
        >
          {ARTEMIS_CANDIDATE_SITES.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.designation})
            </option>
          ))}
          {!selectedSite.isOfficialArtemisCandidate && (
            <option value={selectedSite.id}>{selectedSite.name} (Custom)</option>
          )}
        </select>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-slate-500 block text-[10px]">COORDINATES</span>
            <span className="text-slate-200 font-semibold">{formatCoordinates(selectedSite.coordinates)}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-slate-500 block text-[10px]">ELEVATION</span>
            <span className="text-slate-200 font-semibold">{selectedSite.coordinates.elevationMeters ?? 0} m</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          <p className="mb-2">{selectedSite.description}</p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <span className="text-slate-500">Volatiles (Water-Ice):</span>
            <span className={selectedSite.permanentlyShadowedNearby ? 'text-cyan-400' : 'text-slate-400'}>
              {selectedSite.permanentlyShadowedNearby ? 'PSR Cold Trap Proximal' : 'Low PSR Proximity'}
            </span>
          </div>
        </div>
      </div>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white font-mono mb-3">Custom Lunar Coordinates</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter any selenographic coordinate to simulate local horizon, solar elevation, and Earth line-of-sight.
            </p>

            <form onSubmit={handleApplyCustom} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude (° S is negative)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="-90"
                    max="90"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Longitude (° E)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="-180"
                    max="360"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Elevation (Meters)</label>
                <input
                  type="number"
                  step="10"
                  value={customElev}
                  onChange={(e) => setCustomElev(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500"
                >
                  Evaluate Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
