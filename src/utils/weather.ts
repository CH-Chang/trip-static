import { useEffect, useState } from 'react';

/**
 * 香港天文台開放數據（Hong Kong Observatory Open Data API）
 * - 九天天氣預報 fnd：https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc
 * - 本港地區天氣報告 rhrread（即時氣溫）
 * - 天氣警告摘要 warnsum（颱風、暴雨等）
 * API 支援 CORS，可直接從瀏覽器取得；每 30 分鐘自動更新並快取在 localStorage（離線時顯示上次資料）。
 */

const API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php';
const CACHE_KEY = 'hk-trip-2026-weather-v2';
const REFRESH_MS = 30 * 60 * 1000;

export const WEATHER_SOURCE = {
  name: '香港天文台 Hong Kong Observatory',
  short: '香港天文台',
  url: 'https://www.hko.gov.hk/tc/wxinfo/currwx/fnd.htm',
  license: 'https://data.gov.hk/tc/terms-and-conditions'
};

export const TAOYUAN_SOURCE = {
  name: 'Open-Meteo 數值模式',
  short: 'Open-Meteo',
  url: 'https://open-meteo.com/',
  place: '桃園國際機場'
};

/** 桃園機場（出發／返台日）每日預報 */
export interface TaoyuanDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  /** 降雨機率 % */
  pop: number | null;
  code: number;
}

/** WMO 天氣代碼 → 中文描述與單字標記 */
export function wmoText(code: number): { text: string; glyph: string } {
  if (code === 0) return { text: '晴朗', glyph: '晴' };
  if (code <= 2) return { text: '晴時多雲', glyph: '晴' };
  if (code === 3) return { text: '陰天', glyph: '陰' };
  if (code <= 48) return { text: '有霧', glyph: '霧' };
  if (code <= 57) return { text: '毛毛雨', glyph: '雨' };
  if (code <= 67) return { text: '下雨', glyph: '雨' };
  if (code <= 77) return { text: '降雪', glyph: '雪' };
  if (code <= 82) return { text: '陣雨', glyph: '雨' };
  return { text: '雷雨', glyph: '雷' };
}

export interface DayForecast {
  date: string; // YYYY-MM-DD
  week: string;
  weather: string;
  wind: string;
  maxTemp: number;
  minTemp: number;
  maxRh: number;
  minRh: number;
  icon: number;
  /** 顯著降雨概率：高／中高／中／中低／低 */
  psr: string;
}

export interface WeatherWarning {
  code: string;
  name: string;
}

export interface WeatherData {
  forecasts: DayForecast[];
  generalSituation: string;
  currentTemp?: { value: number; place: string };
  humidity?: number;
  warnings: WeatherWarning[];
  /** 桃園機場預報（Open-Meteo） */
  taoyuan: TaoyuanDay[];
  /** 天文台發布時間 */
  issuedAt?: string;
  /** 本機取得時間 */
  fetchedAt: number;
}

export const hkoIconUrl = (icon: number) => `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${icon}.png`;

interface FndResponse {
  generalSituation: string;
  updateTime: string;
  weatherForecast: Array<{
    forecastDate: string;
    week: string;
    forecastWind: string;
    forecastWeather: string;
    forecastMaxtemp: { value: number };
    forecastMintemp: { value: number };
    forecastMaxrh: { value: number };
    forecastMinrh: { value: number };
    ForecastIcon: number;
    PSR: string;
  }>;
}

interface RhrreadResponse {
  temperature?: { data: Array<{ place: string; value: number }> };
  humidity?: { data: Array<{ value: number }> };
}

type WarnsumResponse = Record<string, { name: string; code: string }>;

async function getJson<T>(dataType: string): Promise<T> {
  const res = await fetch(`${API}?dataType=${dataType}&lang=tc`);
  if (!res.ok) throw new Error(`HKO ${dataType} ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchTaoyuan(): Promise<TaoyuanDay[]> {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=25.0797&longitude=121.2342&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTaipei&forecast_days=16';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo ' + res.status);
  const j = (await res.json()) as {
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[] };
  };
  return j.daily.time.map((date, i) => ({
    date,
    code: j.daily.weather_code[i],
    maxTemp: Math.round(j.daily.temperature_2m_max[i]),
    minTemp: Math.round(j.daily.temperature_2m_min[i]),
    pop: j.daily.precipitation_probability_max[i]
  }));
}

export async function fetchWeather(): Promise<WeatherData> {
  const [fnd, now, warn, taoyuan] = await Promise.all([
    getJson<FndResponse>('fnd'),
    getJson<RhrreadResponse>('rhrread').catch(() => null),
    getJson<WarnsumResponse>('warnsum').catch(() => ({}) as WarnsumResponse),
    fetchTaoyuan().catch(() => [] as TaoyuanDay[])
  ]);
  const hko = now?.temperature?.data.find((d) => d.place === '香港天文台') ?? now?.temperature?.data[0];
  return {
    forecasts: fnd.weatherForecast.map((f) => ({
      date: `${f.forecastDate.slice(0, 4)}-${f.forecastDate.slice(4, 6)}-${f.forecastDate.slice(6, 8)}`,
      week: f.week,
      weather: f.forecastWeather,
      wind: f.forecastWind,
      maxTemp: f.forecastMaxtemp.value,
      minTemp: f.forecastMintemp.value,
      maxRh: f.forecastMaxrh.value,
      minRh: f.forecastMinrh.value,
      icon: f.ForecastIcon,
      psr: f.PSR
    })),
    generalSituation: fnd.generalSituation,
    currentTemp: hko ? { value: hko.value, place: hko.place } : undefined,
    humidity: now?.humidity?.data[0]?.value,
    warnings: Object.values(warn ?? {}).map((w) => ({ code: w.code, name: w.name })),
    taoyuan,
    issuedAt: fnd.updateTime,
    fetchedAt: Date.now()
  };
}

function readCache(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherData) : null;
  } catch {
    return null;
  }
}

// 模組層級共享：多個元件同時使用只會發一次請求
let shared: WeatherData | null = readCache();
let inflight: Promise<WeatherData> | null = null;
const listeners = new Set<(d: WeatherData | null, err: string | null) => void>();

function refresh(force = false) {
  if (inflight) return inflight;
  if (!force && shared && Date.now() - shared.fetchedAt < REFRESH_MS) return Promise.resolve(shared);
  inflight = fetchWeather()
    .then((d) => {
      shared = d;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(d));
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l(d, null));
      return d;
    })
    .catch((e: unknown) => {
      listeners.forEach((l) => l(shared, e instanceof Error ? e.message : '天氣資料暫時無法取得'));
      throw e;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useHkoWeather() {
  const [data, setData] = useState<WeatherData | null>(shared);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!shared);

  useEffect(() => {
    const l = (d: WeatherData | null, err: string | null) => {
      setData(d);
      setError(err);
      setLoading(false);
    };
    listeners.add(l);
    refresh().catch(() => undefined);
    const timer = window.setInterval(() => refresh().catch(() => undefined), REFRESH_MS);
    return () => {
      listeners.delete(l);
      window.clearInterval(timer);
    };
  }, []);

  return {
    data,
    error,
    loading,
    reload: () => {
      setLoading(true);
      refresh(true).catch(() => undefined);
    }
  };
}

/** 依降雨概率給一句旅人建議 */
export function packingHint(f: DayForecast): string {
  if (f.psr === '高' || f.psr === '中高') return '帶傘，室內備案優先';
  if (f.maxTemp >= 30) return '炎熱，多補水防曬';
  if (f.minTemp <= 16) return '偏涼，加件薄外套';
  return '適合戶外散步';
}
