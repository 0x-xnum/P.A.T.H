import {
  LandingSite,
  TelemetrySample,
  DteLinkStatus,
  MissionWindowRating,
  CelestialBodyPosition,
} from '../types';
import { getSunPosition, getEarthPosition } from './ephemeris';
import { getTerrainElevationCutoff } from '../data/terrainMasks';

export const SOLAR_CONSTANT_W_M2 = 1361;
export const TOTAL_ARRAY_AREA_M2 = 10; // Total collector area of multi-sided vertical polar array
export const ARRAY_EFFICIENCY = 0.32; // 32% high-efficiency triple-junction space-grade photovoltaic cells
// For an omnidirectional cylindrical/multi-faceted vertical array of total area A,
// the effective cross-sectional projected aperture facing the Sun at any azimuth is A / π (~0.3183)
export const OMNI_VERTICAL_PROJECTION_FACTOR = 1 / Math.PI;

export function calculateSolarIlluminationFraction(
  sunPosition: CelestialBodyPosition,
  terrainCutoff: number
): number {
  if (sunPosition.elevation <= terrainCutoff) {
    return 0;
  }
  const elevationRad = (sunPosition.elevation * Math.PI) / 180;
  // Models grazing elevation projection factor on vertical array surfaces
  const verticalPanelFactor = Math.cos(elevationRad);
  return Number(Math.min(1.0, Math.max(0.0, verticalPanelFactor)).toFixed(3));
}

export function calculatePhotovoltaicPowerWatts(
  solarIlluminationFraction: number,
  sunElevationDeg: number
): number {
  if (solarIlluminationFraction <= 0) return 0;
  const elevationRad = (Math.max(0, sunElevationDeg) * Math.PI) / 180;
  const effectiveProjectedAreaM2 = TOTAL_ARRAY_AREA_M2 * OMNI_VERTICAL_PROJECTION_FACTOR * Math.cos(elevationRad);
  return Math.round(SOLAR_CONSTANT_W_M2 * effectiveProjectedAreaM2 * ARRAY_EFFICIENCY);
}

export function evaluateDteLinkStatus(
  earthPosition: CelestialBodyPosition,
  terrainCutoff: number
): DteLinkStatus {
  const clearance = earthPosition.elevation - terrainCutoff;
  if (clearance > 0.5) {
    return 'connected';
  } else if (clearance >= 0.0) {
    return 'marginal';
  } else {
    return 'blackout';
  }
}

export function evaluateMissionWindowRating(
  sunPosition: CelestialBodyPosition,
  sunTerrainCutoff: number,
  earthPosition: CelestialBodyPosition,
  earthTerrainCutoff: number
): { rating: MissionWindowRating; reasons: string[] } {
  const reasons: string[] = [];

  const sunClearance = sunPosition.elevation - sunTerrainCutoff;
  const earthClearance = earthPosition.elevation - earthTerrainCutoff;

  const sunSafe = sunClearance > 0.3;
  const sunMarginal = sunClearance >= 0.0;
  const earthSafe = earthClearance > 0.5;
  const earthMarginal = earthClearance >= 0.0;

  if (sunSafe) {
    reasons.push(
      `Sun clears local LOLA ridge profile (+${sunTerrainCutoff.toFixed(1)}° mask) by +${sunClearance.toFixed(1)}°; continuous solar array power nominal.`
    );
  } else if (sunMarginal) {
    reasons.push(
      `Sun grazing near local terrain crest (+${sunTerrainCutoff.toFixed(1)}° mask); reduced photovoltaic yield and risk of localized shadow cast.`
    );
  } else {
    reasons.push(
      `Solar occlusion: Sun is at ${sunPosition.elevation.toFixed(1)}°, below the local LOLA ridge mask of +${sunTerrainCutoff.toFixed(1)}° (thermal freeze risk).`
    );
  }

  if (earthSafe) {
    reasons.push(
      `Direct-to-Earth line-of-sight established: Earth is at +${earthPosition.elevation.toFixed(1)}°, clearing terrain mask (+${earthTerrainCutoff.toFixed(1)}°) by +${earthClearance.toFixed(1)}°.`
    );
  } else if (earthMarginal) {
    reasons.push(
      `Earth near local ridge crest (+${earthTerrainCutoff.toFixed(1)}° mask); low elevation line-of-sight with possible multipath RF degradation.`
    );
  } else {
    reasons.push(
      `Communication blackout: Earth is at ${earthPosition.elevation.toFixed(1)}°, occluded behind local crater rim (+${earthTerrainCutoff.toFixed(1)}° required).`
    );
  }

  let rating: MissionWindowRating = 'hazardous';

  if (sunSafe && earthSafe) {
    rating = 'optimal';
  } else if (sunMarginal && earthMarginal) {
    rating = 'marginal';
  } else {
    rating = 'hazardous';
  }

  return { rating, reasons };
}

export function sampleTelemetry(site: LandingSite, date: Date): TelemetrySample {
  const rawSun = getSunPosition(site.coordinates, date);
  const rawEarth = getEarthPosition(site.coordinates, date);

  // Evaluate site-specific LOLA topographic horizon masks for Sun and Earth azimuths
  const sunTerrainCutoff = getTerrainElevationCutoff(site.id, rawSun.azimuth);
  const earthTerrainCutoff = getTerrainElevationCutoff(site.id, rawEarth.azimuth);

  const sun: CelestialBodyPosition = {
    ...rawSun,
    isVisible: rawSun.elevation > sunTerrainCutoff,
  };

  const earth: CelestialBodyPosition = {
    ...rawEarth,
    isVisible: rawEarth.elevation > earthTerrainCutoff,
  };

  const solarFraction = calculateSolarIlluminationFraction(sun, sunTerrainCutoff);
  const dteStatus = evaluateDteLinkStatus(earth, earthTerrainCutoff);
  const { rating, reasons } = evaluateMissionWindowRating(sun, sunTerrainCutoff, earth, earthTerrainCutoff);

  return {
    timestamp: date.toISOString(),
    sun,
    earth,
    solarIlluminationFraction: solarFraction,
    dteStatus,
    windowRating: rating,
    reasons,
  };
}

export function evaluateWindowForecast(
  site: LandingSite,
  startDate: Date,
  daysCount: number = 14,
  stepHours: number = 6
): TelemetrySample[] {
  const samples: TelemetrySample[] = [];
  const totalSteps = Math.floor((daysCount * 24) / stepHours);

  for (let i = 0; i <= totalSteps; i++) {
    const sampleDate = new Date(startDate.getTime() + i * stepHours * 3600 * 1000);
    samples.push(sampleTelemetry(site, sampleDate));
  }

  return samples;
}
