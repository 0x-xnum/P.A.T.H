import React, { useState, useEffect } from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { formatCoordinates, normalizeAngle } from '../utils/coordinates';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCustomModal) {
        setShowCustomModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCustomModal]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const elev = parseFloat(customElev);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setValidationError('Latitude must be a valid number between -90° (South Pole) and +90° (North Pole).');
      return;
    }

    if (isNaN(lon)) {
      setValidationError('Longitude must be a valid numeric degree value.');
      return;
    }

    const normalizedLon = normalizeAngle(lon);
    const validElev = isNaN(elev) ? 0 : elev;

    const newCustomSite: LandingSite = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'Custom Landing Target',
      designation: 'USER-TARGET-01',
      coordinates: {
        latitude: lat,
        longitude: normalizedLon,
        elevationMeters: validElev,
      },
      description: `User-specified selenographic coordinates (${lat.toFixed(2)}°, ${normalizedLon.toFixed(2)}°) evaluated in local topocentric horizon frame.`,
      rimHeightMeters: 2000,
      permanentlyShadowedNearby: Math.abs(lat) > 85,
      isOfficialArtemisCandidate: false,
      category: 'custom',
      scientificValue: 'Arbitrary landing coordinates designated for mission feasibility screening.',
      officialCitation: 'Custom User Coordinate Input',
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
          onClick={() => {
            setValidationError(null);
            setShowCustomModal(true);
          }}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 underline decoration-sky-500/40"
        >
          + Custom Coords
        </button>
      </div>

      <div className="space-y-3">
        <label htmlFor="site-select-dropdown" className="block text-xs font-mono text-slate-400">
          Select Artemis Candidate Region
        </label>
        <select
          id="site-select-dropdown"
          value={selectedSite.id}
          onChange={(e) => {
            const found = ARTEMIS_CANDIDATE_SITES.find((s) => s.id === e.target.value);
            if (found) onSelectSite(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 transition-colors"
        >
          <optgroup label="2024 NASA Refined Artemis III Regions">
            {ARTEMIS_CANDIDATE_SITES.filter((s) => s.category === '2024-refined').map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.designation})
              </option>
            ))}
          </optgroup>
          <optgroup label="Historical 2022 Candidate References">
            {ARTEMIS_CANDIDATE_SITES.filter((s) => s.category === '2022-historical').map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.designation})
              </option>
            ))}
          </optgroup>
          {selectedSite.category === 'custom' && (
            <optgroup label="Custom User Target">
              <option value={selectedSite.id}>{selectedSite.name} (Custom)</option>
            </optgroup>
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
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <span className="text-slate-500">{selectedSite.officialCitation}</span>
            <span className={selectedSite.permanentlyShadowedNearby ? 'text-cyan-400' : 'text-slate-400'}>
              {selectedSite.permanentlyShadowedNearby ? 'PSR Cold Trap Proximal' : 'Low PSR Proximity'}
            </span>
          </div>
        </div>
      </div>

      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-coords-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 id="custom-coords-title" className="text-base font-bold text-white font-mono mb-2">
              Custom Lunar Coordinates
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter any selenographic coordinate to simulate local horizon, solar elevation, and Earth line-of-sight.
            </p>

            {validationError && (
              <div className="mb-4 p-2.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 font-mono text-[11px]">
                {validationError}
              </div>
            )}

            <form onSubmit={handleApplyCustom} className="space-y-3 font-mono text-xs">
              <div>
                <label htmlFor="custom-target-name" className="text-slate-400 block mb-1">Target Name</label>
                <input
                  id="custom-target-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="custom-lat" className="text-slate-400 block mb-1">Latitude (° S is negative)</label>
                  <input
                    id="custom-lat"
                    type="number"
                    step="0.01"
                    min="-90"
                    max="90"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="custom-lon" className="text-slate-400 block mb-1">Longitude (° E)</label>
                  <input
                    id="custom-lon"
                    type="number"
                    step="0.01"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="custom-elev" className="text-slate-400 block mb-1">Elevation (Meters)</label>
                <input
                  id="custom-elev"
                  type="number"
                  step="10"
                  value={customElev}
                  onChange={(e) => setCustomElev(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors"
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
