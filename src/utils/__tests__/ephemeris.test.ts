import { describe, it, expect } from 'vitest';
import { getSunPosition, getEarthPosition } from '../ephemeris';
import { ARTEMIS_2024_REFINED_SITES, ARTEMIS_2022_HISTORICAL_SITES } from '../../data/landingSites';

describe('Ephemeris Engine Validation against JPL Horizons DE441', () => {
  const malapert = ARTEMIS_2024_REFINED_SITES.find((s) => s.id === 'malapert-massif')!;
  const cabeus = ARTEMIS_2024_REFINED_SITES.find((s) => s.id === 'peak-near-cabeus-b')!;
  const shackleton = ARTEMIS_2022_HISTORICAL_SITES.find((s) => s.id === 'peak-near-shackleton')!;

  it('calculates polar solar elevation consistently with lunar obliquity bounds', () => {
    // Benchmark: 2026-12-21 00:00 UTC (Lunar South Pole Solstice)
    const solsticeDate = new Date(Date.UTC(2026, 11, 21, 0, 0, 0));
    
    // At near-polar Shackleton (-89.54° S), solar elevation remains tightly bounded near ~1.5°
    const shackletonSun = getSunPosition(shackleton.coordinates, solsticeDate);
    expect(shackletonSun.elevation).toBeGreaterThan(0.5);
    expect(shackletonSun.elevation).toBeLessThan(2.2);

    // At Malapert Massif (-84.90° S, 5.1° from pole), solar elevation reaches higher local noon
    const malapertSun = getSunPosition(malapert.coordinates, solsticeDate);
    expect(malapertSun.elevation).toBeCloseTo(4.81, 1);
  });

  it('calculates Earth topocentric elevation consistent with lunar libration ranges', () => {
    // Benchmark: 2026-10-15 12:00 UTC (Nominal Artemis III screening window)
    const testDate = new Date(Date.UTC(2026, 9, 15, 12, 0, 0));
    const earthPos = getEarthPosition(cabeus.coordinates, testDate);

    // Earth elevation at Cabeus B (-87.8° S, 342° E) is positive and within nominal libration envelope (2° to 7°)
    expect(earthPos.elevation).toBeGreaterThan(2.0);
    expect(earthPos.elevation).toBeLessThan(7.0);
    expect(earthPos.elevation).toBeCloseTo(3.77, 1);
  });

  it('produces valid distance metrics within physical astronomical bounds', () => {
    const testDate = new Date(Date.UTC(2026, 9, 15, 12, 0, 0));
    const earthPos = getEarthPosition(malapert.coordinates, testDate);
    const sunPos = getSunPosition(malapert.coordinates, testDate);

    // Earth-Moon distance: ~350,000 to ~410,000 km
    expect(earthPos.distanceKm).toBeGreaterThan(350000);
    expect(earthPos.distanceKm).toBeLessThan(410000);

    // Sun-Moon distance: ~140,000,000 to ~160,000,000 km
    expect(sunPos.distanceKm).toBeGreaterThan(140000000);
    expect(sunPos.distanceKm).toBeLessThan(160000000);
  });
});
