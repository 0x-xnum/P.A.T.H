export interface LunarCoordinates {
  latitude: number;   // Degrees (-90 to +90, negative for South Pole)
  longitude: number;  // Degrees (-180 to +180)
  elevationMeters?: number; // Elevation relative to lunar reference sphere (1737.4 km)
}

export interface LandingSite {
  id: string;
  name: string;
  designation: string;
  coordinates: LunarCoordinates;
  description: string;
  rimHeightMeters?: number;
  permanentlyShadowedNearby: boolean;
  isOfficialArtemisCandidate: boolean;
  scientificValue: string;
}

export interface CelestialBodyPosition {
  elevation: number;    // Degrees above/below local tangent horizon (-90 to +90)
  azimuth: number;      // Degrees from local lunar North (0 to 360, clockwise: 0=N, 90=E, 180=S, 270=W)
  distanceKm: number;   // Distance from lunar landing site to body center
  isVisible: boolean;   // True if elevation is above local terrain horizon mask
}

export type DteLinkStatus = 'connected' | 'marginal' | 'blackout';

export type MissionWindowRating = 'optimal' | 'marginal' | 'hazardous';

export interface TelemetrySample {
  timestamp: string;         // ISO date-time string
  sun: CelestialBodyPosition;
  earth: CelestialBodyPosition;
  solarIlluminationFraction: number; // 0.0 to 1.0 (incident angle factor on vertical array)
  dteStatus: DteLinkStatus;
  windowRating: MissionWindowRating;
  reasons: string[];
}

export interface HorizonMaskPoint {
  azimuth: number;           // 0 to 360 degrees
  elevationCutoff: number;   // Minimum elevation angle required to clear local terrain
}
