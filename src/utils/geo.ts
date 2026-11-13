import type { Coords } from '../types/trip';

export interface BearingMetrics {
  distanceKm: string;
  bearingDeg: number;
  dirLabel: string;
}

/**
 * 計算兩組經緯度之間的距離（公里）與 8 方位中文方向
 */
export function getBearingAndDistance(fromCoords: Coords, toCoords: Coords): BearingMetrics {
  const [lat1, lon1] = fromCoords;
  const [lat2, lon2] = toCoords;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearingDeg = (toDeg(Math.atan2(y, x)) + 360) % 360;

  const dirs = ['正北', '東北', '正東', '東南', '正南', '西南', '正西', '西北'] as const;
  const dirLabel = dirs[Math.round(bearingDeg / 45) % 8];

  return {
    distanceKm: distanceKm.toFixed(1),
    bearingDeg: Math.round(bearingDeg),
    dirLabel
  };
}

export function getGoogleMapsUrl(item: { googleQuery?: string; location?: string; title: string }): string {
  const q = encodeURIComponent(item.googleQuery || item.location || item.title);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function getGoogleMapsDirectionsUrl(
  fromCoords: Coords,
  toCoords: Coords,
  travelMode: 'transit' | 'walking' | 'driving' = 'transit'
): string {
  const origin = `${fromCoords[0]},${fromCoords[1]}`;
  const dest = `${toCoords[0]},${toCoords[1]}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${travelMode}`;
}
