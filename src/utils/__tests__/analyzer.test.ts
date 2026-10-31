import { describe, it, expect } from 'vitest';
import {
  calculateSolarIlluminationFraction,
  calculatePhotovoltaicPowerWatts,
  evaluateDteLinkStatus,
  evaluateMissionWindowRating,
  sampleTelemetry,
} from '../analyzer';
import { DEFAULT_LANDING_SITE } from '../../data/landingSites';
import { CelestialBodyPosition } from '../../types';

describe('Mission Feasibility & Topographic Analyzer', () => {
  const dummySunClear: CelestialBodyPosition = {
    elevation: 2.5,
    azimuth: 45,
    distanceKm: 149597870,
    isVisible: true,
  };

  const dummyEarthClear: CelestialBodyPosition = {
    elevation: 4.5,
    azimuth: 180,
    distanceKm: 384400,
    isVisible: true,
  };

  it('evaluates optimal rating when both Sun and Earth clear local LOLA terrain masks', () => {
    const sunMask = 1.0;
    const earthMask = 1.0;
    const { rating } = evaluateMissionWindowRating(dummySunClear, sunMask, dummyEarthClear, earthMask);
    expect(rating).toBe('optimal');
  });

  it('evaluates hazardous rating when Sun is occluded behind terrain ridge', () => {
    const dummySunOccluded: CelestialBodyPosition = {
      elevation: 0.8,
      azimuth: 45,
      distanceKm: 149597870,
      isVisible: false,
    };
    const highCraterRimMask = 2.5; // Crater rim is at +2.5°
    const earthMask = 1.0;

    const { rating } = evaluateMissionWindowRating(dummySunOccluded, highCraterRimMask, dummyEarthClear, earthMask);
    expect(rating).toBe('hazardous');
  });

  it('zeroes photovoltaic yield when Sun is below terrain cutoff', () => {
    const dummySun: CelestialBodyPosition = {
      elevation: 1.2,
      azimuth: 0,
      distanceKm: 149597870,
      isVisible: false,
    };
    const terrainCutoff = 2.0;
    const yieldFraction = calculateSolarIlluminationFraction(dummySun, terrainCutoff);
    expect(yieldFraction).toBe(0);
  });

  it('correctly classifies DTE link state based on terrain clearance margin', () => {
    expect(evaluateDteLinkStatus({ elevation: 3.0, azimuth: 0, distanceKm: 384000, isVisible: true }, 1.0)).toBe('connected');
    expect(evaluateDteLinkStatus({ elevation: 1.2, azimuth: 0, distanceKm: 384000, isVisible: true }, 1.0)).toBe('marginal');
    expect(evaluateDteLinkStatus({ elevation: 0.5, azimuth: 0, distanceKm: 384000, isVisible: false }, 1.0)).toBe('blackout');
  });

  it('generates complete telemetry sample for standard Artemis site', () => {
    const sample = sampleTelemetry(DEFAULT_LANDING_SITE, new Date('2026-10-15T12:00:00Z'));
    expect(sample.timestamp).toBe('2026-10-15T12:00:00.000Z');
    expect(sample.sun).toBeDefined();
    expect(sample.earth).toBeDefined();
    expect(['optimal', 'marginal', 'hazardous']).toContain(sample.windowRating);
    expect(sample.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates physically sound photovoltaic power for 10m² multi-faceted polar array', () => {
    // When Sun is illuminated (fraction = 1.0) at grazing elevation (1.5 deg):
    // Effective aperture = 10 / pi * cos(1.5°) ≈ 3.18 m²
    // Expected power = 1361 * 3.18 * 0.32 ≈ 1386 Watts
    const powerClear = calculatePhotovoltaicPowerWatts(1.0, 1.5);
    expect(powerClear).toBeGreaterThan(1300);
    expect(powerClear).toBeLessThan(1450);

    // When occluded (fraction = 0):
    const powerOccluded = calculatePhotovoltaicPowerWatts(0, 1.5);
    expect(powerOccluded).toBe(0);
  });
});
