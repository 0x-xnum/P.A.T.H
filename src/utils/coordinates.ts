import { LunarCoordinates } from '../types';

export const LUNAR_RADIUS_KM = 1737.4;

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function normalizeAngle(angleDeg: number): number {
  let normalized = angleDeg % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

export function sphericalToCartesian(coords: LunarCoordinates): [number, number, number] {
  const latRad = degToRad(coords.latitude);
  const lonRad = degToRad(coords.longitude);
  const r = LUNAR_RADIUS_KM + (coords.elevationMeters || 0) / 1000;

  const x = r * Math.cos(latRad) * Math.cos(lonRad);
  const y = r * Math.cos(latRad) * Math.sin(lonRad);
  const z = r * Math.sin(latRad);

  return [x, y, z];
}

export function greatCircleDistanceKm(siteA: LunarCoordinates, siteB: LunarCoordinates): number {
  const phi1 = degToRad(siteA.latitude);
  const phi2 = degToRad(siteB.latitude);
  const deltaPhi = degToRad(siteB.latitude - siteA.latitude);
  const deltaLambda = degToRad(siteB.longitude - siteA.longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return LUNAR_RADIUS_KM * c;
}

export function formatCoordinates(coords: LunarCoordinates): string {
  const lat = Math.abs(coords.latitude).toFixed(2);
  const latDir = coords.latitude >= 0 ? 'N' : 'S';
  const lon = Math.abs(coords.longitude).toFixed(2);
  const lonDir = coords.longitude >= 0 ? 'E' : 'W';
  return `${lat}° ${latDir}, ${lon}° ${lonDir}`;
}
