import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { HOTEL_COORDS, ITINERARY_DAYS } from '../data/tripData';
import { MID_LEVELS_ESCALATOR } from '../data/landmarks';
import { applyAlternatives } from '../utils/resolveItems';
import type { TripItem, TripStatus } from '../types/trip';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconClose, IconFit, IconPin, IconSwap, IconTransit } from './Icons';
import PaymentBadges from './ui/PaymentBadges';
import ItemLinks from './ui/ItemLinks';
import { TicketSlot } from './ui/Tickets';
import PhotoInspo, { IG_GRADIENT, PhotoSpotBadge } from './ui/PhotoInspo';
import TransitLeg, { MODE_META, stepMinutes } from './ui/TransitLeg';
import { DayWeatherBadge } from './ui/WeatherPanel';
import { DaySunBadge, SunEventTag } from './ui/SunTimes';
import GoogleMutant from 'leaflet.gridlayer.googlemutant';
import { GMAP_STYLE_DARK, GMAP_STYLE_LIGHT, googleMapsFailed, hasGoogleMapsKey, loadGoogleMaps, onGoogleMapsFailure } from '../utils/googleMaps';
import { isDark, onThemeChange } from '../utils/theme';

interface MapWorkspaceProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedItemId: string;
  onSelectItemId: (id: string) => void;
  altSelections: Record<string, string>;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
  onJumpToMtr: (mtrId: string) => void;
  tripStatus: TripStatus;
  effectiveNowMs: number;
}


/** 香港時間 HH:MM */
const hhmm = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong' });
const legMinutes = (steps?: TripItem['transit']) => (steps ?? []).reduce((n, st) => n + stepMinutes(st), 0);

/** 清單裡兩站之間的交通列 */
function LegRow({ steps, departMs, label, accent }: { steps?: TripItem['transit']; departMs?: number; label?: string; accent?: boolean }) {
  const mins = legMinutes(steps);
  const shown = (steps ?? []).filter((st) => st.mode !== 'walk');
  const glyphSteps = shown.length ? shown : (steps ?? []).slice(0, 1);
  return (
    <div className="relative pl-[46px] pr-3 py-1.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
      {departMs !== undefined && <span className={`font-mono ${accent ? 'text-accent font-bold' : ''}`}>{hhmm(departMs)}</span>}
      {label && <span className={accent ? 'text-accent font-bold' : ''}>{label}</span>}
      {glyphSteps.length ? (
        glyphSteps.slice(0, 3).map((st, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">
            <span className="w-4 h-4 text-[9px] text-white font-serif flex items-center justify-center" style={{ backgroundColor: MODE_META[st.mode].color }}>
              {MODE_META[st.mode].glyph}
            </span>
            {st.code && <span className="font-mono">{st.code}</span>}
          </span>
        ))
      ) : (
        <span className="opacity-60">交通待補</span>
      )}
      {mins > 0 && <span className="font-mono ml-auto">約 {mins} 分</span>}
    </div>
  );
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function MapWorkspace({
  selectedDay,
  onSelectDay,
  selectedItemId,
  onSelectItemId,
  altSelections,
  onToggleAlternative,
  onJumpToMtr,
  tripStatus,
  effectiveNowMs
}: MapWorkspaceProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLElement | null>(null);

  /** 地圖被浮動面板遮住的範圍（上／下／左／右，px） */
  const occlusion = () => {
    const map = mapRef.current;
    const box = mapContainerRef.current?.getBoundingClientRect();
    const out = { top: 60, bottom: 90, left: 0, right: 0 }; // 頂部日期列、底部 HUD
    if (!map || !box) return out;
    const card = cardRef.current?.getBoundingClientRect();
    const list = listRef.current?.getBoundingClientRect();
    const wide = box.width >= 640;
    if (card) {
      if (wide) out.right = Math.max(out.right, box.right - card.left + 12);
      else out.bottom = Math.max(out.bottom, box.bottom - card.top + 12);
    }
    if (list && wide) out.left = Math.max(out.left, list.right - box.left + 12);
    return out;
  };

  /** 讓目標點出現在「沒被擋住的區域」中央 */
  const focusOn = (latlng: [number, number], zoom: number) => {
    const map = mapRef.current;
    if (!map) return;
    const o = occlusion();
    const pt = map.project(latlng, zoom).add([(o.right - o.left) / 2, (o.bottom - o.top) / 2]);
    map.flyTo(map.unproject(pt, zoom), zoom, { duration: 0.8 });
  };

  const fitVisible = (points: [number, number][]) => {
    const map = mapRef.current;
    if (!map || points.length === 0) return;
    const o = occlusion();
    map.flyToBounds(L.latLngBounds(points), {
      duration: 0.8,
      paddingTopLeft: [o.left + 24, o.top + 24],
      paddingBottomRight: [o.right + 24, o.bottom + 24]
    });
  };
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const [listOpen, setListOpen] = useState(!isMobile);
  const [cardOpen, setCardOpen] = useState(true);
  const [baseMap, setBaseMap] = useState<'google' | 'osm' | null>(null);
  const [transitOn, setTransitOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hk-trip-map-transit') !== '0';
    } catch {
      return true;
    }
  });
  const transitRef = useRef(transitOn);
  const googleBaseRef = useRef<GoogleMutant | null>(null);

  const dayObj = useMemo(() => ITINERARY_DAYS.find((d) => d.day === selectedDay) ?? ITINERARY_DAYS[0], [selectedDay]);
  const dayItems = useMemo(() => applyAlternatives(dayObj.items, altSelections), [dayObj, altSelections]);
  const hkItems = useMemo(() => dayItems.filter((it) => it.isHK), [dayItems]);

  const rawSelectedItem = useMemo<TripItem | null>(() => {
    for (const d of ITINERARY_DAYS) {
      const found = d.items.find((i) => i.id === selectedItemId);
      if (found) return found;
    }
    return hkItems[0] || dayItems[0] || null;
  }, [selectedItemId, hkItems, dayItems]);

  const selectedItem = useMemo(() => (rawSelectedItem
        ? applyAlternatives(ITINERARY_DAYS.find((d) => d.items.some((i) => i.id === rawSelectedItem.id))?.items ?? [rawSelectedItem], altSelections).find((i) => i.id === rawSelectedItem.id) ?? null
        : null), [rawSelectedItem, altSelections]);
  const selectedIdx = selectedItem ? dayItems.findIndex((i) => i.id === selectedItem.id) : -1;

  // 以「字串」表示已走過的站：只有真的跨過某站結束時間才會改變（不會每秒變動）
  const doneKey = useMemo(
    () => dayItems.filter((i) => effectiveNowMs >= new Date(i.end).getTime()).map((i) => i.id).join(','),
    [dayItems, effectiveNowMs]
  );
  const doneIds = useMemo(() => new Set(doneKey ? doneKey.split(',') : []), [doneKey]);
  const liveId = tripStatus.currentItem?.id ?? null;
  const prevItem = selectedIdx > 0 ? dayItems[selectedIdx - 1] : null;

  const bearingInfo = useMemo(
    () => (selectedItem?.isHK ? getBearingAndDistance(HOTEL_COORDS, selectedItem.coords) : null),
    [selectedItem]
  );

  // ───────── 初始化地圖（只做一次） ─────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [22.304, 114.165],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.25
    });
    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);
    const container = mapContainerRef.current;

    // ───────── 底圖：有 Google key 用 Google，否則／失敗時用 OpenStreetMap ─────────
    let base: L.GridLayer | null = null;
    let alive = true;
    const useOsm = () => {
      if (!alive) return; // 地圖已卸載（例如 StrictMode 重掛、切換分頁）
      if (base) map.removeLayer(base);
      googleBaseRef.current = null;
      container.classList.remove('gmaps');
      setBaseMap('osm');
      base = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // OpenStreetMap 官方圖磚：免費、免 API key（請保留來源標示）
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 貢獻者',
        maxZoom: 19
      }).addTo(map);
      base.bringToBack();
    };
    const useGoogle = () => {
      if (!alive) return;
      if (googleMapsFailed()) return useOsm();
      if (base) map.removeLayer(base);
      container.classList.add('gmaps');
      setBaseMap('google');
      const gm = new GoogleMutant({ type: 'roadmap', styles: isDark() ? GMAP_STYLE_DARK : GMAP_STYLE_LIGHT, maxZoom: 20 });
      base = gm.addTo(map);
      googleBaseRef.current = gm;
      // 大眾運輸圖層：港鐵路綫、車站與電車
      if (transitRef.current) gm.removeGoogleLayer('TransitLayer').addGoogleLayer('TransitLayer');
    };
    if (hasGoogleMapsKey) {
      loadGoogleMaps().then(useGoogle, useOsm);
    } else {
      useOsm();
    }
    const offFail = onGoogleMapsFailure(useOsm);
    // 切換明暗時，Google 底圖換樣式（OSM 用 CSS 濾鏡處理）
    const offTheme = onThemeChange(() => {
      if (container.classList.contains('gmaps')) useGoogle();
    });

    // 容器在淡入動畫中尺寸可能改變，下一幀再校正
    requestAnimationFrame(() => map.invalidateSize());
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => {
      alive = false;
      offFail();
      offTheme();
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // ───────── 標記與路線 ─────────
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const ink = css('--color-ink') || '#2B2A28';
    const card = css('--color-card') || '#FFFFFF';
    const accent = css('--color-accent') || '#C8102E';

    // 酒店：朱紅印章
    L.marker(HOTEL_COORDS, {
      zIndexOffset: 500,
      icon: L.divIcon({
        className: '',
        html: `<div style="display:flex;align-items:center;gap:6px;transform:translate(-14px,-14px)"><span style="width:28px;height:28px;border-radius:999px;border:2px solid ${accent};color:${accent};background:${card};font-family:'Noto Serif TC',serif;font-weight:600;display:flex;align-items:center;justify-content:center;transform:rotate(-8deg)">宿</span><span style="font:500 11px 'Noto Sans TC',sans-serif;color:${ink};background:${card};padding:2px 6px;border:1px solid rgba(0,0,0,.08)">帝京酒店</span></div>`,
        iconSize: [0, 0]
      })
    })
      .addTo(group)
      .bindPopup('<strong>帝京酒店 Royal Plaza Hotel</strong><br/>旺角東站 D 出口・三晚基地');

    // 當天路線：以當日路綫色描繪，虛線＝尚未走、實線＝已走過
    // 中環至半山扶手電梯：實際走向，讓人有方向感
    const ESC = '#2E8B8B';
    L.polyline(MID_LEVELS_ESCALATOR.path, { color: '#ffffff', weight: 9, opacity: 0.9, lineCap: 'round' }).addTo(group);
    L.polyline(MID_LEVELS_ESCALATOR.path, { color: ESC, weight: 5, opacity: 0.95, lineCap: 'round' }).addTo(group);
    const escMid = MID_LEVELS_ESCALATOR.path[Math.floor(MID_LEVELS_ESCALATOR.path.length * 0.75)];
    L.marker(escMid, {
      interactive: false,
      icon: L.divIcon({
        className: '',
        html: `<div style="transform:translate(10px,-50%);white-space:nowrap;padding:2px 6px;background:${ESC};color:#fff;font:600 10px 'Noto Sans TC',sans-serif;box-shadow:0 4px 10px -6px rgba(0,0,0,.5)">梯 半山扶手電梯・↑ ${MID_LEVELS_ESCALATOR.note}</div>`,
        iconSize: [0, 0]
      })
    }).addTo(group);
    // 出口名稱：放大到街道層級才顯示
    const exits = L.layerGroup();
    MID_LEVELS_ESCALATOR.exits.forEach((ex) => {
      L.circleMarker(ex.coords, { radius: 4, color: '#fff', weight: 2, fillColor: ESC, fillOpacity: 1 })
        .bindTooltip(ex.name, { permanent: true, direction: 'left', offset: [-6, 0], className: 'esc-exit-label' })
        .addTo(exits);
    });
    const syncExits = () => {
      if (map.getZoom() >= 16) exits.addTo(group);
      else group.removeLayer(exits);
    };
    syncExits();
    map.on('zoomend', syncExits);

    // 群組：同一區的幾個點畫一圈範圍
    const groups = new Map<string, { title: string; pts: [number, number][] }>();
    dayItems.forEach((it) => {
      if (!it.isHK || !it.group) return;
      const g = groups.get(it.group.id) ?? { title: it.group.title, pts: [] };
      g.pts.push(it.coords);
      groups.set(it.group.id, g);
    });
    groups.forEach((g) => {
      const c: [number, number] = [g.pts.reduce((n, q) => n + q[0], 0) / g.pts.length, g.pts.reduce((n, q) => n + q[1], 0) / g.pts.length];
      const r = Math.max(...g.pts.map((q) => map.distance(c, q))) + 70;
      L.circle(c, { radius: r, color: ESC, weight: 1.5, dashArray: '5 6', fillColor: ESC, fillOpacity: 0.07, interactive: false }).addTo(group);
      const top: [number, number] = [c[0] + r / 111320, c[1]];
      L.marker(top, {
        interactive: false,
        icon: L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-110%);white-space:nowrap;padding:1px 6px;background:${card};color:${ESC};border:1px dashed ${ESC};font:600 10px 'Noto Sans TC',sans-serif">${g.title}・走路 3–5 分</div>`,
          iconSize: [0, 0]
        })
      }).addTo(group);
    });

    const startsAtHotel = dayObj.day !== 1;
    const endsAtHotel = dayObj.day !== ITINERARY_DAYS[ITINERARY_DAYS.length - 1].day;
    if (hkItems.length > 0) {
      const coords: [number, number][] = [
        ...(startsAtHotel ? [HOTEL_COORDS] : []),
        ...hkItems.map((it) => it.coords),
        ...(endsAtHotel ? [HOTEL_COORDS] : [])
      ];
      L.polyline(coords, { color: dayObj.stationColor, weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(group);
      L.polyline(coords, { color: card, weight: 1.5, opacity: 0.9, dashArray: '2 8' }).addTo(group);
    }

    // 點與點中間：交通方式＋分鐘數
    const legs: Array<{ from: [number, number]; to: [number, number]; steps: NonNullable<TripItem['transit']>; selectId: string; tag?: string; time?: string }> = [];
    if (startsAtHotel && hkItems[0]) {
      const firstSteps = hkItems[0].transit ?? [];
      const depart = new Date(hkItems[0].start).getTime() - legMinutes(firstSteps) * 60000;
      legs.push({ from: HOTEL_COORDS, to: hkItems[0].coords, steps: firstSteps, selectId: hkItems[0].id, tag: `${hhmm(depart)} 出發` });
    }
    for (let k = 1; k < hkItems.length; k++) {
      legs.push({ from: hkItems[k - 1].coords, to: hkItems[k].coords, steps: hkItems[k].transit ?? [], selectId: hkItems[k].id, time: hhmm(new Date(hkItems[k - 1].end).getTime()) });
    }
    const lastHk = hkItems[hkItems.length - 1];
    if (endsAtHotel && lastHk) {
      const backSteps = lastHk.transitBack ?? [];
      const back = new Date(lastHk.end).getTime() + legMinutes(backSteps) * 60000;
      legs.push({ from: lastHk.coords, to: HOTEL_COORDS, steps: backSteps, selectId: lastHk.id, tag: `約 ${hhmm(back)} 回酒店` });
    }
    for (const lg of legs) {
      const steps = lg.steps;
      const rides = steps.filter((st) => st.mode !== 'walk');
      const shown = rides.length ? rides : steps.slice(0, 1);
      const total = steps.reduce((n, st) => n + stepMinutes(st), 0);
      const glyphs = shown.length
        ? shown
            .slice(0, 3)
            .map((st) => {
              const m = MODE_META[st.mode];
              const code = st.code ? `<span style="margin-left:2px">${st.code}</span>` : '';
              return `<span style="display:inline-flex;align-items:center"><span style="width:16px;height:16px;background:${m.color};color:#fff;font:600 10px 'Noto Serif TC',serif;display:inline-flex;align-items:center;justify-content:center">${m.glyph}</span>${code}</span>`;
            })
            .join('<span style="opacity:.4">›</span>')
        : '<span style="opacity:.55">待補</span>';
      // 出發與回程兩段常走同一條路：標籤分別放在 40% 與 60% 處，避免重疊
      const f = lg.tag?.includes('出發') ? 0.4 : lg.tag?.includes('回酒店') ? 0.6 : 0.5;
      const mid: [number, number] = [lg.from[0] + (lg.to[0] - lg.from[0]) * f, lg.from[1] + (lg.to[1] - lg.from[1]) * f];
      const tag = lg.tag
        ? `<span style="color:${accent};font-weight:700;margin-right:2px">${lg.tag}</span>`
        : lg.time
        ? `<span style="opacity:.6;margin-right:2px">${lg.time}</span>`
        : '';
      const leg = L.marker(mid, {
        zIndexOffset: 50,
        icon: L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:3px;white-space:nowrap;padding:2px 6px 2px 3px;background:${card};color:${ink};border:1px solid rgba(0,0,0,.12);box-shadow:0 4px 10px -6px rgba(0,0,0,.4);font:500 10px 'IBM Plex Mono',monospace;cursor:pointer">${tag}${glyphs}${total ? `<span style="margin-left:3px">${total}分</span>` : ''}</div>`,
          iconSize: [0, 0]
        })
      }).addTo(group);
      leg.on('click', () => {
        onSelectItemId(lg.selectId);
        setCardOpen(true);
      });
      leg.bindTooltip(steps.length ? steps.map((st) => `${MODE_META[st.mode].name}：${st.label}`).join('<br/>') : '交通方式待補', { direction: 'top', offset: [0, -10] });
    }

    hkItems.forEach((item) => {
      const idx = dayItems.findIndex((i) => i.id === item.id);
      const isSelected = selectedItem?.id === item.id;
      const isLive = liveId === item.id;
      const isDone = doneIds.has(item.id);
      const size = isSelected ? 34 : 26;
      const fill = isSelected || isLive ? accent : card;
      const text = isSelected || isLive ? '#fff' : ink;
      const marker = L.marker(item.coords, {
        zIndexOffset: isSelected ? 900 : 100,
        icon: L.divIcon({
          className: '',
          html: item.photoSpot?.hot
            ? `<div style="position:relative;width:${size + 4}px;height:${size + 4}px;transform:translate(-50%,-50%);border-radius:999px;padding:3px;background:${IG_GRADIENT};box-shadow:0 6px 16px -6px rgba(221,42,123,.6);opacity:${isDone && !isSelected ? 0.55 : 1}"><div style="width:100%;height:100%;border-radius:999px;background:${fill};color:${text};display:flex;align-items:center;justify-content:center;font:600 12px 'IBM Plex Mono',monospace">${idx + 1}</div><span style="position:absolute;top:-6px;right:-8px;width:16px;height:16px;border-radius:5px;background:${IG_GRADIENT};display:flex;align-items:center;justify-content:center;border:1.5px solid #fff"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/></svg></span></div>`
            : `<div style="width:${size}px;height:${size}px;transform:translate(-50%,-50%);border-radius:999px;background:${fill};color:${text};border:3px solid ${dayObj.stationColor};display:flex;align-items:center;justify-content:center;font:600 12px 'IBM Plex Mono',monospace;box-shadow:0 6px 14px -6px rgba(0,0,0,.45);opacity:${isDone && !isSelected ? 0.55 : 1};transition:all .2s">${idx + 1}</div>`,
          iconSize: [0, 0]
        })
      }).addTo(group);
      marker.on('click', () => {
        onSelectItemId(item.id);
        setCardOpen(true);
      });
      marker.bindTooltip(`${idx + 1}. ${item.photoSpot?.hot ? '📷 熱門打卡點・' : ''}${item.title}`, { direction: 'top', offset: [0, -16] });
    });
    return () => {
      map.off('zoomend', syncExits);
    };
    // 注意：不可依賴每秒變動的時間，否則地圖會每秒重繪而抖動
  }, [hkItems, dayItems, dayObj, selectedItem, liveId, doneKey, onSelectItemId]);

  // 鏡頭：只在「選取的景點」或「日期」改變時移動
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // 等面板動畫排版完成再計算遮擋範圍
    const raf = requestAnimationFrame(() => {
      if (selectedItem?.isHK) focusOn(selectedItem.coords, Math.max(map.getZoom(), 14.5));
      else if (hkItems.length > 0) fitVisible([HOTEL_COORDS, ...hkItems.map((i) => i.coords)]);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.id, selectedItem?.isAlternativeActive, selectedDay]);

  useEffect(() => {
    transitRef.current = transitOn;
    try {
      localStorage.setItem('hk-trip-map-transit', transitOn ? '1' : '0');
    } catch {
      /* ignore */
    }
    const gm = googleBaseRef.current;
    if (!gm) return;
    if (transitOn) gm.removeGoogleLayer('TransitLayer').addGoogleLayer('TransitLayer');
    else gm.removeGoogleLayer('TransitLayer');
  }, [transitOn]);

  const fitDay = () => fitVisible([HOTEL_COORDS, ...hkItems.map((i) => i.coords)]);

  const selectItem = (id: string) => {
    onSelectItemId(id);
    setCardOpen(true);
    if (isMobile) setListOpen(false);
  };

  // 上一站／下一站：當天走完就接到前後一天
  const step = (delta: 1 | -1) => {
    if (selectedIdx < 0) return;
    const next = selectedIdx + delta;
    if (next >= 0 && next < dayItems.length) {
      selectItem(dayItems[next].id);
      return;
    }
    const otherDay = ITINERARY_DAYS.find((d) => d.day === selectedDay + delta);
    if (!otherDay) return;
    onSelectDay(otherDay.day);
    const target = delta > 0 ? otherDay.items[0] : otherDay.items[otherDay.items.length - 1];
    selectItem(target.id);
  };
  const isFirst = selectedDay === ITINERARY_DAYS[0].day && selectedIdx <= 0;
  const isLast = selectedDay === ITINERARY_DAYS[ITINERARY_DAYS.length - 1].day && selectedIdx === dayItems.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select, [role=dialog]')) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative w-full h-full overflow-hidden bg-paper">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* ───────── 頂部：日期切換 ───────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2 pointer-events-none">
        <LayoutGroup id="map-days">
          <div className="pointer-events-auto flex items-center gap-1 p-1 bg-card/95 backdrop-blur border border-ink/10 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.4)] overflow-x-auto no-scrollbar max-w-full">
            {ITINERARY_DAYS.map((d) => {
              const active = selectedDay === d.day;
              return (
                <button
                  key={d.day}
                  onClick={() => {
                    onSelectDay(d.day);
                    const firstHK = d.items.find((i) => i.isHK);
                    if (firstHK) selectItem(firstHK.id);
                  }}
                  className={`relative shrink-0 h-8 px-3 text-xs cursor-pointer transition-colors ${active ? 'text-white' : 'text-ink-soft hover:text-ink'}`}
                >
                  {active && <motion.span layoutId="map-day-pill" className="absolute inset-0" style={{ backgroundColor: d.stationColor }} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative font-mono tracking-wider">
                    DAY {d.day}
                    <span className="hidden sm:inline opacity-70 ml-1">{d.date.slice(5).replace('-', '/')}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <div className="pointer-events-auto ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setListOpen((v) => !v)}
            className={`h-10 px-3 text-xs border cursor-pointer transition-colors ${listOpen ? 'bg-ink text-paper border-ink' : 'bg-card/95 border-ink/10 text-ink'}`}
          >
            {listOpen ? '收起清單' : '當日清單'}
          </button>
          {baseMap === 'google' && (
            <button
              onClick={() => setTransitOn((v) => !v)}
              aria-pressed={transitOn}
              title={transitOn ? '隱藏大眾運輸圖層' : '顯示大眾運輸圖層'}
              className={`h-10 px-3 text-xs border cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
                transitOn ? 'bg-ink text-paper border-ink' : 'bg-card/95 border-ink/10 text-ink'
              }`}
            >
              <span className="w-4 h-4 bg-[#C8102E] text-white font-serif text-[9px] flex items-center justify-center">鐵</span>
              運輸
            </button>
          )}
          <button onClick={fitDay} aria-label="全覽當日路線" title="全覽當日路線" className="w-10 h-10 bg-card/95 border border-ink/10 text-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors">
            <IconFit />
          </button>
        </div>
      </div>

      {baseMap && (
        <span className="absolute z-10 top-[3.7rem] right-3 px-1.5 py-0.5 bg-card/85 border border-ink/10 font-mono text-[9px] tracking-wider text-ink-soft pointer-events-none">
          {baseMap === 'google' ? 'GOOGLE MAPS' : 'OPENSTREETMAP'}
        </span>
      )}

      {/* ───────── 左側：當日清單（路綫式） ───────── */}
      <AnimatePresence>
        {listOpen && (
          <motion.aside
            ref={listRef}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute top-16 left-3 bottom-24 z-20 w-[calc(100%-1.5rem)] sm:w-[320px] bg-card/95 backdrop-blur border border-ink/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden"
          >
            <div className="h-1.5 mtr-tiles shrink-0" style={{ ['--tile' as string]: dayObj.stationColor }} />
            <div className="px-4 pt-3 pb-2.5 border-b border-ink/10 shrink-0">
              <p className="font-mono text-[10px] tracking-[0.25em] text-ink-soft">DAY 0{dayObj.day} ・ {dayObj.dateLabel}</p>
              <h2 className="font-serif text-lg font-medium tracking-wide">{dayObj.theme}</h2>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <DayWeatherBadge date={dayObj.date} />
                <DaySunBadge date={dayObj.date} />
              </div>
            </div>
            <ol className="flex-1 overflow-y-auto py-2 relative">
              <span className="absolute left-[27px] top-4 bottom-4 w-[3px]" style={{ backgroundColor: dayObj.stationColor, opacity: 0.35 }} />
              {(() => {
                const first = dayItems[0];
                if (!first) return null;
                const mins = legMinutes(first.transit);
                const fromHome = dayObj.day === ITINERARY_DAYS[0].day;
                return (
                  <li className="relative pl-3 pr-3 pt-1 pb-0.5 flex items-center gap-3">
                    <span className="relative z-10 w-7 h-7 shrink-0 rounded-full border-2 border-accent text-accent bg-card flex items-center justify-center font-serif text-[12px] font-semibold" style={{ transform: 'rotate(-8deg)' }}>
                      {fromHome ? '家' : '宿'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] text-accent font-bold">{hhmm(new Date(first.start).getTime() - mins * 60000)} 出發</span>
                      <span className="block font-serif text-[13px] font-medium">{fromHome ? '從家裡出發' : '從帝京酒店出發'}</span>
                    </span>
                  </li>
                );
              })()}
              {dayItems.map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;
                const isLive = tripStatus.currentItem?.id === item.id;
                const isDone = effectiveNowMs >= new Date(item.end).getTime();
                const prevEnd = idx > 0 ? new Date(dayItems[idx - 1].end).getTime() : undefined;
                const firstDepart = idx === 0 ? new Date(item.start).getTime() - legMinutes(item.transit) * 60000 : undefined;
                const grp = item.group;
                const isGFirst = Boolean(grp && dayItems[idx - 1]?.group?.id !== grp.id);
                return (
                  <li key={item.id} className={grp ? 'bg-[#2E8B8B]/[0.06] border-l-2 border-[#2E8B8B]' : ''}>
                    {grp && isGFirst && (
                      <div className="pl-3 pr-3 pt-2 flex items-center gap-2 text-[11px] text-[#2E8B8B] font-medium">
                        <span className="w-4 h-4 bg-[#2E8B8B] text-white font-serif text-[9px] flex items-center justify-center">梯</span>
                        {grp.title}
                      </div>
                    )}
                    <LegRow steps={item.transit} departMs={prevEnd ?? firstDepart} />
                    <button
                      onClick={() => selectItem(item.id)}
                      className={`relative w-full text-left pl-3 pr-3 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-paper-2/70' : 'hover:bg-paper-2/40'
                      } ${isDone && !isSelected ? 'opacity-55' : ''}`}
                    >
                      <span
                        className={`relative z-10 mt-0.5 w-7 h-7 shrink-0 rounded-full border-[3px] flex items-center justify-center font-mono text-[11px] ${
                          isSelected || isLive ? 'bg-accent text-white' : 'bg-card text-ink'
                        }`}
                        style={{ borderColor: dayObj.stationColor }}
                      >
                        {idx + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-soft">
                          {item.timeLabel}
                          {isLive && <span className="px-1 bg-accent text-white">NOW</span>}
                          {item.isAlternativeActive && <span className="px-1 bg-brass text-white">備案</span>}
                          {item.photoSpot?.hot && <PhotoSpotBadge size="sm" />}
                          {item.flexible && <span className="px-1 border border-dashed border-ink/40">彈性</span>}
                          {!item.isHK && <span className="px-1 border border-ink/20">台灣</span>}
                        </span>
                        <span className="block font-serif text-[14px] font-medium leading-snug truncate">{item.title}</span>
                        <span className="block text-[11px] text-ink-soft truncate">{item.location}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {(() => {
                const last = dayItems[dayItems.length - 1];
                if (!last || dayObj.day === ITINERARY_DAYS[ITINERARY_DAYS.length - 1].day) return null;
                const end = new Date(last.end).getTime();
                const mins = legMinutes(last.transitBack);
                return (
                  <li>
                    <LegRow steps={last.transitBack} departMs={end} />
                    <div className="relative pl-3 pr-3 pb-2 flex items-center gap-3">
                      <span className="relative z-10 w-7 h-7 shrink-0 rounded-full border-2 border-accent text-accent bg-card flex items-center justify-center font-serif text-[12px] font-semibold" style={{ transform: 'rotate(-8deg)' }}>
                        宿
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[10px] text-accent font-bold">約 {hhmm(end + mins * 60000)} 回到</span>
                        <span className="block font-serif text-[13px] font-medium">帝京酒店</span>
                      </span>
                    </div>
                  </li>
                );
              })()}
            </ol>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ───────── 右側／底部：景點卡 ───────── */}
      <AnimatePresence mode="wait">
        {cardOpen && selectedItem && (
          <motion.aside
            ref={cardRef}
            key={selectedItem.id + String(selectedItem.isAlternativeActive)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute z-20 left-3 right-3 bottom-24 max-h-[55vh] sm:left-auto sm:right-3 sm:top-16 sm:bottom-24 sm:max-h-none sm:w-[360px] bg-card border border-ink/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden"
          >
            {selectedItem.image && (
              <div className="relative h-28 sm:h-44 shrink-0 bg-paper-2 overflow-hidden">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  onError={(e) => {
                    if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = 'none';
                  }}
                  className="photo w-full h-full object-cover"
                  style={{ filter: 'saturate(0.8) contrast(0.96) brightness(1.04) sepia(0.08)' }}
                />
              </div>
            )}
            <button
              onClick={() => setCardOpen(false)}
              aria-label="關閉景點卡"
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-card/90 border border-ink/10 text-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>

            {/* 上一站／下一站 */}
            <div className="shrink-0 flex items-stretch border-b border-ink/10 text-[12px]">
              <button
                onClick={() => step(-1)}
                disabled={isFirst}
                className="flex-1 h-10 px-3 text-left cursor-pointer hover:bg-paper-2/60 disabled:opacity-30 disabled:cursor-default transition-colors truncate"
              >
                ‹ {selectedIdx > 0 ? dayItems[selectedIdx - 1].title : '前一天'}
              </button>
              <span className="shrink-0 px-3 flex items-center font-mono text-[11px] text-ink-soft border-x border-ink/10">
                D{selectedDay}・{selectedIdx + 1}/{dayItems.length}
              </span>
              <button
                onClick={() => step(1)}
                disabled={isLast}
                className="flex-1 h-10 px-3 text-right cursor-pointer hover:bg-paper-2/60 disabled:opacity-30 disabled:cursor-default transition-colors truncate"
              >
                {selectedIdx < dayItems.length - 1 ? dayItems[selectedIdx + 1].title : '下一天'} ›
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedItem.districtColor }} />
                    {selectedItem.district}
                  </span>
                  <span className="font-mono">{selectedItem.timeLabel}</span>
                  {bearingInfo && Number(bearingInfo.distanceKm) > 0 && (
                    <span className="font-mono text-accent">
                      距帝京 {bearingInfo.dirLabel} {bearingInfo.distanceKm}km
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-medium tracking-wide leading-snug mt-1 pr-8">{selectedItem.title}</h3>
                <p className="text-xs text-ink-soft mt-1 inline-flex items-center gap-1">
                  <IconPin className="w-3.5 h-3.5 shrink-0" />
                  {selectedItem.location}
                </p>
                {selectedItem.isHK && (
                  <div className="mt-2">
                    <PaymentBadges payment={selectedItem.payment} />
                  </div>
                )}
                {selectedItem.links && (
                  <div className="mt-2">
                    <ItemLinks links={selectedItem.links} />
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <SunEventTag date={dayObj.date} startMs={new Date(selectedItem.start).getTime()} endMs={new Date(selectedItem.end).getTime()} />
                </div>
                {selectedItem.flexible && <p className="mt-2 text-[12px] text-ink-soft border-l-2 border-dashed border-ink/30 pl-2">可跳過：{selectedItem.flexible}</p>}
                <div className="mt-2">
                  <TicketSlot itemId={selectedItem.id} hint={rawSelectedItem?.ticketHint} />
                </div>
                {selectedItem.photoSpot && (
                  <div className="mt-2">
                    <PhotoInspo spot={selectedItem.photoSpot} title={selectedItem.title} location={selectedItem.location} image={selectedItem.image} />
                  </div>
                )}
              </div>

              {rawSelectedItem?.alternatives && rawSelectedItem.alternatives.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onToggleAlternative(rawSelectedItem.id, null)}
                    className={`h-7 px-2.5 text-[11px] cursor-pointer border ${!selectedItem.isAlternativeActive ? 'bg-ink text-paper border-ink' : 'border-ink/15'}`}
                  >
                    原定行程
                  </button>
                  {rawSelectedItem.alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => onToggleAlternative(rawSelectedItem.id, alt.id)}
                      className={`h-7 px-2.5 text-[11px] cursor-pointer border inline-flex items-center gap-1 ${
                        altSelections[rawSelectedItem.id] === alt.id ? 'bg-accent text-white border-accent' : 'text-accent border-accent/40'
                      }`}
                    >
                      <IconSwap /> {alt.label}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[13px] leading-relaxed text-ink/85">{selectedItem.description}</p>
              {selectedItem.tips && (
                <p className="text-[12px] leading-relaxed text-ink-soft border-l-2 border-brass pl-2.5">{selectedItem.tips}</p>
              )}

              <div className="pt-3 border-t border-dashed border-ink/15">
                <TransitLeg
                  steps={selectedItem.transit}
                  fromLabel={prevItem ? `從 ${prevItem.title}` : '從帝京酒店出發'}
                  fromCoords={prevItem?.coords ?? HOTEL_COORDS}
                  toCoords={selectedItem.coords}
                  toMtrId={selectedItem.mtrId}
                  onOpenMtr={onJumpToMtr}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={getGoogleMapsUrl(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 border border-ink/15 text-xs inline-flex items-center justify-center gap-1.5 hover:bg-ink hover:text-paper transition-colors"
                >
                  <IconArrowUpRight /> Google 地點
                </a>
                {selectedItem.isHK ? (
                  <a
                    href={getGoogleMapsDirectionsUrl(prevItem?.coords ?? HOTEL_COORDS, selectedItem.coords, 'transit')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-ink text-paper text-xs inline-flex items-center justify-center gap-1.5 hover:bg-accent hover:text-white transition-colors"
                  >
                    <IconTransit /> 導航過去
                  </a>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!cardOpen && selectedItem && (
        <button
          onClick={() => setCardOpen(true)}
          className="absolute z-20 right-3 bottom-24 h-10 px-4 bg-card border border-ink/10 text-xs cursor-pointer shadow-[0_10px_24px_-14px_rgba(0,0,0,0.4)]"
        >
          {selectedItem.title}・展開
        </button>
      )}
    </div>
  );
}
