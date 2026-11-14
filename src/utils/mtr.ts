import type { Coords } from '../types/trip';
import {
  MTR_LINE_DEFS,
  MTR_STATION_DEFS,
  MTR_WALKWAYS,
  type MtrLineDef,
  type MtrLineId,
  type MtrStationDef
} from '../data/mtrNetwork';

export type Pt = [number, number];

export interface MtrStation extends MtrStationDef {
  lines: MtrLineId[];
  isInterchange: boolean;
  /** 地理模式座標（由經緯度投影） */
  geo: Pt;
}

export interface MtrLine extends MtrLineDef {
  /** 每個 segment 依序的車站 id（去除轉折點） */
  stationSeqs: string[][];
  /** 每個 segment 的示意圖點位與地理點位（點數一致，可補間動畫） */
  schematicPaths: Pt[][];
  geoPaths: Pt[][];
}

// ───────────────────────── 地理投影 ─────────────────────────
const GEO_BOUNDS = { minLat: 22.235, maxLat: 22.535, minLng: 113.925, maxLng: 114.275 };
const COS_LAT = Math.cos((22.35 * Math.PI) / 180);
const GEO_SCALE = 1440 / ((GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng) * COS_LAT);

export function projectGeo([lat, lng]: Coords): Pt {
  return [40 + (lng - GEO_BOUNDS.minLng) * COS_LAT * GEO_SCALE, -480 + (GEO_BOUNDS.maxLat - lat) * GEO_SCALE];
}

// ───────────────────────── 網絡建構 ─────────────────────────
const stationLines = new Map<string, Set<MtrLineId>>();
for (const line of MTR_LINE_DEFS) {
  for (const seg of line.segments) {
    for (const tok of seg) {
      if (typeof tok !== 'string') continue;
      const id = tok.split('@')[0];
      if (!stationLines.has(id)) stationLines.set(id, new Set());
      stationLines.get(id)!.add(line.id);
    }
  }
}

export const STATIONS: MtrStation[] = MTR_STATION_DEFS.map((s) => {
  const lines = [...(stationLines.get(s.id) ?? [])];
  const walk = MTR_WALKWAYS.some((w) => w.a === s.id || w.b === s.id);
  return { ...s, lines, isInterchange: lines.length > 1 || walk, geo: projectGeo(s.coords) };
});

export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));
export const LINE_BY_ID = new Map<MtrLineId, MtrLineDef>(MTR_LINE_DEFS.map((l) => [l.id, l]));

function tokenSchematic(tok: string): Pt {
  const [id, track] = tok.split('@');
  const st = STATION_BY_ID.get(id);
  if (!st) throw new Error(`Unknown station ${id}`);
  return track === '2' && st.pos2 ? st.pos2 : st.pos;
}

export const LINES: MtrLine[] = MTR_LINE_DEFS.map((line) => {
  const stationSeqs: string[][] = [];
  const schematicPaths: Pt[][] = [];
  const geoPaths: Pt[][] = [];

  for (const seg of line.segments) {
    const schem: Pt[] = seg.map((tok) => (typeof tok === 'string' ? tokenSchematic(tok) : tok));
    // 地理模式：車站用真實投影，轉折點則在前後兩站之間依序內插
    const geo: Pt[] = new Array(seg.length);
    const stationIdx = seg.map((tok, i) => (typeof tok === 'string' ? i : -1)).filter((i) => i >= 0);
    for (const i of stationIdx) geo[i] = STATION_BY_ID.get((seg[i] as string).split('@')[0])!.geo;
    for (let k = 0; k < stationIdx.length - 1; k++) {
      const a = stationIdx[k];
      const b = stationIdx[k + 1];
      for (let i = a + 1; i < b; i++) {
        const t = (i - a) / (b - a);
        geo[i] = [geo[a][0] + (geo[b][0] - geo[a][0]) * t, geo[a][1] + (geo[b][1] - geo[a][1]) * t];
      }
    }
    stationSeqs.push(stationIdx.map((i) => (seg[i] as string).split('@')[0]));
    schematicPaths.push(schem);
    geoPaths.push(geo);
  }
  return { ...line, stationSeqs, schematicPaths, geoPaths };
});

/** 某路綫在某站使用的示意圖點（平行膠囊站會不同） */
export function stationPointOnLine(stationId: string, lineId: MtrLineId): Pt {
  const def = LINE_BY_ID.get(lineId)!;
  for (const seg of def.segments) {
    for (const tok of seg) {
      if (typeof tok === 'string' && tok.split('@')[0] === stationId) return tokenSchematic(tok);
    }
  }
  return STATION_BY_ID.get(stationId)!.pos;
}

// ───────────────────────── 幾何工具 ─────────────────────────
export function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** 折線轉成圓角 SVG path（路綫圖風格） */
export function roundedPath(points: Pt[], radius = 16): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    if (d1 < 0.01 || d2 < 0.01) continue;
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const a: Pt = [p1[0] + ((p0[0] - p1[0]) / d1) * r, p1[1] + ((p0[1] - p1[1]) / d1) * r];
    const b: Pt = [p1[0] + ((p2[0] - p1[0]) / d2) * r, p1[1] + ((p2[1] - p1[1]) / d2) * r];
    d += `L${a[0].toFixed(1)},${a[1].toFixed(1)}Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
}

export function boundsOf(points: Pt[], pad = 0) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

// ───────────────────────── 距離與方位 ─────────────────────────
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'] as const;
export const bearingLabel = (deg: number) => DIRS[Math.round(deg / 45) % 8];

/** 市區步行：直線距離 × 1.3 繞行係數，時速 4.8 km */
export const walkMinutes = (km: number) => Math.max(1, Math.round(((km * 1.3) / 4.8) * 60));

export interface NearbyStation {
  station: MtrStation;
  km: number;
  bearing: number;
  walkMin: number;
}

export function rankNearestStations(coords: Coords, limit = 5): NearbyStation[] {
  return STATIONS.map((station) => {
    const km = haversineKm(coords, station.coords);
    return { station, km, bearing: bearingDeg(coords, station.coords), walkMin: walkMinutes(km) };
  })
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/** 把使用者 GPS 位置投影到示意路綫圖上（找最近的實際路段，再於示意圖上按比例內插） */
export function projectUserToSchematic(coords: Coords): Pt | null {
  let best = Infinity;
  let result: Pt | null = null;
  const cos = Math.cos((coords[0] * Math.PI) / 180);
  const px = coords[1] * cos;
  const py = coords[0];
  for (const line of LINES) {
    for (const seq of line.stationSeqs) {
      for (let i = 0; i < seq.length - 1; i++) {
        const A = STATION_BY_ID.get(seq[i])!;
        const B = STATION_BY_ID.get(seq[i + 1])!;
        const ax = A.coords[1] * cos, ay = A.coords[0];
        const bx = B.coords[1] * cos, by = B.coords[0];
        const abx = bx - ax, aby = by - ay;
        const len = abx * abx + aby * aby;
        if (!len) continue;
        const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len));
        const dx = px - (ax + t * abx), dy = py - (ay + t * aby);
        const dist = dx * dx + dy * dy;
        if (dist < best) {
          best = dist;
          result = lerpPt(stationPointOnLine(A.id, line.id), stationPointOnLine(B.id, line.id), t);
        }
      }
    }
  }
  return result;
}

// ───────────────────────── 路線規劃（Dijkstra） ─────────────────────────
interface Edge {
  to: string; // node key: `${stationId}|${lineId}` 或 `${stationId}|walk`
  minutes: number;
  kind: 'ride' | 'transfer' | 'walk';
}

const TRANSFER_MIN = 4;
const rideMinutes = (a: MtrStation, b: MtrStation) => Math.max(1.6, haversineKm(a.coords, b.coords) / 0.62 + 0.6);

const graph = new Map<string, Edge[]>();
const addEdge = (from: string, edge: Edge) => {
  if (!graph.has(from)) graph.set(from, []);
  graph.get(from)!.push(edge);
};

for (const line of LINES) {
  for (const seq of line.stationSeqs) {
    for (let i = 0; i < seq.length - 1; i++) {
      const a = STATION_BY_ID.get(seq[i])!;
      const b = STATION_BY_ID.get(seq[i + 1])!;
      const m = rideMinutes(a, b);
      addEdge(`${a.id}|${line.id}`, { to: `${b.id}|${line.id}`, minutes: m, kind: 'ride' });
      addEdge(`${b.id}|${line.id}`, { to: `${a.id}|${line.id}`, minutes: m, kind: 'ride' });
    }
  }
}
for (const st of STATIONS) {
  for (const l1 of st.lines) {
    for (const l2 of st.lines) {
      if (l1 !== l2) addEdge(`${st.id}|${l1}`, { to: `${st.id}|${l2}`, minutes: TRANSFER_MIN, kind: 'transfer' });
    }
  }
}
for (const w of MTR_WALKWAYS) {
  const A = STATION_BY_ID.get(w.a)!;
  const B = STATION_BY_ID.get(w.b)!;
  for (const la of A.lines) {
    for (const lb of B.lines) {
      addEdge(`${A.id}|${la}`, { to: `${B.id}|${lb}`, minutes: w.minutes, kind: 'walk' });
      addEdge(`${B.id}|${lb}`, { to: `${A.id}|${la}`, minutes: w.minutes, kind: 'walk' });
    }
  }
}

export interface RouteLeg {
  kind: 'ride' | 'walk';
  lineId?: MtrLineId;
  stations: string[];
  minutes: number;
}

export interface RoutePlan {
  from: string;
  to: string;
  legs: RouteLeg[];
  totalMinutes: number;
  stops: number;
  transfers: number;
}

export function planRoute(fromId: string, toId: string): RoutePlan | null {
  const from = STATION_BY_ID.get(fromId);
  const to = STATION_BY_ID.get(toId);
  if (!from || !to) return null;
  if (fromId === toId) return { from: fromId, to: toId, legs: [], totalMinutes: 0, stops: 0, transfers: 0 };

  const dist = new Map<string, number>();
  const prev = new Map<string, { key: string; edge: Edge }>();
  const open = new Set<string>();
  for (const l of from.lines) {
    const k = `${from.id}|${l}`;
    dist.set(k, 0);
    open.add(k);
  }
  let endKey: string | null = null;
  while (open.size) {
    let cur = '';
    let curD = Infinity;
    for (const k of open) {
      const d = dist.get(k)!;
      if (d < curD) {
        curD = d;
        cur = k;
      }
    }
    open.delete(cur);
    if (cur.startsWith(`${to.id}|`)) {
      endKey = cur;
      break;
    }
    for (const e of graph.get(cur) ?? []) {
      const nd = curD + e.minutes;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, { key: cur, edge: e });
        open.add(e.to);
      }
    }
  }
  if (!endKey) return null;

  // 回溯成 [node, edge] 序列
  const steps: Array<{ key: string; edge: Edge | null }> = [{ key: endKey, edge: null }];
  let k = endKey;
  while (prev.has(k)) {
    const p = prev.get(k)!;
    steps[0].edge = p.edge;
    steps.unshift({ key: p.key, edge: null });
    k = p.key;
  }

  const legs: RouteLeg[] = [];
  for (let i = 0; i < steps.length - 1; i++) {
    const [aId, aLine] = steps[i].key.split('|');
    const [bId] = steps[i + 1].key.split('|');
    const edge = steps[i + 1].edge!;
    if (edge.kind === 'transfer') continue;
    if (edge.kind === 'walk') {
      legs.push({ kind: 'walk', stations: [aId, bId], minutes: edge.minutes });
      continue;
    }
    const last = legs[legs.length - 1];
    if (last && last.kind === 'ride' && last.lineId === aLine && last.stations[last.stations.length - 1] === aId) {
      last.stations.push(bId);
      last.minutes += edge.minutes;
    } else {
      legs.push({ kind: 'ride', lineId: aLine as MtrLineId, stations: [aId, bId], minutes: edge.minutes });
    }
  }
  const rides = legs.filter((l) => l.kind === 'ride');
  return {
    from: fromId,
    to: toId,
    legs: legs.map((l) => ({ ...l, minutes: Math.round(l.minutes) })),
    totalMinutes: Math.round(dist.get(endKey)!),
    stops: rides.reduce((n, l) => n + l.stations.length - 1, 0),
    transfers: Math.max(0, legs.length - 1)
  };
}

/** 路線在示意圖／地理圖上的點序列（用於高亮與小列車動畫） */
export function routePoints(plan: RoutePlan, mode: 'schematic' | 'geo'): Pt[][] {
  return plan.legs.map((leg) =>
    leg.stations.map((id) => {
      const st = STATION_BY_ID.get(id)!;
      if (mode === 'geo') return st.geo;
      return leg.lineId ? stationPointOnLine(id, leg.lineId) : st.pos;
    })
  );
}

export function searchStations(q: string): MtrStation[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return STATIONS.map((st) => {
    const hay = [st.zh, st.en.toLowerCase(), st.code, st.nearby ?? ''];
    const score = hay[0].startsWith(s) || hay[1].startsWith(s) || hay[2] === s ? 3 : hay.some((h) => h.toLowerCase().includes(s)) ? 1 : 0;
    return { st, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((r) => r.st);
}
