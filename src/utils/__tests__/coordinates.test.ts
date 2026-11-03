import { describe, it, expect } from 'vitest';
import { degToRad, radToDeg, normalizeAngle, formatCoordinates } from '../coordinates';

describe('Lunar Coordinate Utilities', () => {
  it('converts degrees to radians accurately', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    expect(degToRad(0)).toBe(0);
  });

  it('converts radians to degrees accurately', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it('normalizes angles within 0 to 360 degrees', () => {
    expect(normalizeAngle(370)).toBe(10);
    expect(normalizeAngle(-30)).toBe(330);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
  });

  it('formats selenographic coordinates with correct cardinal direction letters', () => {
    expect(formatCoordinates({ latitude: -88.5, longitude: 120.0 })).toBe('88.50° S, 120.00° E');
    expect(formatCoordinates({ latitude: 15.0, longitude: -45.0 })).toBe('15.00° N, 45.00° W');
  });
});
