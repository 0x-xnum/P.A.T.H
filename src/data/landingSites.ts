import { LandingSite } from '../types';

/**
 * Official NASA Artemis III Candidate Landing Regions
 * Primary Source: NASA Planetary Mission Program Office (October 28, 2024 update)
 * https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/
 * Coordinates referenced to IAU/IAG Lunar Mean Earth / Polar Axis (ME) frame.
 */
export const ARTEMIS_2024_REFINED_SITES: LandingSite[] = [
  {
    id: 'peak-near-cabeus-b',
    name: 'Peak near Cabeus B',
    designation: 'CABB-PK-01',
    coordinates: {
      latitude: -87.80,
      longitude: 342.0,
      elevationMeters: 1400,
    },
    description: 'Elevated highland ridge overlooking Cabeus B crater with extensive direct Earth communication visibility and favorable landing slopes.',
    rimHeightMeters: 3100,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Direct access to volatile-rich ejecta deposits excavated from the Cabeus crater interior (site of LCROSS water detection).',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'haworth',
    name: 'Haworth Crater Rim',
    designation: 'HAWTH-RM-01',
    coordinates: {
      latitude: -87.40,
      longitude: 355.0,
      elevationMeters: 1100,
    },
    description: 'Southwestern rim terrain bordering one of the coldest cryogenic thermal environments measured in the Solar System (< 40 K).',
    rimHeightMeters: 3400,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Ground-truth sampling of subsurface cryogenic ice deposits and verification of orbital neutron spectrometer anomalies.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    designation: 'MALAP-MS-01',
    coordinates: {
      latitude: -84.90,
      longitude: 12.9,
      elevationMeters: 5000,
    },
    description: 'Prominent 5,000-meter-high mountain massif providing outstanding uninterrupted direct line-of-sight to Earth for high-bandwidth comms.',
    rimHeightMeters: 5000,
    permanentlyShadowedNearby: false,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Premier regional telecommunications relay benchmark and deep regolith drilling site with panoramic South Pole-Aitken context.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'mons-mouton-plateau',
    name: 'Mons Mouton Plateau',
    designation: 'MMOUT-PL-01',
    coordinates: {
      latitude: -84.40,
      longitude: 330.0,
      elevationMeters: 3500,
    },
    description: 'Expansive elevated plateau feature offering wide hazard-free landing corridors and long-duration solar illumination windows.',
    rimHeightMeters: 3500,
    permanentlyShadowedNearby: false,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Ancient pre-Nectarian highland crust exposed by the formation of the South Pole-Aitken (SPA) impact basin.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'mons-mouton',
    name: 'Mons Mouton',
    designation: 'MMOUT-PK-02',
    coordinates: {
      latitude: -84.80,
      longitude: 325.0,
      elevationMeters: 3700,
    },
    description: 'Elevated mountain crest named in honor of NASA mathematician and Apollo computer pioneer Melba Roy Mouton.',
    rimHeightMeters: 3700,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Investigation of space weathering across steep slope gradients and sampling of ancient volcanic highland breccias.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'nobile-rim-1',
    name: 'Nobile Rim 1',
    designation: 'NOBIL-RM-01',
    coordinates: {
      latitude: -85.20,
      longitude: 53.5,
      elevationMeters: 1750,
    },
    description: 'Complex crater rim section previously selected for the VIPER volatile-scouting rover traverse exploration corridor.',
    rimHeightMeters: 3200,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Detailed resource prospecting of micro-cold traps and volatile concentration gradients near shadowed crater floors.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'nobile-rim-2',
    name: 'Nobile Rim 2',
    designation: 'NOBIL-RM-02',
    coordinates: {
      latitude: -85.40,
      longitude: 36.0,
      elevationMeters: 1900,
    },
    description: 'Western flank of Nobile crater exhibiting moderate slopes and wide obstacle clearance margins for terminal descent.',
    rimHeightMeters: 3000,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Comparative stratigraphy between proximal SPA basin materials and subsequent Copernican-era impact ejecta.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'de-gerlache-rim-2',
    name: 'de Gerlache Rim 2',
    designation: 'DGERL-RM-02',
    coordinates: {
      latitude: -88.34,
      longitude: 290.5,
      elevationMeters: 1480,
    },
    description: 'Northwestern rim crest facing Earth with gentle slope profiles facilitating autonomous precision hazard avoidance.',
    rimHeightMeters: 2900,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Long-duration solar array power collection node and pristine highlands anorthosite sampling.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
  {
    id: 'slater-plain',
    name: 'Slater Plain',
    designation: 'SLATR-PL-01',
    coordinates: {
      latitude: -88.10,
      longitude: 115.0,
      elevationMeters: 850,
    },
    description: 'Flat inter-crater plain positioned between Slater and Faustini craters, offering broad landing ellipses with minimal slope hazards.',
    rimHeightMeters: 2200,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2024-refined',
    scientificValue: 'Smooth traverse corridor permitting long-range mobility to multiple permanent shadow boundary zones.',
    officialCitation: 'NASA Press Release 24-142 (Oct 28, 2024)',
  },
];

/**
 * Historical 2022 Candidate Regions (Retained for Comparative Study)
 * Source: NASA Press Release 22-088 (August 19, 2022)
 */
export const ARTEMIS_2022_HISTORICAL_SITES: LandingSite[] = [
  {
    id: 'peak-near-shackleton',
    name: 'Peak Near Shackleton',
    designation: 'SHACK-PK-01',
    coordinates: {
      latitude: -89.54,
      longitude: 0.0,
      elevationMeters: 1250,
    },
    description: 'Topographic ridge adjacent to Shackleton crater rim, characterized by extraordinary multi-month illumination persistence.',
    rimHeightMeters: 4200,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2022-historical',
    scientificValue: 'Volatile ice deposits preserved in Shackleton interior cold traps.',
    officialCitation: 'NASA Press Release 22-088 (Aug 19, 2022)',
  },
  {
    id: 'faustini-rim-a',
    name: 'Faustini Rim A',
    designation: 'FAUST-RM-A',
    coordinates: {
      latitude: -87.10,
      longitude: 67.0,
      elevationMeters: 2100,
    },
    description: 'High elevation rim plateau overlooking deep volatile-rich cold traps of Faustini crater.',
    rimHeightMeters: 3800,
    permanentlyShadowedNearby: true,
    isOfficialArtemisCandidate: true,
    category: '2022-historical',
    scientificValue: 'Subsurface hydrogen signatures detected by orbital radar.',
    officialCitation: 'NASA Press Release 22-088 (Aug 19, 2022)',
  },
];

// Combined candidate regions: 2024 official refined sites first, followed by historical 2022 reference sites
export const ARTEMIS_CANDIDATE_SITES: LandingSite[] = [
  ...ARTEMIS_2024_REFINED_SITES,
  ...ARTEMIS_2022_HISTORICAL_SITES,
];

// Default selection: Peak near Cabeus B (Ranked high in 2024 official update)
export const DEFAULT_LANDING_SITE = ARTEMIS_2024_REFINED_SITES[0];
