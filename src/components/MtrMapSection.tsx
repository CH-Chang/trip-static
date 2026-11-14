import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ITINERARY_DAYS } from '../data/tripData';
import { MTR_BASE_STATION_ID } from '../data/mtrNetwork';
import type { Coords } from '../types/trip';
import {
  LINES,
  STATION_BY_ID,
  bearingLabel,
  planRoute,
  rankNearestStations,
  type NearbyStation
} from '../utils/mtr';
import { MTR_OFFICIAL_URL, isPdfCached, mtrDocUrl, prefetchPdfs, type MtrDocKind } from '../utils/pdf';
import { getGoogleMapsDirectionsUrl } from '../utils/geo';
import MtrNetworkMap, { LineDots } from './mtr/MtrNetworkMap';
import PdfViewer from './mtr/PdfViewer';
import { IconArrowUpRight, IconCrosshair, IconDownload, IconNavArrow, IconWalk } from './Icons';

interface MtrMapSectionProps {
  /** 從路線站名點進來時為 false：保留指定的車站，不自動跳到最近車站 */
  autoSelectNearest?: boolean;
  isOpen?: boolean;
  selectedStationId: string;
  onSelectStation: (id: string) => void;
}

type LocStatus = 'idle' | 'loading' | 'tracking' | 'success' | 'error';
type Origin = 'nearest' | 'hotel';

const PRESETS: { label: string; coords: Coords }[] = [
  { label: '尖沙咀海濱', coords: [22.2935, 114.1718] },
  { label: '西九文化區', coords: [22.3012, 114.1597] },
  { label: '中環蘭桂坊', coords: [22.2809, 114.1556] },
  { label: '旺角女人街', coords: [22.3188, 114.1704] },
  { label: '東薈城', coords: [22.2896, 113.9408] }
];

const TRIP_STATION_IDS = new Set(
  ITINERARY_DAYS.flatMap((d) => d.items.map((i) => i.mtrId)).filter((id): id is string => Boolean(id))
);

const lineOf = (id: string) => LINES.find((l) => l.id === id)!;

// ───────── 指南針（手機方位） ─────────
function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      if (typeof e.webkitCompassHeading === 'number') setHeading(e.webkitCompassHeading);
      else if (e.absolute && e.alpha != null) setHeading((360 - e.alpha) % 360);
    };
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evt, handler as EventListener);
    return () => window.removeEventListener(evt, handler as EventListener);
  }, [enabled]);

  const request = async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE?.requestPermission === 'function') {
      try {
        if ((await DOE.requestPermission()) !== 'granted') return;
      } catch {
        return;
      }
    }
    setEnabled(true);
  };
  return { heading, enabled, request };
}

export default function MtrMapSection({ isOpen = false, selectedStationId, onSelectStation, autoSelectNearest = true }: MtrMapSectionProps) {
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [sourceLabel, setSourceLabel] = useState('');
  const [locStatus, setLocStatus] = useState<LocStatus>('idle');
  const [locMessage, setLocMessage] = useState('');
  const [origin, setOrigin] = useState<Origin>('nearest');
  const [showRoute, setShowRoute] = useState(false);
  const [stage, setStage] = useState<'network' | MtrDocKind>('network');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const docTab: MtrDocKind = stage === 'network' ? 'map' : stage;
  const openStage = (next: 'network' | MtrDocKind) => {
    setStage(next);
    // 手機版：切換後捲回頂端讓主畫面可見
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [offline, setOffline] = useState<{ done: number; total: number } | null>(null);
  const [cachedCount, setCachedCount] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const autoPromptedRef = useRef(false);
  const autoSelectRef = useRef(true);
  const compass = useCompass();

  const station = STATION_BY_ID.get(selectedStationId) ?? STATION_BY_ID.get(MTR_BASE_STATION_ID)!;

  const nearby = useMemo<NearbyStation[]>(() => (userCoords ? rankNearestStations(userCoords, 3) : []), [userCoords]);
  const nearest = nearby[0] ?? null;
  const inHongKong = Boolean(nearest && nearest.km < 30);

  const originId = origin === 'nearest' && nearest && inHongKong ? nearest.station.id : MTR_BASE_STATION_ID;
  const route = useMemo(() => planRoute(originId, station.id), [originId, station.id]);

  const applyCoords = useCallback(
    (coords: Coords, label: string, select: boolean) => {
      setUserCoords(coords);
      setSourceLabel(label);
      const [first] = rankNearestStations(coords, 1);
      if (select && first && first.km < 30) onSelectStation(first.station.id);
    },
    [onSelectStation]
  );

  const stopWatch = () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  };

  /** 開始定位：先取一次位置，再持續追蹤（走路時最近車站即時更新） */
  const handleLocate = useCallback((selectNearest = true) => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocMessage('此瀏覽器不支援定位，可展開下方「模擬位置」體驗。');
      return;
    }
    stopWatch();
    setLocStatus('loading');
    setLocMessage('正在取得 GPS 位置…');
    autoSelectRef.current = selectNearest;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coords = [pos.coords.latitude, pos.coords.longitude];
        const [first] = rankNearestStations(coords, 1);
        setLocStatus('tracking');
        setLocMessage(
          first.km > 30
            ? `已定位，但你目前離香港約 ${Math.round(first.km)} km — 到港後會自動標出最近車站。`
            : `即時追蹤中・精度約 ${Math.round(pos.coords.accuracy)} m`
        );
        applyCoords(coords, '目前位置', autoSelectRef.current);
        autoSelectRef.current = false; // 只有第一次自動跳到最近車站
      },
      (err) => {
        stopWatch();
        setLocStatus('error');
        setLocMessage(
          err.code === 1
            ? '未授權定位權限，請在網址列允許位置存取，或改用模擬位置。'
            : err.code === 3
            ? '定位逾時，請到戶外或稍後再試。'
            : '暫時取不到位置訊號。'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }, [applyCoords]);

  useEffect(() => {
    if (isOpen && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      // 打開時自動定位；若是從某個站名點進來，就只顯示位置、不搶走焦點
      handleLocate(autoSelectNearest);
    }
    if (!isOpen) stopWatch();
  }, [isOpen, handleLocate]);

  useEffect(() => () => stopWatch(), []);

  // 行程站點離線包：統計已快取數量
  const offlineUrls = useMemo(
    () => [
      mtrDocUrl('routemap'),
      ...[...TRIP_STATION_IDS, MTR_BASE_STATION_ID].flatMap((id) => {
        const code = STATION_BY_ID.get(id)?.code;
        return code ? [mtrDocUrl('map', code), mtrDocUrl('layout', code)] : [];
      })
    ],
    []
  );
  useEffect(() => {
    if (!isOpen) return;
    Promise.all(offlineUrls.map(isPdfCached)).then((r) => setCachedCount(r.filter(Boolean).length));
  }, [isOpen, offline, offlineUrls]);

  const downloadOfflinePack = async () => {
    setOffline({ done: 0, total: offlineUrls.length });
    await prefetchPdfs(offlineUrls, (done, total) => setOffline({ done, total }));
    setTimeout(() => setOffline(null), 1200);
  };

  const docUrl = docTab === 'routemap' ? mtrDocUrl('routemap') : mtrDocUrl(docTab, station.code);
  const docTitle =
    docTab === 'routemap' ? '港鐵全網路綫圖' : `${station.zh}站・${docTab === 'map' ? '車站街道圖' : '車站位置圖'}`;

  const primaryColor = lineOf(station.lines[0]).color;

  return (
    <div ref={scrollRef} className="h-full flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px] overflow-y-auto lg:overflow-hidden">
      {/* ───────── 主畫面：路網圖／車站圖資 ───────── */}
      <div className="relative shrink-0 h-[68vh] min-h-[380px] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-ink/15">
        <div className="shrink-0 flex items-stretch bg-paper border-b border-ink/15 overflow-x-auto no-scrollbar">
          {(
            [
              ['network', '路網圖'],
              ['map', `${station.zh}・街道圖`],
              ['layout', `${station.zh}・位置圖`],
              ['routemap', '全網 PDF']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => openStage(key)}
              className={`relative shrink-0 px-4 h-11 text-[13px] font-bold cursor-pointer border-r border-ink/10 transition-colors ${
                stage === key ? 'text-ink bg-card' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {stage === key && (
                <motion.span layoutId="stage-underline" className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ backgroundColor: primaryColor }} />
              )}
              <span className="font-hand">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-h-0">
          <div className={`absolute inset-0 ${stage === 'network' ? '' : 'invisible'}`}>
            <MtrNetworkMap
              selectedId={station.id}
              onSelect={(id) => onSelectStation(id)}
              userCoords={inHongKong ? userCoords : null}
              nearestId={inHongKong ? nearest?.station.id ?? null : null}
              route={showRoute ? route : null}
              tripStationIds={TRIP_STATION_IDS}
              onLocate={() => handleLocate()}
              locating={locStatus === 'loading'}
            />

            {/* 選中車站的浮動站牌：一鍵看街道圖／位置圖 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                className="absolute left-3 right-3 sm:right-auto sm:w-[360px] bottom-14 bg-card border border-ink/20 shadow-[3px_3px_0_rgba(31,29,26,0.14)]"
              >
                <div className="h-1.5 flex">
                  {station.lines.map((l) => (
                    <span key={l} className="flex-1" style={{ backgroundColor: lineOf(l).color }} />
                  ))}
                </div>
                <div className="p-3 flex items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9px] tracking-[0.2em] text-ink-soft uppercase truncate">
                      {station.code} · {station.en}
                    </p>
                    <p className="font-hand text-2xl font-bold leading-tight">{station.zh}</p>
                  </div>
                  <button
                    onClick={() => openStage('map')}
                    className="h-10 px-3 bg-ink text-paper text-xs font-bold cursor-pointer hover:bg-accent transition-colors"
                  >
                    街道圖
                  </button>
                  <button
                    onClick={() => openStage('layout')}
                    className="h-10 px-3 border border-ink/25 text-xs font-bold cursor-pointer hover:bg-ink hover:text-paper transition-colors"
                  >
                    位置圖
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {isOpen && stage !== 'network' && (
            <motion.div key={stage + station.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <PdfViewer fill url={docUrl} title={docTitle} officialUrl={MTR_OFFICIAL_URL(docTab, station.code)} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ───────── 側欄 ───────── */}
      <div className="lg:overflow-y-auto p-4 sm:p-5 space-y-4 bg-paper">
        {/* 定位卡 */}
        <section className="rounded-3xl bg-jade text-paper p-4 shadow-[3px_3px_0_rgba(27,67,50,0.3)] overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-paper/5" />
          <div className="relative flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleLocate()}
              className="h-10 px-4 bg-paper text-jade font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span className="relative flex w-2.5 h-2.5">
                {locStatus === 'tracking' && <span className="absolute inset-0 bg-accent animate-ping" />}
                <span className={`relative w-2.5 h-2.5 rounded-full ${locStatus === 'tracking' ? 'bg-accent' : 'bg-jade/40'}`} />
              </span>
              {locStatus === 'loading' ? '定位中…' : locStatus === 'tracking' ? '重新定位' : '找最近的港鐵站'}
            </motion.button>
            {!compass.enabled && userCoords && (
              <button onClick={compass.request} className="h-10 px-3 border border-paper/25 text-xs cursor-pointer hover:bg-card/10">
                啟用指南針
              </button>
            )}
          </div>
          {locMessage && <p className="relative mt-2.5 text-xs text-[#D4C5A9]">{locMessage}</p>}

          <AnimatePresence initial={false}>
            {inHongKong && nearby.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-3 space-y-1.5"
              >
                {nearby.map((n, i) => {
                  const rot = compass.heading != null ? n.bearing - compass.heading : n.bearing;
                  const active = n.station.id === station.id;
                  return (
                    <motion.li key={n.station.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <button
                        onClick={() => onSelectStation(n.station.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left cursor-pointer transition-colors ${
                          active ? 'bg-paper text-ink' : 'bg-card/8 hover:bg-card/14'
                        }`}
                      >
                        <motion.span
                          animate={{ rotate: rot }}
                          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-accent text-white' : 'bg-card/10'}`}
                        >
                          <IconNavArrow className="w-3.5 h-3.5" />
                        </motion.span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5">
                            {i === 0 && <span className="text-[10px] font-mono px-1.5 bg-accent text-white">最近</span>}
                            <span className="font-bold">{n.station.zh}</span>
                            <LineDots lines={n.station.lines} />
                          </span>
                          <span className={`text-[11px] ${active ? 'text-ink-soft' : 'text-[#D4C5A9]'}`}>
                            往{bearingLabel(n.bearing)}・{n.km < 1 ? `${Math.round(n.km * 1000)} m` : `${n.km.toFixed(1)} km`}
                          </span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block font-mono text-lg font-bold leading-none tabular-nums">{n.walkMin}</span>
                          <span className={`text-[10px] ${active ? 'text-ink-soft' : 'text-[#D4C5A9]'}`}>分鐘步行</span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          <details className="relative mt-3 group">
            <summary className="text-[11px] text-[#D4C5A9] cursor-pointer list-none select-none">
              <span className="group-open:hidden">＋ 沒在香港？模擬位置試試看</span>
              <span className="hidden group-open:inline">－ 收合模擬位置</span>
            </summary>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    stopWatch();
                    setLocStatus('success');
                    setLocMessage(`模擬位於「${p.label}」`);
                    applyCoords(p.coords, p.label, true);
                  }}
                  className={`px-2.5 py-1 text-[11px] border cursor-pointer transition ${
                    sourceLabel === p.label ? 'bg-paper text-jade border-transparent' : 'border-paper/25 hover:bg-card/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </details>
        </section>

        {/* 車站資訊 */}
        <AnimatePresence mode="wait">
          <motion.section
            key={station.id}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="rounded-3xl bg-card border border-ink/8 shadow-[3px_3px_0_rgba(31,29,26,0.14)] overflow-hidden"
          >
            <div className="h-1.5 flex">
              {station.lines.map((l) => (
                <span key={l} className="flex-1" style={{ backgroundColor: lineOf(l).color }} />
              ))}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-ink-soft uppercase">{station.code} · {station.en}</p>
                  <h3 className="font-serif text-3xl font-black leading-tight" style={{ color: primaryColor === '#53B7E8' ? '#2B2A28' : undefined }}>
                    {station.zh}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {station.isBase && <Badge className="bg-jade text-paper">★ 住宿基地</Badge>}
                  {nearest?.station.id === station.id && inHongKong && <Badge className="bg-accent text-white">離你最近</Badge>}
                  {TRIP_STATION_IDS.has(station.id) && <Badge className="bg-[#F7C548]/30 text-[#7A5A00]">行程會經過</Badge>}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {station.lines.map((l) => (
                  <span key={l} className="px-2.5 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: lineOf(l).color }}>
                    {lineOf(l).zh}
                  </span>
                ))}
              </div>

              {station.tip && <p className="text-sm leading-relaxed text-ink-soft">{station.tip}</p>}
              {station.nearby && (
                <p className="text-xs text-ink-soft">
                  <span className="font-semibold text-ink">周邊・</span>
                  {station.nearby}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                {userCoords && inHongKong ? (
                  <a
                    href={getGoogleMapsDirectionsUrl(userCoords, station.coords, 'walking')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-accent text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <IconWalk /> 步行導航
                  </a>
                ) : (
                  <button
                    onClick={() => handleLocate()}
                    className="h-10 bg-ink/5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconCrosshair className="w-3.5 h-3.5" /> 定位後導航
                  </button>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`港鐵${station.zh}站`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 bg-ink/5 text-xs font-bold inline-flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <IconArrowUpRight /> Google 出口
                </a>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* 搭車路線 */}
        <section className="rounded-3xl bg-card border border-ink/8 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif font-bold">怎麼搭過去</h4>
            <LayoutGroup id="origin">
              <div className="flex p-0.5 bg-ink/5 text-[11px]">
                {(
                  [
                    ['nearest', '從最近車站'],
                    ['hotel', '從帝京酒店']
                  ] as const
                ).map(([key, label]) => (
                  <button key={key} onClick={() => setOrigin(key)} className="relative px-2.5 h-7 cursor-pointer font-semibold">
                    {origin === key && <motion.span layoutId="origin-pill" className="absolute inset-0 bg-card shadow" />}
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>

          {origin === 'nearest' && !inHongKong && (
            <p className="text-[11px] text-ink-soft">尚未在香港定位，暫時以帝京酒店所在的旺角東站作為出發點。</p>
          )}

          {route && route.legs.length === 0 ? (
            <p className="text-sm text-ink-soft">你已經在這一站了 🎉</p>
          ) : route ? (
            <>
              <div className="flex items-end gap-4">
                <div>
                  <span className="font-mono text-4xl font-bold tabular-nums leading-none">{route.totalMinutes}</span>
                  <span className="text-xs text-ink-soft ml-1">分鐘左右</span>
                </div>
                <div className="text-[11px] text-ink-soft pb-1">
                  {route.stops} 站・{route.transfers === 0 ? '免轉車' : `轉 ${route.transfers} 次`}
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setShowRoute((v) => !v)}
                  className={`ml-auto h-9 px-3.5 text-xs font-bold cursor-pointer transition-colors ${
                    showRoute ? 'bg-ink text-paper' : 'bg-ink/5'
                  }`}
                >
                  {showRoute ? '隱藏路線' : '在路網上顯示'}
                </motion.button>
              </div>

              <ol className="relative pl-1">
                {route.legs.map((leg, i) => {
                  const color = leg.lineId ? lineOf(leg.lineId).color : '#8A8478';
                  const from = STATION_BY_ID.get(leg.stations[0])!;
                  const to = STATION_BY_ID.get(leg.stations[leg.stations.length - 1])!;
                  return (
                    <motion.li
                      key={`${route.from}-${route.to}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center w-4 shrink-0">
                        <span className="w-3.5 h-3.5 rounded-full border-[3px] bg-card mt-1" style={{ borderColor: color }} />
                        <span
                          className="w-1 flex-1 my-0.5"
                          style={{ background: leg.kind === 'walk' ? `repeating-linear-gradient(${color} 0 3px, transparent 3px 7px)` : color }}
                        />
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-sm font-bold">{from.zh}</p>
                        <p className="text-[11px] text-ink-soft mt-0.5">
                          {leg.kind === 'walk' ? (
                            <>步行轉乘通道・約 {leg.minutes} 分鐘</>
                          ) : (
                            <>
                              <span className="font-semibold" style={{ color }}>
                                {lineOf(leg.lineId!).zh}
                              </span>
                              ・往{to.zh}方向 {leg.stations.length - 1} 站・約 {leg.minutes} 分鐘
                            </>
                          )}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
                <li className="flex gap-3">
                  <div className="w-4 flex justify-center shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-accent mt-1 ring-4 ring-accent/15" />
                  </div>
                  <p className="text-sm font-bold">{station.zh}・抵達</p>
                </li>
              </ol>
            </>
          ) : null}
        </section>

        {/* 港鐵官方圖資：在主畫面開啟 */}
        <section className="space-y-2.5">
          <h4 className="font-hand text-lg font-bold">港鐵官方圖資</h4>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['map', '車站街道圖', '出口與周邊街道'],
                ['layout', '車站位置圖', '看月台大堂和轉乘通道']
              ] as const
            ).map(([key, label, sub]) => (
              <button
                key={key}
                onClick={() => openStage(key)}
                className={`text-left p-3 border cursor-pointer transition-colors ${
                  stage === key ? 'bg-ink text-paper border-ink' : 'bg-card border-ink/15 hover:border-ink/50'
                }`}
              >
                <span className="block font-hand text-base font-bold">{station.zh}・{label}</span>
                <span className={`block text-[11px] ${stage === key ? 'text-white/70' : 'text-ink-soft'}`}>{sub}・在主畫面放大</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-ink/4 p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">行程站點離線包</p>
              <p className="text-[11px] text-ink-soft">
                {offline
                  ? `下載中 ${offline.done}/${offline.total}`
                  : `${TRIP_STATION_IDS.size + 1} 個行程車站的街道圖＋位置圖＋全網圖・已保存 ${cachedCount ?? '–'}/${offlineUrls.length}`}
              </p>
              {offline && (
                <div className="mt-1.5 h-1 bg-ink/10 overflow-hidden">
                  <motion.div className="h-full bg-jade" animate={{ width: `${(offline.done / offline.total) * 100}%` }} />
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={Boolean(offline)}
              onClick={downloadOfflinePack}
              className="h-9 px-3 bg-jade text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <IconDownload className="w-3.5 h-3.5" />
              {cachedCount === offlineUrls.length ? '已備妥' : '離線保存'}
            </motion.button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${className}`}>{children}</span>;
}
