import { useEffect, useState } from 'react';
import { ITINERARY_DAYS } from '../data/tripData';
import { fetchJsonRetry } from './weather';

/**
 * 日出日落時間
 * - 香港：香港天文台開放數據 dataType=SRS（日出、正中天、日落），依月份一次取回
 *   https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=SRS&rformat=json&year=YYYY&month=MM
 * - 桃園機場（第一天出發、最後一天返台）：Open-Meteo daily=sunrise,sunset
 * 結果快取在 localStorage，一天更新一次；離線時沿用上次資料。
 */

export const SUN_SOURCES = {
  hk: { name: '香港天文台', url: 'https://www.hko.gov.hk/tc/abouthko/opendata_intro.htm' },
  tw: { name: 'Open-Meteo', url: 'https://open-meteo.com/' }
};

export interface SunTime {
  rise: string; // HH:MM
  set: string;
  transit?: string;
}

export interface SunData {
  hk: Record<string, SunTime>;
  tw: Record<string, SunTime>;
  fetchedAt: number;
}

const CACHE_KEY = 'hk-trip-sun-v1';
const MAX_AGE = 24 * 60 * 60 * 1000;
const TRIP_DATES = ITINERARY_DAYS.map((d) => d.date);

async function fetchHk(): Promise<Record<string, SunTime>> {
  const months = [...new Set(TRIP_DATES.map((d) => d.slice(0, 7)))];
  const out: Record<string, SunTime> = {};
  for (const ym of months) {
    const [y, m] = ym.split('-');
    const res = await fetch(`https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=SRS&rformat=json&year=${y}&month=${Number(m)}`);
    if (!res.ok) throw new Error(`HKO SRS ${res.status}`);
    const j = (await res.json()) as { fields: string[]; data: string[][] };
    const iDate = j.fields.indexOf('YYYY-MM-DD');
    const iRise = j.fields.indexOf('RISE');
    const iTran = j.fields.findIndex((f) => f.startsWith('TRAN'));
    const iSet = j.fields.indexOf('SET');
    for (const row of j.data) out[row[iDate]] = { rise: row[iRise], set: row[iSet], transit: iTran >= 0 ? row[iTran] : undefined };
  }
  return out;
}

async function fetchTw(): Promise<Record<string, SunTime>> {
  const start = TRIP_DATES[0];
  const end = TRIP_DATES[TRIP_DATES.length - 1];
  const j = await fetchJsonRetry<{ daily: { time: string[]; sunrise: string[]; sunset: string[] } }>(
    `https://api.open-meteo.com/v1/forecast?latitude=25.0797&longitude=121.2342&daily=sunrise,sunset&timezone=Asia%2FTaipei&start_date=${start}&end_date=${end}`
  );
  const out: Record<string, SunTime> = {};
  j.daily.time.forEach((d, i) => (out[d] = { rise: j.daily.sunrise[i].slice(11, 16), set: j.daily.sunset[i].slice(11, 16) }));
  return out;
}

function readCache(): SunData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SunData) : null;
  } catch {
    return null;
  }
}

let shared: SunData | null = readCache();
let inflight: Promise<SunData> | null = null;
const listeners = new Set<(d: SunData | null, err: string | null) => void>();

function load(): Promise<SunData> {
  // 桃園那份上次沒抓到（空物件）就不吃快取，馬上重抓
  if (shared && Date.now() - shared.fetchedAt < MAX_AGE && Object.keys(shared.tw).length > 0) return Promise.resolve(shared);
  if (!inflight) {
    inflight = Promise.all([fetchHk(), fetchTw().catch(() => null)])
      .then(([hk, twFresh]) => {
        const tw = twFresh && Object.keys(twFresh).length > 0 ? twFresh : (shared?.tw ?? {});
        shared = { hk, tw, fetchedAt: Date.now() };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(shared));
        } catch {
          /* ignore */
        }
        listeners.forEach((l) => l(shared, null));
        return shared;
      })
      .catch((e: unknown) => {
        listeners.forEach((l) => l(shared, e instanceof Error ? e.message : '日出日落資料暫時無法取得'));
        throw e;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useSunTimes() {
  const [data, setData] = useState<SunData | null>(shared);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const l = (d: SunData | null, err: string | null) => {
      setData(d);
      setError(err);
    };
    listeners.add(l);
    load().catch(() => undefined);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { data, error };
}

/** 'YYYY-MM-DD' + 'HH:MM'（香港時間）→ 毫秒 */
export const hkMs = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+08:00`).getTime();
