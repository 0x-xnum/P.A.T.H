import {
  LandingSite,
  TelemetrySample,
  DteLinkStatus,
  MissionWindowRating,
  CelestialBodyPosition,
} from '../types';
import { getSunPosition, getEarthPosition } from './ephemeris';

export const SOLAR_CONSTANT_W_M2 = 1361;

export function calculateSolarIlluminationFraction(sunPosition: CelestialBodyPosition): number {
  if (sunPosition.elevation <= 0) {
    return 0;
  }
  const elevationRad = (sunPosition.elevation * Math.PI) / 180;
  const verticalPanelFactor = Math.cos(elevationRad);
  return Number(Math.min(1.0, Math.max(0.0, verticalPanelFactor)).toFixed(3));
}

export function evaluateDteLinkStatus(earthPosition: CelestialBodyPosition): DteLinkStatus {
  if (earthPosition.elevation > 1.0) {
    return 'connected';
  } else if (earthPosition.elevation > 0.0) {
    return 'marginal';
  } else {
    return 'blackout';
  }
}

export function evaluateMissionWindowRating(
  sunPosition: CelestialBodyPosition,
  earthPosition: CelestialBodyPosition
): { rating: MissionWindowRating; reasons: string[] } {
  const reasons: string[] = [];

  const sunSafe = sunPosition.elevation > 0.5;
  const sunMarginal = sunPosition.elevation > 0.0;
  const earthSafe = earthPosition.elevation > 1.0;
  const earthMarginal = earthPosition.elevation > 0.0;

  if (sunSafe) {
    reasons.push('Solar arrays clear of terrain shadow; continuous power generation active.');
  } else if (sunMarginal) {
    reasons.push('Grazing solar illumination; low incident power on vertical photovoltaic arrays.');
  } else {
    reasons.push('Solar occlusion; site immersed in topographic shadow with thermal freeze risk.');
  }

  if (earthSafe) {
    reasons.push('Direct-to-Earth line-of-sight established; high-bandwidth DSN comm link nominal.');
  } else if (earthMarginal) {
    reasons.push('Low Earth horizon elevation; multipath degradation risk for radio communications.');
  } else {
    reasons.push('Earth occluded below local horizon; complete radio blackout for direct telemetry.');
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
  const sun = getSunPosition(site.coordinates, date);
  const earth = getEarthPosition(site.coordinates, date);
  const solarFraction = calculateSolarIlluminationFraction(sun);
  const dteStatus = evaluateDteLinkStatus(earth);
  const { rating, reasons } = evaluateMissionWindowRating(sun, earth);

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
