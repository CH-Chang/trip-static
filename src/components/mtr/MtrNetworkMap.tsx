import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion } from 'motion/react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import type { Coords } from '../../types/trip';
import type { MtrLineId } from '../../data/mtrNetwork';
import {
  LINES,
  STATIONS,
  STATION_BY_ID,
  boundsOf,
  lerpPt,
  projectGeo,
  projectUserToSchematic,
  roundedPath,
  routePoints,
  searchStations,
  type MtrStation,
  type Pt,
  type RoutePlan
} from '../../utils/mtr';
import { IconClose, IconCrosshair, IconFit, IconLayers, IconMinus, IconPlus, IconSearch } from '../Icons';

export type MapMode = 'schematic' | 'geo';

interface MtrNetworkMapProps {
  selectedId: string;
  onSelect: (id: string) => void;
  userCoords: Coords | null;
  nearestId: string | null;
  route: RoutePlan | null;
  tripStationIds: Set<string>;
  onLocate: () => void;
  locating: boolean;
}

// 世界座標範圍（示意圖與地理圖的聯集）
const ALL_POINTS: Pt[] = [
  ...STATIONS.flatMap((s) => [s.pos, s.geo, ...(s.pos2 ? [s.pos2] : [])]),
  ...LINES.flatMap((l) => l.schematicPaths.flat())
];
const WB = boundsOf(ALL_POINTS, 110);
const WORLD = { x: WB.minX, y: WB.minY, w: WB.maxX - WB.minX, h: WB.maxY - WB.minY };

const INK = '#2B2A28';
const PAPER = '#FAF6EE';
const ACCENT = '#C8102E';

const LABEL_OFFSETS: Record<string, [number, number, 'start' | 'middle' | 'end']> = {
  l: [-14, 4.5, 'end'],
  r: [14, 4.5, 'start'],
  t: [0, -14, 'middle'],
  b: [0, 22, 'middle'],
  tl: [-10, -10, 'end'],
  tr: [10, -10, 'start'],
  bl: [-10, 20, 'end'],
  br: [10, 20, 'start']
};

export default function MtrNetworkMap({
  selectedId,
  onSelect,
  userCoords,
  nearestId,
  route,
  tripStationIds,
  onLocate,
  locating
}: MtrNetworkMapProps) {
  const [mode, setMode] = useState<MapMode>('schematic');
  const [t, setT] = useState(0); // 0 = 示意圖、1 = 地理圖，補間動畫用
  const [scale, setScale] = useState(1);
  const [focusLine, setFocusLine] = useState<MtrLineId | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const scaleRef = useRef(1);
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const didInit = useRef(false);

  // 模式切換：0 ↔ 1 彈簧補間，車站與路綫同步變形
  useEffect(() => {
    const controls = animate(t, mode === 'geo' ? 1 : 0, {
      type: 'spring',
      stiffness: 70,
      damping: 16,
      onUpdate: (v) => setT(v)
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const tc = Math.max(0, Math.min(1, t));

  const stationPos = useCallback(
    (st: MtrStation, second = false): Pt => lerpPt(second && st.pos2 ? st.pos2 : st.pos, st.geo, tc),
    [tc]
  );

  // ───────── 相機 ─────────
  const getBox = () => {
    const el = containerRef.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 800, h: 600 };
  };
  const fitScale = () => {
    const { w, h } = getBox();
    return Math.min(w / WORLD.w, h / WORLD.h);
  };

  const flyTo = useCallback((p: Pt, s: number, ms = 700) => {
    const { w, h } = getBox();
    const sc = Math.max(fitScale(), Math.min(4, s));
    zoomRef.current?.setTransform(w / 2 - (p[0] - WORLD.x) * sc, h / 2 - (p[1] - WORLD.y) * sc, sc, ms, 'easeInOutCubic');
  }, []);

  const flyToBounds = useCallback(
    (pts: Pt[], ms = 750) => {
      if (!pts.length) return;
      const b = boundsOf(pts, 70);
      const { w, h } = getBox();
      const s = Math.min(w / (b.maxX - b.minX), h / (b.maxY - b.minY), 2.2);
      flyTo([(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2], s, ms);
    },
    [flyTo]
  );

  const defaultZoom = () => (getBox().w < 640 ? 0.95 : 1.15);

  // 選取車站時飛過去
  useEffect(() => {
    const st = STATION_BY_ID.get(selectedId);
    if (!st || !didInit.current || route) return;
    flyTo(stationPos(st), Math.max(scaleRef.current, defaultZoom()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // 有路線時框住整段路線
  useEffect(() => {
    if (!route || !didInit.current || route.legs.length === 0) return;
    flyToBounds(routePoints(route, mode).flat());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  // 模式切換完成後重新對準選取站
  useEffect(() => {
    if (!didInit.current) return;
    const st = STATION_BY_ID.get(selectedId);
    if (!st) return;
    const target = mode === 'geo' ? st.geo : st.pos;
    flyTo(target, mode === 'geo' ? Math.max(scaleRef.current, 1.6) : Math.max(scaleRef.current, defaultZoom()), 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleInit = () => {
    didInit.current = true;
    const st = STATION_BY_ID.get(selectedId);
    if (st) flyTo(st.pos, defaultZoom(), 0);
  };

  const userPoint = useMemo<Pt | null>(() => {
    if (!userCoords) return null;
    const schem = projectUserToSchematic(userCoords);
    const geo = projectGeo(userCoords);
    // 人不在香港範圍內時不畫
    if (geo[0] < WORLD.x || geo[0] > WORLD.x + WORLD.w || geo[1] < WORLD.y || geo[1] > WORLD.y + WORLD.h) return null;
    return schem ? lerpPt(schem, geo, tc) : null;
  }, [userCoords, tc]);

  const results = useMemo(() => searchStations(query), [query]);

  const routeStationIds = useMemo(() => new Set(route?.legs.flatMap((l) => l.stations) ?? []), [route]);
  const routeLineIds = useMemo(() => new Set(route?.legs.map((l) => l.lineId).filter(Boolean)), [route]);

  const handleStationClick = (id: string, e: React.MouseEvent) => {
    const d = downPos.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return; // 是拖曳不是點擊
    onSelect(id);
  };

  // 縮放倍率分級（避免每一幀都重繪整張圖）
  const zoomTier = scale < 0.55 ? 0 : scale < 0.85 ? 1 : scale < 1.6 ? 2 : 3;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#F1EBDF] select-none"
      onPointerDownCapture={(e) => (downPos.current = { x: e.clientX, y: e.clientY })}
    >
      <TransformWrapper
        ref={zoomRef}
        minScale={0.2}
        maxScale={4}
        initialScale={1}
        limitToBounds={false}
        wheel={{ step: 0.12 }}
        pinch={{ step: 6 }}
        doubleClick={{ step: 0.7, animationTime: 280, excluded: ['station-hit'] }}
        velocityAnimation={{ sensitivity: 1, animationTime: 380 }}
        onInit={handleInit}
        onTransformed={(_, s) => {
          scaleRef.current = s.scale;
          setScale((prev) => (Math.abs(prev - s.scale) > 0.04 ? s.scale : prev));
        }}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%', touchAction: 'none' }}>
          <svg
            width={WORLD.w}
            height={WORLD.h}
            viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`}
            className="block"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <MapBackdrop t={tc} />

            <NetworkLines t={tc} focusLine={focusLine} dimAll={Boolean(route)} />

            {route && <RouteOverlay route={route} t={tc} />}

            {/* 步行轉乘通道 */}
            <Walkway a="hong-kong" b="central" pos={stationPos} />
            <Walkway a="tsim-sha-tsui" b="east-tsim-sha-tsui" pos={stationPos} />

            {/* 使用者位置 → 最近車站 */}
            {userPoint && nearestId && (
              <line
                x1={userPoint[0]}
                y1={userPoint[1]}
                x2={stationPos(STATION_BY_ID.get(nearestId)!)[0]}
                y2={stationPos(STATION_BY_ID.get(nearestId)!)[1]}
                stroke={ACCENT}
                strokeWidth={2.5}
                strokeDasharray="5 5"
                className="mtr-march"
              />
            )}

            <StationLayer
              t={tc}
              zoomTier={zoomTier}
              selectedId={selectedId}
              nearestId={nearestId}
              focusLine={focusLine}
              tripStationIds={tripStationIds}
              routeStationIds={routeStationIds}
              routeLineIds={routeLineIds as Set<MtrLineId>}
              hasRoute={Boolean(route)}
              onClick={handleStationClick}
            />

            {userPoint && (
              <g transform={`translate(${userPoint[0]} ${userPoint[1]})`} pointerEvents="none">
                <circle r={22} fill={ACCENT} className="mtr-pulse" />
                <circle r={9} fill={ACCENT} stroke={PAPER} strokeWidth={3.5} />
                <g transform="translate(0 -22)">
                  <rect x={-26} y={-12} width={52} height={20} rx={10} fill={ACCENT} />
                  <text y={2.5} textAnchor="middle" fontSize={11} fontWeight={700} fill={PAPER}>
                    你在這
                  </text>
                </g>
              </g>
            )}
          </svg>
        </TransformComponent>
      </TransformWrapper>

      {/* ───────── 浮動控制 ───────── */}
      <div className="absolute top-3 left-3 right-3 flex items-start gap-2 pointer-events-none">
        <div className="relative pointer-events-auto flex-1 max-w-[280px]">
          <div className="flex items-center gap-2 h-10 px-3 bg-[#FAF6EE]/95 backdrop-blur border border-[#2B2A28]/10 shadow-[3px_3px_0_rgba(31,29,26,0.14)]">
            <IconSearch className="w-4 h-4 text-[#5A554C] shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="搜尋車站或景點"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-[#8A8478]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#5A554C] cursor-pointer" aria-label="清除">
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {searchOpen && results.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute mt-1.5 w-full rounded-2xl bg-[#FAF6EE] border border-[#2B2A28]/10 shadow-[3px_3px_0_rgba(31,29,26,0.14)] overflow-hidden z-10"
              >
                {results.map((st) => (
                  <li key={st.id}>
                    <button
                      onClick={() => {
                        onSelect(st.id);
                        setQuery('');
                        setSearchOpen(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-[#1B4332]/8 cursor-pointer"
                    >
                      <LineDots lines={st.lines} />
                      <span className="text-sm font-semibold">{st.zh}</span>
                      <span className="text-[11px] text-[#5A554C] truncate">{st.en}</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex p-1 bg-[#FAF6EE]/95 backdrop-blur border border-[#2B2A28]/10 shadow-[3px_3px_0_rgba(31,29,26,0.14)]">
            {(['schematic', 'geo'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative px-3 h-8 text-xs font-semibold cursor-pointer"
              >
                {mode === m && (
                  <motion.span
                    layoutId="mtr-mode-pill"
                    className="absolute inset-0 bg-[#1B4332]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative ${mode === m ? 'text-[#F7F5F0]' : 'text-[#5A554C]'}`}>
                  {m === 'schematic' ? '路綫圖' : '地理'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col rounded-2xl bg-[#FAF6EE]/95 backdrop-blur border border-[#2B2A28]/10 shadow-[3px_3px_0_rgba(31,29,26,0.14)] overflow-hidden">
            <MapBtn label="放大" onClick={() => zoomRef.current?.zoomIn(0.5, 240)}><IconPlus /></MapBtn>
            <MapBtn label="縮小" onClick={() => zoomRef.current?.zoomOut(0.5, 240)}><IconMinus /></MapBtn>
            <MapBtn label="顯示全網" onClick={() => zoomRef.current?.centerView(fitScale(), 600, 'easeInOutCubic')}><IconFit /></MapBtn>
            <MapBtn label="定位我的位置" onClick={onLocate} active={locating}>
              <IconCrosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            </MapBtn>
          </div>
        </div>
      </div>

      {/* 路綫圖例（點擊聚焦某條路綫） */}
      <div className="absolute left-0 right-0 bottom-0 p-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-[#FAF6EE]/95 border border-[#2B2A28]/10 flex items-center justify-center text-[#5A554C]">
            <IconLayers className="w-3.5 h-3.5" />
          </span>
          {LINES.map((line) => {
            const active = focusLine === line.id;
            return (
              <motion.button
                key={line.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  const next = active ? null : line.id;
                  setFocusLine(next);
                  if (next) {
                    const pts = (mode === 'geo' ? line.geoPaths : line.schematicPaths).flat();
                    flyToBounds(pts);
                  }
                }}
                className={`shrink-0 h-8 px-3 text-[11px] font-semibold inline-flex items-center gap-1.5 border cursor-pointer transition-colors ${
                  active ? 'text-white border-transparent shadow-[3px_3px_0_rgba(31,29,26,0.14)]' : 'bg-[#FAF6EE]/95 border-[#2B2A28]/10 text-[#2B2A28]'
                }`}
                style={active ? { backgroundColor: line.color } : undefined}
              >
                {!active && <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: line.color }} />}
                {line.zh}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── 子元件 ─────────────────────────

function MapBtn({ children, onClick, label, active }: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 flex items-center justify-center cursor-pointer border-b last:border-b-0 border-[#2B2A28]/8 transition-colors ${
        active ? 'text-[#C8102E]' : 'text-[#2B2A28] hover:bg-[#2B2A28]/5'
      }`}
    >
      {children}
    </motion.button>
  );
}

export function LineDots({ lines }: { lines: MtrLineId[] }) {
  return (
    <span className="inline-flex -space-x-1 shrink-0">
      {lines.map((id) => (
        <span
          key={id}
          className="w-3 h-3 rounded-full ring-2 ring-[#FAF6EE]"
          style={{ backgroundColor: LINES.find((l) => l.id === id)!.color }}
        />
      ))}
    </span>
  );
}

const MapBackdrop = memo(function MapBackdrop({ t }: { t: number }) {
  const o = 1 - t;
  return (
    <g pointerEvents="none">
      {/* 維多利亞港（示意） */}
      <path
        d="M-120,752 C120,738 330,770 520,758 S860,742 1060,770 S1400,800 1640,780 L1640,812 C1400,826 1180,804 1000,800 S700,800 520,806 S160,790 -120,800 Z"
        fill="#5B9BD5"
        fillOpacity={0.16 * o}
      />
      <g opacity={o * 0.55} fontFamily="var(--font-mono)" fontSize={13} letterSpacing={4} fill="#5A554C">
        <text x={1010} y={796} fill="#2B5B84">VICTORIA HARBOUR</text>
        <text x={420} y={-220}>新界 NEW TERRITORIES</text>
        <text x={1010} y={700}>九龍 KOWLOON</text>
        <text x={160} y={940}>香港島 HONG KONG ISLAND</text>
        <text x={-60} y={720}>大嶼山 LANTAU</text>
      </g>
    </g>
  );
});

const NetworkLines = memo(function NetworkLines({
  t,
  focusLine,
  dimAll
}: {
  t: number;
  focusLine: MtrLineId | null;
  dimAll: boolean;
}) {
  const radius = 18 * (1 - t) + 3;
  return (
    <g>
      {LINES.map((line, li) => {
        const dim = dimAll || (focusLine !== null && focusLine !== line.id);
        return line.schematicPaths.map((schem, si) => {
          const pts = schem.map((p, i) => lerpPt(p, line.geoPaths[si][i], t));
          return (
            <motion.path
              key={`${line.id}-${si}`}
              d={roundedPath(pts, radius)}
              fill="none"
              stroke={line.color}
              strokeWidth={focusLine === line.id ? 11 : 8}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: dim ? 0.16 : 1 }}
              transition={{
                pathLength: { duration: 1.1, delay: 0.05 * li, ease: [0.65, 0, 0.35, 1] },
                opacity: { duration: 0.35 }
              }}
            />
          );
        });
      })}
    </g>
  );
});

function RouteOverlay({ route, t }: { route: RoutePlan; t: number }) {
  const schem = routePoints(route, 'schematic');
  const geo = routePoints(route, 'geo');
  const legs = schem.map((leg, i) => leg.map((p, j) => lerpPt(p, geo[i][j], t)));
  const full = legs.flat();
  const fullD = roundedPath(full, 10 * (1 - t) + 2);
  const dur = Math.max(2.5, route.stops * 0.55);
  return (
    <g pointerEvents="none">
      {route.legs.map((leg, i) => {
        const color = leg.lineId ? LINES.find((l) => l.id === leg.lineId)!.color : INK;
        const d = roundedPath(legs[i], 12 * (1 - t) + 2);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={PAPER} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={leg.kind === 'walk' ? '2 14' : undefined}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.35, ease: 'easeOut' }}
            />
            {leg.kind === 'ride' && (
              <path d={d} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={3} strokeDasharray="4 12" className="mtr-march" />
            )}
          </g>
        );
      })}
      {/* 沿路線行駛的小列車 */}
      <g>
        <circle r={10} fill={INK} stroke={PAPER} strokeWidth={3}>
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={fullD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </circle>
        <circle r={3.5} fill="#F7C548">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={fullD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </circle>
      </g>
    </g>
  );
}

function Walkway({ a, b, pos }: { a: string; b: string; pos: (s: MtrStation) => Pt }) {
  const A = pos(STATION_BY_ID.get(a)!);
  const B = pos(STATION_BY_ID.get(b)!);
  return (
    <g pointerEvents="none">
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={PAPER} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 7" />
    </g>
  );
}

interface StationLayerProps {
  t: number;
  zoomTier: number;
  selectedId: string;
  nearestId: string | null;
  focusLine: MtrLineId | null;
  tripStationIds: Set<string>;
  routeStationIds: Set<string>;
  routeLineIds: Set<MtrLineId>;
  hasRoute: boolean;
  onClick: (id: string, e: React.MouseEvent) => void;
}

const StationLayer = memo(function StationLayer({
  t,
  zoomTier,
  selectedId,
  nearestId,
  focusLine,
  tripStationIds,
  routeStationIds,
  hasRoute,
  onClick
}: StationLayerProps) {
  const fontSize = 13 - 3 * t;
  return (
    <g>
      {STATIONS.map((st) => {
        const p = lerpPt(st.pos, st.geo, t);
        const p2 = st.pos2 ? lerpPt(st.pos2, st.geo, t) : null;
        const isSel = st.id === selectedId;
        const isNear = st.id === nearestId;
        const inRoute = routeStationIds.has(st.id);
        const onFocus = !focusLine || st.lines.includes(focusLine);
        const dim = (hasRoute && !inRoute) || !onFocus;
        const important = isSel || isNear || st.isBase || inRoute || tripStationIds.has(st.id) || st.isInterchange;
        // 依縮放程度決定要顯示哪些站名：縮小時只留重要站
        const showLabel =
          isSel || isNear || st.isBase || (zoomTier >= 2 && t < 0.5) || (zoomTier >= 3) || (zoomTier >= 1 && important && t < 0.5) || (zoomTier >= 2 && important);
        const [dx, dy, anchor] = LABEL_OFFSETS[t > 0.5 ? 'r' : st.label ?? 'r'];
        const lineColor = LINES.find((l) => l.id === st.lines[0])!.color;

        return (
          <g
            key={st.id}
            className="station-hit cursor-pointer"
            opacity={dim ? 0.28 : 1}
            style={{ transition: 'opacity 300ms' }}
            onClick={(e) => onClick(st.id, e)}
          >
            {/* 大一點的透明點擊範圍，手機好按 */}
            <circle cx={p[0]} cy={p[1]} r={20} fill="transparent" />

            {isSel && (
              <motion.circle
                key={`sel-${st.id}`}
                cx={p[0]}
                cy={p[1]}
                fill={ACCENT}
                initial={{ r: 0, opacity: 0.5 }}
                animate={{ r: 26, opacity: 0.16 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              />
            )}
            {isNear && !isSel && <circle cx={p[0]} cy={p[1]} r={20} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="4 4" />}
            {st.isBase && (
              <circle cx={p[0]} cy={p[1]} r={17} fill="none" stroke="#1B4332" strokeWidth={2.5} className="mtr-spin-slow" strokeDasharray="6 5" />
            )}

            {p2 ? (
              <>
                <line x1={p[0]} y1={p[1]} x2={p2[0]} y2={p2[1]} stroke={isSel ? ACCENT : INK} strokeWidth={19} strokeLinecap="round" />
                <line x1={p[0]} y1={p[1]} x2={p2[0]} y2={p2[1]} stroke={PAPER} strokeWidth={12} strokeLinecap="round" />
              </>
            ) : st.isInterchange ? (
              <circle cx={p[0]} cy={p[1]} r={isSel ? 10 : 8.5} fill={PAPER} stroke={isSel ? ACCENT : INK} strokeWidth={3.2} />
            ) : (
              <circle cx={p[0]} cy={p[1]} r={isSel ? 8 : 5.5} fill={PAPER} stroke={isSel ? ACCENT : lineColor} strokeWidth={isSel ? 3.5 : 3} />
            )}
            {tripStationIds.has(st.id) && !isSel && <circle cx={p[0]} cy={p[1]} r={2.6} fill={ACCENT} />}

            {showLabel && (
              <text
                x={p[0] + dx}
                y={p[1] + dy}
                textAnchor={anchor}
                fontSize={isSel ? fontSize + 3 : fontSize}
                fontWeight={isSel || st.isBase || st.isInterchange ? 700 : 500}
                fill={isSel ? ACCENT : INK}
                stroke="#F1EBDF"
                strokeWidth={4}
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {st.zh}
                {st.isBase ? ' ★' : ''}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
});
