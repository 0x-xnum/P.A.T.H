import React, { useState, useEffect } from 'react';
import { LandingSite } from '../types';
import { ARTEMIS_CANDIDATE_SITES } from '../data/landingSites';
import { formatCoordinates, normalizeAngle } from '../utils/coordinates';

interface SiteSelectorProps {
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
  customSites: LandingSite[];
  onCreateCustomSite: (site: LandingSite) => void;
  onDeleteCustomSite: (siteId: string) => void;
  showArchived2022: boolean;
  onToggleArchived2022: (val: boolean) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  selectedSite,
  onSelectSite,
  customSites,
  onCreateCustomSite,
  onDeleteCustomSite,
  showArchived2022,
  onToggleArchived2022,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLat, setCustomLat] = useState('-88.50');
  const [customLon, setCustomLon] = useState('180.00');
  const [customElev, setCustomElev] = useState('1500');
  const [customName, setCustomName] = useState('Custom Polar Site');
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

    const trimmedName = customName.trim();
    if (!trimmedName) {
      setValidationError('Target name is required.');
      return;
    }
    if (trimmedName.length > 30) {
      setValidationError('Target name must be 30 characters or fewer.');
      return;
    }

    const lat = parseFloat(customLat);
    if (isNaN(lat)) {
      setValidationError('Latitude must be a valid numeric degree.');
      return;
    }
    // Artemis III operational envelope is South Polar: between -90.0° and -83.0°
    if (lat < -90 || lat > -83) {
      setValidationError(
        'Artemis South Pole Mission Envelope: Latitude must be between -90.00° (Pole) and -83.00° S.'
      );
      return;
    }

    const lon = parseFloat(customLon);
    if (isNaN(lon)) {
      setValidationError('Longitude must be a valid numeric degree.');
      return;
    }
    if (lon < -180 || lon > 360) {
      setValidationError('Longitude must be between -180.00° and +360.00° E.');
      return;
    }

    const elev = parseFloat(customElev);
    if (isNaN(elev) || elev < -9000 || elev > 10000) {
      setValidationError(
        'Elevation must be between -9,000 m (deep crater basin) and +10,000 m (high massif peak).'
      );
      return;
    }

    const normalizedLon = normalizeAngle(lon);

    const newCustomSite: LandingSite = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      designation: `USR-TGT-${(customSites.length + 1).toString().padStart(2, '0')}`,
      coordinates: {
        latitude: parseFloat(lat.toFixed(3)),
        longitude: parseFloat(normalizedLon.toFixed(3)),
        elevationMeters: Math.round(elev),
      },
      description: `User-defined landing coordinates (${lat.toFixed(2)}°S, ${normalizedLon.toFixed(2)}°E) evaluated in lunar topocentric horizon frame.`,
      rimHeightMeters: 2000,
      permanentlyShadowedNearby: Math.abs(lat) > 85,
      isOfficialArtemisCandidate: false,
      category: 'custom',
      scientificValue: 'Custom landing site evaluated for direct solar illumination and Earth line-of-sight margins.',
      officialCitation: 'User Defined Target (Project P.A.T.H.)',
    };

    onCreateCustomSite(newCustomSite);
    setShowCustomModal(false);
  };

  const isCurrentCustom = selectedSite.category === 'custom';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header with Custom Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono">
            Target Landing Zone
          </h2>
          <p className="text-xs text-slate-500 font-mono">NASA Artemis III Evaluation Frame</p>
        </div>
        <button
          onClick={() => {
            setValidationError(null);
            setShowCustomModal(true);
          }}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/80 transition-colors"
        >
          + Custom Target
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="site-select-dropdown" className="text-xs font-mono text-slate-400">
            Active Candidate Region
          </label>
          {isCurrentCustom && (
            <button
              onClick={() => onDeleteCustomSite(selectedSite.id)}
              className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              title="Delete this custom target"
            >
              <span>🗑️ Delete Custom Site</span>
            </button>
          )}
        </div>

        <select
          id="site-select-dropdown"
          value={selectedSite.id}
          onChange={(e) => {
            const val = e.target.value;
            // Check in official sites first
            const foundOfficial = ARTEMIS_CANDIDATE_SITES.find((s) => s.id === val);
            if (foundOfficial) {
              onSelectSite(foundOfficial);
              return;
            }
            // Check in custom sites
            const foundCustom = customSites.find((s) => s.id === val);
            if (foundCustom) {
              onSelectSite(foundCustom);
            }
          }}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 transition-colors"
        >
          <optgroup label="NASA Artemis III 2024 Refined Baseline (9 Regions)">
            {ARTEMIS_CANDIDATE_SITES.filter((s) => s.category === '2024-refined').map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.designation})
              </option>
            ))}
          </optgroup>

          {customSites.length > 0 && (
            <optgroup label={`Saved Custom Targets (${customSites.length})`}>
              {customSites.map((site) => (
                <option key={site.id} value={site.id}>
                  📍 {site.name} ({Math.abs(site.coordinates.latitude).toFixed(2)}°S, {site.coordinates.longitude.toFixed(1)}°E)
                </option>
              ))}
            </optgroup>
          )}

          {showArchived2022 && (
            <optgroup label="Archived 2022 Historical Baseline (Superseded)">
              {ARTEMIS_CANDIDATE_SITES.filter((s) => s.category === '2022-historical').map((site) => (
                <option key={site.id} value={site.id}>
                  [ARCHIVED] {site.name} ({site.designation})
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* 2022 Toggle */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <label htmlFor="toggle-2022-baseline" className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              id="toggle-2022-baseline"
              type="checkbox"
              checked={showArchived2022}
              onChange={(e) => onToggleArchived2022(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
            />
            <span>Include 2022 Historical Study Sites</span>
          </label>
          <span className="text-slate-500 text-[10px]">
            {showArchived2022 ? 'Showing 2024 + 2022' : 'Official 2024 Only'}
          </span>
        </div>

        {/* Selected Coordinates & Elevation Badges */}
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

        {/* Description & Citation */}
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

      {/* Modal for Creating Custom Lunar Coordinates */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-coords-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 id="custom-coords-title" className="text-base font-bold text-white font-mono">
                Define Custom Lunar Target
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Input selenographic coordinates inside the Artemis South Pole envelope to simulate local topocentric horizon, solar flux, and Earth line-of-sight.
            </p>

            {validationError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-[11px] leading-relaxed">
                ⚠️ {validationError}
              </div>
            )}

            <form onSubmit={handleApplyCustom} className="space-y-3 font-mono text-xs">
              <div>
                <label htmlFor="custom-target-name" className="text-slate-300 block mb-1">
                  Target Name
                </label>
                <input
                  id="custom-target-name"
                  type="text"
                  maxLength={30}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Ridge Site Bravo"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="custom-lat" className="text-slate-300">
                      Latitude (°S)
                    </label>
                    <span className="text-[10px] text-slate-500">-90° to -83°</span>
                  </div>
                  <input
                    id="custom-lat"
                    type="number"
                    step="0.01"
                    min="-90.00"
                    max="-83.00"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">South Pole: -90.00°</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="custom-lon" className="text-slate-300">
                      Longitude (°E)
                    </label>
                    <span className="text-[10px] text-slate-500">0° to 360°</span>
                  </div>
                  <input
                    id="custom-lon"
                    type="number"
                    step="0.01"
                    min="-180.00"
                    max="360.00"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Prime: 0.00° (Earth-facing)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="custom-elev" className="text-slate-300">
                    Surface Elevation (m)
                  </label>
                  <span className="text-[10px] text-slate-500">-9000 to +10000</span>
                </div>
                <input
                  id="custom-elev"
                  type="number"
                  step="10"
                  min="-9000"
                  max="10000"
                  value={customElev}
                  onChange={(e) => setCustomElev(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Saved custom targets quick list inside modal */}
              {customSites.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Existing Custom Targets ({customSites.length}):
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {customSites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[10px]"
                      >
                        <span className="text-slate-300 truncate max-w-[200px]">{site.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSite(site);
                              setShowCustomModal(false);
                            }}
                            className="text-sky-400 hover:underline"
                          >
                            Select
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCustomSite(site.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/30"
                >
                  Save &amp; Evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
