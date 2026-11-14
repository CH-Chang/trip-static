import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ITINERARY_DAYS, TRIP_META } from './data/tripData';
import type { ResolvedTripItem, TripStatus } from './types/trip';
import NowStatusView from './components/NowStatusView';
import MapWorkspace from './components/MapWorkspace';
import FullItineraryView from './components/FullItineraryView';
import MtrMapSection from './components/MtrMapSection';
import Drawer from './components/Drawer';
import LogisticsDrawerContent from './components/LogisticsDrawerContent';
import LightParticles from './components/LightParticles';
import { LineRibbon, Seal } from './components/ui/MtrKit';
import { useTheme } from './utils/theme';
import { applyAlternatives } from './utils/resolveItems';
import { IconClock, IconPin } from './components/Icons';

type AppTab = 'now' | 'map' | 'itinerary';
type OverlayDrawer = 'none' | 'mtr' | 'logistics';
type TimeMode = 'live' | 'sim';

const STORAGE_KEY_CHECKLIST = 'hk-trip-2026-react-checklist';
const STORAGE_KEY_ALTS = 'hk-trip-2026-alt-selections';
const STORAGE_KEY_DELAYS = 'hk-trip-2026-delays';

/** 航班相關時段不會被順延（延誤只會往後推到這裡為止） */
const FIXED_ITEM_IDS = new Set(['d1-1', 'd1-2', 'd4-5', 'd4-6']);

const hkTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong' });

function formatClock(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    dateStr: `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`,
    timeStr: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  };
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('now');
  const { theme, toggle: toggleTheme } = useTheme();
  const [timeMode, setTimeMode] = useState<TimeMode>('live');
  const [simDate, setSimDate] = useState<Date>(() => new Date('2026-11-22T20:15:00+08:00'));
  const [now, setNow] = useState<Date>(() => new Date());
  const [showHudSimPopover, setShowHudSimPopover] = useState(false);
  const [isDebug, setIsDebug] = useState<boolean>(() => Boolean(window.DEBUG));

  useEffect(() => {
    let currentVal = Boolean(window.DEBUG);
    const descriptor = Object.getOwnPropertyDescriptor(window, 'DEBUG');
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(window, 'DEBUG', {
        configurable: true,
        enumerable: true,
        get: () => currentVal,
        set: (val: unknown) => {
          currentVal = Boolean(val);
          setIsDebug(currentVal);
          if (!currentVal) {
            setTimeMode('live');
            setShowHudSimPopover(false);
          }
        }
      });
    }
  }, []);

  const [activeOverlayDrawer, setActiveOverlayDrawer] = useState<OverlayDrawer>('none');

  const [selectedMapDay, setSelectedMapDay] = useState<number>(1);
  const [selectedMapItemId, setSelectedMapItemId] = useState<string>('d1-6');
  const [selectedMtrId, setSelectedMtrId] = useState<string>('mong-kok-east');

  const [altSelections, setAltSelections] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ALTS) || '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_CHECKLIST) || '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  const [delays, setDelays] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_DELAYS) || '{}') as Record<string, number>;
    } catch {
      return {};
    }
  });

  const allItems = useMemo<ResolvedTripItem[]>(
    () =>
      ITINERARY_DAYS.flatMap((d) => {
        let running = 0; // 目前累積的順延分鐘
        const resolved = applyAlternatives(d.items, altSelections).map((item) => {
          const isFixed = FIXED_ITEM_IDS.has(item.id);
          if (isFixed) running = 0;
          const extraMin = isFixed ? 0 : delays[item.id] ?? 0;
          const shiftMin = running;
          running += extraMin;
          const startMs = new Date(item.start).getTime() + shiftMin * 60000;
          const endMs = new Date(item.end).getTime() + (shiftMin + extraMin) * 60000;
          const changed = shiftMin !== 0 || extraMin !== 0;
          return {
            ...item,
            day: d.day,
            dateLabel: d.dateLabel,
            startMs,
            endMs,
            timeLabel: changed ? `${hkTime(startMs)} — ${hkTime(endMs)}` : item.timeLabel,
            shiftMin,
            extraMin,
            isFixed,
            overlapsFixed: false
          };
        });
        // 順延後若撞到下一個固定時段，標記警示
        resolved.forEach((it, i) => {
          const next = resolved[i + 1];
          if (next?.isFixed && it.endMs > next.startMs) it.overlapsFixed = true;
        });
        return resolved;
      }),
    [altSelections, delays]
  );

  const handleAdjustDelay = (itemId: string, deltaMin: number) => {
    setDelays((prev) => {
      const next = { ...prev, [itemId]: Math.max(-60, Math.min(240, (prev[itemId] ?? 0) + deltaMin)) };
      if (next[itemId] === 0) delete next[itemId];
      localStorage.setItem(STORAGE_KEY_DELAYS, JSON.stringify(next));
      return next;
    });
  };

  const handleResetDelays = (day?: number) => {
    setDelays((prev) => {
      const ids = day ? new Set(ITINERARY_DAYS.find((d) => d.day === day)?.items.map((i) => i.id)) : null;
      const next = ids ? Object.fromEntries(Object.entries(prev).filter(([k]) => !ids.has(k))) : {};
      localStorage.setItem(STORAGE_KEY_DELAYS, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeMode === 'live') {
        setNow(new Date());
      } else {
        setSimDate((prev) => new Date(prev.getTime() + 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeMode]);

  const effectiveNow = timeMode === 'live' ? now : simDate;
  const effectiveNowMs = effectiveNow.getTime();
  const { dateStr, timeStr } = formatClock(effectiveNow);

  const tripStatus = useMemo<TripStatus>(() => {
    const tripStartMs = new Date(TRIP_META.startDate).getTime();
    const tripEndMs = new Date(TRIP_META.endDate).getTime();

    if (effectiveNowMs < tripStartMs) {
      return {
        phase: 'before',
        progressPct: 0,
        currentItem: null,
        nextItem: allItems[0] || null,
        completedCount: 0,
        remainingMs: tripStartMs - effectiveNowMs
      };
    }

    if (effectiveNowMs >= tripEndMs) {
      return {
        phase: 'after',
        progressPct: 100,
        currentItem: null,
        nextItem: null,
        completedCount: allItems.length,
        remainingMs: 0
      };
    }

    let currentItem: ResolvedTripItem | null = null;
    let nextItem: ResolvedTripItem | null = null;
    let completedCount = 0;

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      if (effectiveNowMs >= item.endMs) {
        completedCount++;
      } else if (effectiveNowMs >= item.startMs && effectiveNowMs < item.endMs) {
        currentItem = item;
        nextItem = allItems[i + 1] || null;
        break;
      } else if (effectiveNowMs < item.startMs) {
        nextItem = item;
        break;
      }
    }

    const currentFraction = currentItem
      ? (effectiveNowMs - currentItem.startMs) / Math.max(1, currentItem.endMs - currentItem.startMs)
      : 0;
    const progressPct = Math.min(
      100,
      Math.round(((completedCount + currentFraction) / allItems.length) * 100)
    );

    return {
      phase: 'during',
      progressPct,
      currentItem,
      nextItem,
      completedCount,
      remainingMs: currentItem
        ? currentItem.endMs - effectiveNowMs
        : nextItem
        ? nextItem.startMs - effectiveNowMs
        : 0
    };
  }, [effectiveNowMs, allItems]);

  const switchTab = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleOpenSpotOnMap = (item: ResolvedTripItem, dayNum: number) => {
    setActiveOverlayDrawer('none');
    setSelectedMapDay(dayNum);
    setSelectedMapItemId(item.id);
    if (item.mtrId) setSelectedMtrId(item.mtrId);
    switchTab('map');
  };

  // 從路線或景點點進港鐵頁：鎖定指定車站，不被「最近車站」覆蓋
  const [mtrFocusLocked, setMtrFocusLocked] = useState(false);
  const handleJumpToMtr = (mtrId: string) => {
    setSelectedMtrId(mtrId);
    setMtrFocusLocked(true);
    setActiveOverlayDrawer('mtr');
  };

  const handleToggleAlternative = (itemId: string, altId: string | null) => {
    setAltSelections((prev) => {
      const next = { ...prev };
      if (!altId) delete next[itemId];
      else next[itemId] = altId;
      localStorage.setItem(STORAGE_KEY_ALTS, JSON.stringify(next));
      return next;
    });
  };

  const toggleChecklist = (id: string) => {
    setChecklistState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(next));
      return next;
    });
  };

  const hudCurrentSpot =
    tripStatus.phase === 'before'
      ? '尚未出發・準備行李中'
      : tripStatus.phase === 'after'
      ? '旅程圓滿結束'
      : tripStatus.currentItem
      ? tripStatus.currentItem.title
      : '城市移動・轉場休息';

  const hudNextSpot = tripStatus.nextItem
    ? `${tripStatus.nextItem.timeLabel} ${tripStatus.nextItem.title}`
    : '無後續行程';

  const hudTargetItem = tripStatus.currentItem?.isHK
    ? tripStatus.currentItem
    : tripStatus.nextItem?.isHK
    ? tripStatus.nextItem
    : allItems.find((i) => i.isHK);

  const tabs: Array<{ id: AppTab; label: string; en: string }> = [
    { id: 'now', label: '此刻', en: 'NOW' },
    { id: 'map', label: '地圖', en: 'MAP' },
    { id: 'itinerary', label: '行程', en: 'DAYS' }
  ];

  return (
    <div className={activeTab === 'map' ? 'h-[100dvh] w-full overflow-hidden flex flex-col bg-paper' : 'min-h-screen bg-paper'}>
      {activeTab !== 'map' && !(activeTab === 'now' && tripStatus.phase === 'before') && (
        <>
          <div className="fixed inset-0 paper-grain pointer-events-none -z-20" />
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <LightParticles />
          </div>
        </>
      )}

      <header className="sticky top-0 z-30 shrink-0 bg-paper/90 backdrop-blur-md border-b border-ink/10 pt-[env(safe-area-inset-top)]">
        <LineRibbon className="h-1" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <button onClick={() => switchTab('now')} className="flex items-center gap-2.5 cursor-pointer shrink-0">
            <motion.span whileHover={{ rotate: 8, scale: 1.06 }} className="inline-flex">
              <Seal text="港" className="w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg bg-card" />
            </motion.span>
            <span className="hidden md:flex flex-col leading-none">
              <span className="font-hand font-bold text-lg tracking-[0.18em] text-ink">香江拾光</span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-ink-soft mt-1">HONG KONG · 11.22—11.25</span>
            </span>
          </button>

          <nav className="flex min-w-0 items-center gap-0.5 p-0.5 sm:p-1 bg-ink/5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => switchTab(tab.id)}
                  className={`relative px-2 sm:px-4 h-8 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                    active ? 'text-paper font-bold' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="app-tab-pill"
                      className="absolute inset-0 bg-ink shadow-[3px_3px_0_rgba(31,29,26,0.14)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative font-hand">{tab.label}</span>
                  <span className="relative hidden sm:inline font-mono text-[9px] tracking-widest ml-1 opacity-60">{tab.en}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '切換為淺色模式' : '切換為暗黑模式'}
              title={theme === 'dark' ? '淺色模式' : '暗黑模式'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-ink/15 flex items-center justify-center cursor-pointer hover:border-ink/40 transition overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ y: 14, opacity: 0, rotate: -40 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -14, opacity: 0, rotate: 40 }}
                  transition={{ duration: 0.25 }}
                  className="text-[15px] leading-none"
                >
                  {theme === 'dark' ? '☾' : '☀'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setMtrFocusLocked(false);
                setActiveOverlayDrawer((v) => (v === 'mtr' ? 'none' : 'mtr'));
              }}
              className="h-9 px-2.5 sm:pl-1.5 sm:pr-3 text-[13px] font-bold cursor-pointer inline-flex items-center gap-1.5 bg-accent text-white shadow-[3px_3px_0_rgba(200,16,46,0.3)] hover:brightness-110 transition"
            >
              <span className="hidden sm:flex w-6 h-6 rounded-full bg-card/95 items-center justify-center">
                <span className="w-3.5 h-[3px] bg-accent" />
              </span>
              <span className="font-hand">港鐵</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveOverlayDrawer((v) => (v === 'logistics' ? 'none' : 'logistics'))}
              className="h-9 px-2.5 sm:px-3 text-[13px] font-bold cursor-pointer bg-card border border-ink/12 hover:border-ink/40 transition"
            >
              <span className="font-hand">手帖</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className={activeTab === 'map' ? 'relative flex-1 min-h-0 overflow-hidden' : ''}>
        {/* 不等待離場動畫，直接淡入新頁，切換更即時（地圖頁尤其明顯） */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: activeTab === 'map' ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={activeTab === 'map' ? 'h-full' : ''}
          >
            {activeTab === 'now' && (
              <NowStatusView
                allItems={allItems}
                tripStatus={tripStatus}
                effectiveNow={effectiveNow}
                timeMode={timeMode}
                onOpenMapForSpot={handleOpenSpotOnMap}
                onOpenTab={switchTab}
                onOpenTimeMachine={() => setShowHudSimPopover(true)}
                isDebug={isDebug}
                onOpenMtrDrawer={handleJumpToMtr}
                onToggleAlternative={handleToggleAlternative}
                altSelections={altSelections}
                onAdjustDelay={handleAdjustDelay}
                onResetDelays={handleResetDelays}
                onOpenChecklist={() => setActiveOverlayDrawer('logistics')}
              />
            )}

            {activeTab === 'map' && (
              <MapWorkspace
                selectedDay={selectedMapDay}
                onSelectDay={setSelectedMapDay}
                selectedItemId={selectedMapItemId}
                onSelectItemId={setSelectedMapItemId}
                altSelections={altSelections}
                onToggleAlternative={handleToggleAlternative}
                onJumpToMtr={handleJumpToMtr}
                tripStatus={tripStatus}
                effectiveNowMs={effectiveNowMs}
              />
            )}

            {activeTab === 'itinerary' && (
              <FullItineraryView
                allItems={allItems}
                tripStatus={tripStatus}
                effectiveNowMs={effectiveNowMs}
                onOpenMapForSpot={handleOpenSpotOnMap}
                onToggleAlternative={handleToggleAlternative}
                onOpenMtr={handleJumpToMtr}
                onAdjustDelay={handleAdjustDelay}
                onResetDelays={handleResetDelays}
              />
            )}
          </motion.div>
      </main>

      <Drawer
        open={activeOverlayDrawer === 'mtr'}
        onClose={() => setActiveOverlayDrawer('none')}
        side="right"
        size="xl"
        bodyClassName="flex-1 min-h-0 overflow-hidden"
        subtitle="HONG KONG MTR · 98 STATIONS"
        title="港鐵路網・最近車站・搭車路線"
      >
        <MtrMapSection
          isOpen={activeOverlayDrawer === 'mtr'}
          selectedStationId={selectedMtrId}
          onSelectStation={setSelectedMtrId}
          autoSelectNearest={!mtrFocusLocked}
        />
      </Drawer>

      <Drawer
        open={activeOverlayDrawer === 'logistics'}
        onClose={() => setActiveOverlayDrawer('none')}
        side="right"
        size="lg"
        subtitle="FLIGHTS · HOTEL · CHECKLIST"
        title="行前手帖"
      >
        <LogisticsDrawerContent checklistState={checklistState} onToggleChecklist={toggleChecklist} />
      </Drawer>

      {/* ───────── 車廂顯示屏 HUD ───────── */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(94vw,860px)] z-30">
        <AnimatePresence>
          {isDebug && showHudSimPopover && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              className="mb-2 p-4 rounded-3xl bg-card border border-ink/10 shadow-[3px_3px_0_rgba(31,29,26,0.14)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-hand text-sm font-bold text-accent inline-flex items-center gap-1.5">
                  <IconClock />
                  <span>模擬時光機，可以跳到任意時刻測試</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimeMode('live')}
                    className={`px-3 py-1 text-[11px] font-mono border cursor-pointer ${
                      timeMode === 'live' ? 'bg-ink text-paper border-ink' : 'border-ink/20'
                    }`}
                  >
                    切回即時
                  </button>
                  <button
                    onClick={() => setShowHudSimPopover(false)}
                    className="w-7 h-7 text-[11px] font-mono text-ink-soft hover:bg-ink/5 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  ['2026-11-22T12:15:00+08:00', 'D1 飛行 HB703'],
                  ['2026-11-22T20:15:00+08:00', 'D1 維港天星小輪'],
                  ['2026-11-23T17:30:00+08:00', 'D2 太平山暮色'],
                  ['2026-11-24T16:30:00+08:00', 'D3 西九日落'],
                  ['2026-11-25T11:00:00+08:00', 'D4 昂坪纜車'],
                  ['2026-11-25T13:30:00+08:00', 'D4 東薈城 Bakehouse'],
                  ['2026-11-25T16:30:00+08:00', 'D4 機場 T2']
                ].map(([iso, label]) => (
                  <button
                    key={iso}
                    onClick={() => {
                      setTimeMode('sim');
                      setSimDate(new Date(iso));
                    }}
                    className="px-3 py-1 text-[11px] border border-ink/15 bg-paper hover:bg-accent hover:text-white transition cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
                <input
                  type="datetime-local"
                  value={`${simDate.getFullYear()}-${String(simDate.getMonth() + 1).padStart(2, '0')}-${String(
                    simDate.getDate()
                  ).padStart(2, '0')}T${String(simDate.getHours()).padStart(2, '0')}:${String(
                    simDate.getMinutes()
                  ).padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTimeMode('sim');
                      setSimDate(new Date(`${e.target.value}:00+08:00`));
                    }
                  }}
                  className="ml-auto bg-paper border border-ink/15 px-3 py-1 text-[11px] font-mono"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.2 }}
          className="bg-card/90 text-ink backdrop-blur-md border border-ink/10 shadow-[0_12px_30px_-12px_rgba(43,42,40,0.3)] overflow-hidden"
        >
          {/* 行程總進度（像車廂上方的路綫燈條） */}
          <div className="relative h-[3px] bg-ink/8">
            <motion.div
              className="absolute inset-y-0 left-0 bg-accent"
              animate={{ width: `${tripStatus.progressPct}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            />
          </div>
          <div className="px-3 sm:px-4 py-2.5 flex items-center gap-3">
            <div className={`shrink-0 rounded-xl px-2 py-1 text-center ${timeMode === 'sim' ? 'bg-accent text-white' : 'bg-ink/5'}`}>
              <span className="block font-mono text-[9px] tracking-widest opacity-60">{timeMode === 'sim' ? 'SIM' : 'LIVE'}</span>
              <span className="block led text-sm font-bold leading-tight">{timeStr.slice(0, 5)}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 font-mono text-[10px] tracking-widest text-ink/40">NOW</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hudCurrentSpot}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="font-hand text-sm sm:text-base font-bold truncate"
                  >
                    {hudCurrentSpot}
                  </motion.span>
                </AnimatePresence>
                <span className="hidden md:inline led text-[11px] shrink-0">{formatDuration(tripStatus.remainingMs)}</span>
              </div>
              <p className="text-[11px] text-ink/55 truncate">
                <span className="text-accent">下一站 ▸</span> {hudNextSpot}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hudTargetItem && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleOpenSpotOnMap(hudTargetItem, hudTargetItem.day || 1)}
                  className="h-9 px-3 rounded-full text-[12px] bg-ink text-paper cursor-pointer inline-flex items-center gap-1"
                >
                  <IconPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">地圖看這站</span>
                </motion.button>
              )}
              {isDebug && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowHudSimPopover((v) => !v)}
                  className="h-9 px-3 rounded-full text-[12px] border border-ink/20 hover:bg-ink/5 transition cursor-pointer inline-flex items-center gap-1"
                >
                  <IconClock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{timeMode === 'sim' ? dateStr.slice(5) : '時光機'}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
