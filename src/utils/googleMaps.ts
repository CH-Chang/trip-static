/**
 * Google Maps JavaScript API 載入器
 * - 有設定 VITE_GOOGLE_MAPS_API_KEY 才會載入；沒有 key、載入失敗、或 key 被撤銷／網域不符
 *   （Google 會呼叫 window.gm_authFailure）時，一律退回 OpenStreetMap。
 * - 免費額度：Dynamic Maps 每月 10,000 次載入（Essentials），請在 Cloud Console 設網域限制與每日上限。
 */

const KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
export const hasGoogleMapsKey = Boolean(KEY);

let loader: Promise<void> | null = null;
let authFailed = false;
const failListeners = new Set<() => void>();

type GmWindow = Window & {
  google?: { maps?: { Map?: unknown; importLibrary?: (name: string) => Promise<unknown> } };
  __hkTripGmInit?: () => void;
  gm_authFailure?: () => void;
};

export const googleMapsFailed = () => authFailed;

/** key 無效或被撤銷時通知（地圖改用 OSM） */
export function onGoogleMapsFailure(cb: () => void): () => void {
  failListeners.add(cb);
  return () => failListeners.delete(cb);
}

export function loadGoogleMaps(): Promise<void> {
  const w = window as GmWindow;
  if (!KEY || authFailed) return Promise.reject(new Error('Google Maps 未啟用'));
  if (w.google?.maps?.Map) return Promise.resolve();
  if (!loader) {
    w.gm_authFailure = () => {
      authFailed = true;
      console.warn('[map] Google Maps 驗證失敗（key 無效、被撤銷或網域未授權），改用 OpenStreetMap');
      failListeners.forEach((l) => l());
    };
    loader = new Promise<void>((resolve, reject) => {
      w.__hkTripGmInit = () => {
        // loading=async 時需透過 importLibrary 取得 Map 類別
        Promise.resolve(w.google?.maps?.importLibrary?.('maps')).then(() => resolve(), reject);
      };
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&language=zh-TW&region=HK&loading=async&callback=__hkTripGmInit`;
      s.async = true;
      s.onerror = () => {
        loader = null;
        reject(new Error('Google Maps 載入失敗'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

/** 日系淡色樣式 */
export const GMAP_STYLE_LIGHT = [
  { elementType: 'geometry', stylers: [{ color: '#f3f0ea' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5b5650' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f5f0' }] },
  { elementType: 'labels.icon', stylers: [{ saturation: -60 }, { lightness: 15 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfdfe6' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6f8a96' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#efe3cf' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e2d4bb' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ebe6dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dfe8d8' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#2b2a28' }] }
];

/** 夜行版樣式 */
export const GMAP_STYLE_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#1d2025' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a39e95' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#15171b' }] },
  { elementType: 'labels.icon', stylers: [{ saturation: -70 }, { lightness: -20 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1a24' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4f6b7a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2e35' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3226' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#22262c' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1f2a24' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#ece8e1' }] }
];
