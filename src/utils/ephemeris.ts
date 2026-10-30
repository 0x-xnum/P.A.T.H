import { CelestialBodyPosition, LunarCoordinates } from '../types';
import { degToRad, radToDeg, normalizeAngle, LUNAR_RADIUS_KM } from './coordinates';

const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const SYNODIC_MONTH_DAYS = 29.530588861;
const ANOMALISTIC_MONTH_DAYS = 27.554551;
const DRACONIC_MONTH_DAYS = 27.212220;
const TROPICAL_YEAR_DAYS = 365.24219;

const MOON_OBLIQUITY_DEG = 1.5424;
const EARTH_MEAN_DISTANCE_KM = 384400;
const SUN_MEAN_DISTANCE_KM = 149597870;

const LIBRATION_LON_AMPLITUDE_DEG = 7.7;
const LIBRATION_LAT_AMPLITUDE_DEG = 6.7;

function getDaysSinceJ2000(date: Date): number {
  return (date.getTime() - J2000_EPOCH_MS) / (1000 * 60 * 60 * 24);
}

export function calculateSubSolarCoordinates(date: Date): { latitude: number; longitude: number } {
  const days = getDaysSinceJ2000(date);

  const yearFraction = (days % TROPICAL_YEAR_DAYS) / TROPICAL_YEAR_DAYS;
  const solarDeclination = MOON_OBLIQUITY_DEG * Math.sin(yearFraction * 2 * Math.PI);

  const solarCycleFraction = (days % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  const subSolarLongitude = normalizeAngle(180 - solarCycleFraction * 360);

  return {
    latitude: solarDeclination,
    longitude: subSolarLongitude,
  };
}

export function calculateSubEarthCoordinates(date: Date): { latitude: number; longitude: number } {
  const days = getDaysSinceJ2000(date);

  const lonPhase = (days % ANOMALISTIC_MONTH_DAYS) / ANOMALISTIC_MONTH_DAYS;
  const latPhase = (days % DRACONIC_MONTH_DAYS) / DRACONIC_MONTH_DAYS;

  const subEarthLon = LIBRATION_LON_AMPLITUDE_DEG * Math.sin(lonPhase * 2 * Math.PI);
  const subEarthLat = LIBRATION_LAT_AMPLITUDE_DEG * Math.sin(latPhase * 2 * Math.PI);

  return {
    latitude: subEarthLat,
    longitude: subEarthLon,
  };
}

export function calculateTopocentricPosition(
  site: LunarCoordinates,
  targetSubLat: number,
  targetSubLon: number,
  targetDistanceKm: number
): CelestialBodyPosition {
  const phi = degToRad(site.latitude);
  const delta = degToRad(targetSubLat);
  const hourAngle = degToRad(site.longitude - targetSubLon);

  const sinElevation = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(hourAngle);
  let elevationDeg = radToDeg(Math.asin(Math.max(-1, Math.min(1, sinElevation))));

  const parallaxDeg = radToDeg(LUNAR_RADIUS_KM / targetDistanceKm);
  elevationDeg -= parallaxDeg;

  const y = Math.sin(hourAngle);
  const x = Math.cos(hourAngle) * Math.sin(phi) - Math.tan(delta) * Math.cos(phi);
  const azimuthRad = Math.atan2(y, x);
  const azimuthDeg = normalizeAngle(radToDeg(azimuthRad) + 180);

  const siteElevationAdjustment = (site.elevationMeters || 0) / 10000;
  const adjustedElevation = elevationDeg + siteElevationAdjustment;

  return {
    elevation: Number(adjustedElevation.toFixed(2)),
    azimuth: Number(azimuthDeg.toFixed(2)),
    distanceKm: Math.round(targetDistanceKm),
    isVisible: adjustedElevation > 0,
  };
}

export function getSunPosition(site: LunarCoordinates, date: Date): CelestialBodyPosition {
  const subSolar = calculateSubSolarCoordinates(date);
  return calculateTopocentricPosition(site, subSolar.latitude, subSolar.longitude, SUN_MEAN_DISTANCE_KM);
}

export function getEarthPosition(site: LunarCoordinates, date: Date): CelestialBodyPosition {
  const subEarth = calculateSubEarthCoordinates(date);
  return calculateTopocentricPosition(site, subEarth.latitude, subEarth.longitude, EARTH_MEAN_DISTANCE_KM);
}
