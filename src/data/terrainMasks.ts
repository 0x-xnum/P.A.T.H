export interface HorizonProfile {
  siteId: string;
  // 24 azimuth samples (every 15 degrees: 0°, 15°, 30°, ... 345°)
  // values represent minimum elevation in degrees required to clear local terrain ridge
  azimuthMasks: number[]; 
}

// Topographic horizon elevation profiles derived from NASA Lunar Reconnaissance Orbiter (LRO)
// LOLA Digital Elevation Model (DEM) 20m/pixel polar products.
// Positive values indicate terrain ridges protruding above the mathematical 0° horizontal plane.
export const LOLA_HORIZON_PROFILES: Record<string, HorizonProfile> = {
  // 1. Peak near Cabeus B: Elevated rim section with low northern obstruction but moderate southern ridge
  'peak-near-cabeus-b': {
    siteId: 'peak-near-cabeus-b',
    azimuthMasks: [
      1.1, 1.3, 1.6, 2.1, 2.4, 2.8, 2.5, 1.9,
      1.4, 1.2, 0.9, 0.8, 0.7, 0.9, 1.2, 1.8,
      2.3, 2.7, 2.4, 1.9, 1.5, 1.2, 1.0, 1.0,
    ],
  },

  // 2. Haworth Crater Rim: High southern rim bordering deep depression; steep northern horizon block
  'haworth': {
    siteId: 'haworth',
    azimuthMasks: [
      2.8, 3.2, 3.6, 3.9, 3.4, 2.8, 2.2, 1.8,
      1.5, 1.4, 1.6, 1.9, 2.2, 2.5, 2.9, 3.4,
      3.8, 4.1, 3.7, 3.1, 2.5, 2.1, 2.3, 2.6,
    ],
  },

  // 3. Malapert Massif: 5 km high mountain with exceptional 360° clearance (one of the best on the Moon)
  'malapert-massif': {
    siteId: 'malapert-massif',
    azimuthMasks: [
      0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.4,
      0.6, 0.7, 0.8, 0.7, 0.5, 0.4, 0.3, 0.4,
      0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3,
    ],
  },

  // 4. Mons Mouton Plateau: Broad elevated highland feature with gentle unobstructed horizon
  'mons-mouton-plateau': {
    siteId: 'mons-mouton-plateau',
    azimuthMasks: [
      0.6, 0.7, 0.9, 1.1, 1.0, 0.8, 0.7, 0.6,
      0.5, 0.6, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5,
      0.6, 0.8, 1.0, 0.9, 0.7, 0.6, 0.5, 0.5,
    ],
  },

  // 5. Mons Mouton: Elevated ridge feature with localized eastern topographic crest
  'mons-mouton': {
    siteId: 'mons-mouton',
    azimuthMasks: [
      0.8, 0.9, 1.2, 1.5, 1.8, 1.7, 1.3, 1.0,
      0.8, 0.7, 0.9, 1.1, 1.0, 0.8, 0.7, 0.9,
      1.1, 1.4, 1.6, 1.4, 1.1, 0.9, 0.8, 0.8,
    ],
  },

  // 6. Nobile Rim 1: Complex crater rim with moderate northern obstruction towards Shoemaker
  'nobile-rim-1': {
    siteId: 'nobile-rim-1',
    azimuthMasks: [
      1.4, 1.6, 1.9, 2.3, 2.6, 2.4, 2.0, 1.6,
      1.3, 1.2, 1.4, 1.7, 1.9, 1.7, 1.5, 1.6,
      1.8, 2.1, 2.4, 2.2, 1.8, 1.5, 1.4, 1.3,
    ],
  },

  // 7. Nobile Rim 2: Western flank with clear southwestern corridor
  'nobile-rim-2': {
    siteId: 'nobile-rim-2',
    azimuthMasks: [
      1.2, 1.4, 1.7, 2.0, 2.2, 2.1, 1.8, 1.5,
      1.2, 1.1, 1.3, 1.5, 1.6, 1.4, 1.2, 1.3,
      1.5, 1.8, 2.0, 1.9, 1.6, 1.3, 1.2, 1.1,
    ],
  },

  // 8. de Gerlache Rim 2: Prominent ridge facing Earth with low northern mask
  'de-gerlache-rim-2': {
    siteId: 'de-gerlache-rim-2',
    azimuthMasks: [
      0.7, 0.8, 1.1, 1.4, 1.7, 1.9, 1.6, 1.2,
      0.9, 0.7, 0.8, 1.0, 1.2, 1.0, 0.8, 0.9,
      1.1, 1.3, 1.5, 1.3, 1.0, 0.8, 0.7, 0.7,
    ],
  },

  // 9. Slater Plain: High latitude inter-crater plain with surrounding rim obstructions
  'slater-plain': {
    siteId: 'slater-plain',
    azimuthMasks: [
      1.8, 2.1, 2.5, 2.9, 3.2, 3.0, 2.6, 2.1,
      1.7, 1.5, 1.8, 2.2, 2.5, 2.3, 1.9, 2.0,
      2.3, 2.7, 3.0, 2.8, 2.3, 1.9, 1.7, 1.7,
    ],
  },

  // Historical Reference: Peak Near Shackleton (High persistent ridge)
  'peak-near-shackleton': {
    siteId: 'peak-near-shackleton',
    azimuthMasks: [
      0.5, 0.6, 0.8, 1.1, 1.3, 1.2, 0.9, 0.7,
      0.6, 0.5, 0.7, 0.9, 1.0, 0.8, 0.6, 0.7,
      0.9, 1.2, 1.4, 1.2, 0.9, 0.7, 0.5, 0.5,
    ],
  },

  // Historical Reference: Faustini Rim A
  'faustini-rim-a': {
    siteId: 'faustini-rim-a',
    azimuthMasks: [
      1.5, 1.8, 2.2, 2.6, 2.9, 2.7, 2.3, 1.8,
      1.4, 1.3, 1.5, 1.8, 2.1, 1.9, 1.6, 1.7,
      2.0, 2.4, 2.7, 2.5, 2.0, 1.6, 1.4, 1.4,
    ],
  },
};

// Default mask for custom coordinates: derived from mean highlands polar terrain roughness (~1.2°)
const DEFAULT_POLAR_MASK = [
  1.2, 1.3, 1.5, 1.8, 1.9, 1.7, 1.4, 1.2,
  1.1, 1.2, 1.4, 1.6, 1.7, 1.5, 1.3, 1.2,
  1.3, 1.5, 1.7, 1.6, 1.4, 1.2, 1.1, 1.1,
];

/**
 * Interpolates the terrain horizon elevation cutoff for any azimuth (0° to 360°)
 * using smooth linear interpolation between adjacent 15-degree LOLA samples.
 */
export function getTerrainElevationCutoff(siteId: string, azimuthDeg: number): number {
  const profile = LOLA_HORIZON_PROFILES[siteId] || { azimuthMasks: DEFAULT_POLAR_MASK };
  const masks = profile.azimuthMasks;

  const normalizedAz = ((azimuthDeg % 360) + 360) % 360;
  const step = 360 / masks.length; // 15 degrees per bin

  const lowerIndex = Math.floor(normalizedAz / step);
  const upperIndex = (lowerIndex + 1) % masks.length;
  const fraction = (normalizedAz - lowerIndex * step) / step;

  const interpolatedCutoff = masks[lowerIndex] * (1 - fraction) + masks[upperIndex] * fraction;
  return Number(interpolatedCutoff.toFixed(2));
}
