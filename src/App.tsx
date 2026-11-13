import { useEffect, useMemo, useState } from 'react';
import { ITINERARY_DAYS, TRIP_META } from './data/tripData';
import type { ResolvedTripItem, TripStatus } from './types/trip';
import NowStatusView from './components/NowStatusView';
import MapWorkspace from './components/MapWorkspace';
import FullItineraryView from './components/FullItineraryView';
import MtrMapSection from './components/MtrMapSection';
import Drawer from './components/Drawer';
import LogisticsDrawerContent from './components/LogisticsDrawerContent';
import HarbourCanvas from './components/HarbourCanvas';
import { IconClock, IconPin } from './components/Icons';

type AppTab = 'now' | 'map' | 'itinerary';
type OverlayDrawer = 'none' | 'mtr' | 'logistics';
type TimeMode = 'live' | 'sim';

const STORAGE_KEY_CHECKLIST = 'hk-trip-2026-react-checklist';
const STORAGE_KEY_ALTS = 'hk-trip-2026-alt-selections';

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
  const [timeMode, setTimeMode] = useState<TimeMode>('live');
  const [simDate, setSimDate] = useState<Date>(() => new Date('2026-11-22T20:15:00+08:00'));
  const [now, setNow] = useState<Date>(() => new Date());
  const [showHudSimPopover, setShowHudSimPopover] = useState(false);

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

  const allItems = useMemo<ResolvedTripItem[]>(
    () =>
      ITINERARY_DAYS.flatMap((d) =>
        d.items.map((item) => {
          const altId = altSelections[item.id];
          const alt = altId ? item.alternatives?.find((a) => a.id === altId) : undefined;
          return {
            ...item,
            title: alt ? alt.title : item.title,
            location: alt ? alt.location : item.location,
            coords: alt ? alt.coords : item.coords,
            googleQuery: alt ? alt.googleQuery : item.googleQuery,
            description: alt ? alt.description : item.description,
            isAlternativeActive: Boolean(alt),
            day: d.day,
            dateLabel: d.dateLabel,
            startMs: new Date(item.start).getTime(),
            endMs: new Date(item.end).getTime()
          };
        })
      ),
    [altSelections]
  );

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

  const handleJumpToMtr = (mtrId: string) => {
    setSelectedMtrId(mtrId);
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

  const tabs: Array<{ id: AppTab; label: string }> = [
    { id: 'now', label: '01 現在狀況' },
    { id: 'map', label: '02 地圖' },
    { id: 'itinerary', label: '03 完整行程' }
  ];

  return (
    <div className={activeTab === 'map' ? 'h-screen w-screen overflow-hidden flex flex-col bg-[#F4EFE6]' : 'min-h-screen bg-[#F4EFE6]'}>
      {activeTab !== 'map' && (
        <>
          <div className="fixed inset-0 paper-grain pointer-events-none -z-20" />
          <HarbourCanvas />
        </>
      )}

      <header className="sticky top-0 z-30 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#1C1B19]/15 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button onClick={() => switchTab('now')} className="flex items-center gap-2 cursor-pointer shrink-0 mr-1">
              <span className="w-6 h-6 border border-[#A63429] text-[#A63429] font-serif text-xs font-bold flex items-center justify-center">
                港
              </span>
              <span className="hidden md:inline font-serif font-bold tracking-wider text-base text-[#1C1B19]">
                香江拾光
              </span>
            </button>

            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-mono tracking-wider whitespace-nowrap transition cursor-pointer border ${
                      active
                        ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332] font-semibold'
                        : 'bg-transparent text-[#5A554C] border-transparent hover:border-[#1C1B19]/20 hover:text-[#1C1B19]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveOverlayDrawer((v) => (v === 'mtr' ? 'none' : 'mtr'))}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition cursor-pointer border ${
                activeOverlayDrawer === 'mtr'
                  ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                  : 'bg-[#FAF6EE] text-[#1C1B19] border-[#1C1B19]/20 hover:border-[#1C1B19]/50'
              }`}
            >
              港鐵路網
            </button>

            <button
              onClick={() => setActiveOverlayDrawer((v) => (v === 'logistics' ? 'none' : 'logistics'))}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition cursor-pointer border ${
                activeOverlayDrawer === 'logistics'
                  ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                  : 'bg-[#FAF6EE] text-[#1C1B19] border-[#1C1B19]/20 hover:border-[#1C1B19]/50'
              }`}
            >
              行前手帖
            </button>
          </div>
        </div>
      </header>

      <main className={activeTab === 'map' ? 'relative flex-1 overflow-hidden' : ''}>
        {activeTab === 'now' && (
          <NowStatusView
            tripStatus={tripStatus}
            effectiveNow={effectiveNow}
            timeMode={timeMode}
            onOpenMapForSpot={handleOpenSpotOnMap}
            onOpenTab={switchTab}
            onOpenTimeMachine={() => setShowHudSimPopover(true)}
            onOpenMtrDrawer={handleJumpToMtr}
            onToggleAlternative={handleToggleAlternative}
            altSelections={altSelections}
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
          />
        )}
      </main>

      <Drawer
        open={activeOverlayDrawer === 'mtr'}
        onClose={() => setActiveOverlayDrawer('none')}
        side="right"
        wide
        subtitle="HONG KONG MTR TRANSIT"
        title="港鐵核心路網與最近車站定位"
      >
        <MtrMapSection selectedStationId={selectedMtrId} onSelectStation={setSelectedMtrId} />
      </Drawer>

      <Drawer
        open={activeOverlayDrawer === 'logistics'}
        onClose={() => setActiveOverlayDrawer('none')}
        side="right"
        wide
        subtitle="FLIGHTS, HOTEL & CHECKLIST"
        title="航班資訊、帝京酒店與行前清單"
      >
        <LogisticsDrawerContent checklistState={checklistState} onToggleChecklist={toggleChecklist} />
      </Drawer>

      <div className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(94vw,840px)] z-30">
        {showHudSimPopover && (
          <div className="mb-2 p-4 bg-[#FAF6EE] border border-[#1C1B19]/30 shadow-[6px_6px_0px_rgba(27,67,50,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-[#A63429] inline-flex items-center gap-1.5">
                <IconClock />
                <span>模擬時光機（測試任意時刻）</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimeMode('live')}
                  className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer ${
                    timeMode === 'live' ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]' : 'border-[#1C1B19]/20'
                  }`}
                >
                  切回即時
                </button>
                <button
                  onClick={() => setShowHudSimPopover(false)}
                  className="px-2 py-1 text-[11px] font-mono text-[#5A554C] hover:text-[#1C1B19] cursor-pointer"
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
                ['2026-11-24T11:00:00+08:00', 'D3 昂坪纜車'],
                ['2026-11-25T16:30:00+08:00', 'D4 機場 T2']
              ].map(([iso, label]) => (
                <button
                  key={iso}
                  onClick={() => {
                    setTimeMode('sim');
                    setSimDate(new Date(iso));
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono border border-[#1C1B19]/20 bg-[#F4EFE6] hover:bg-[#A63429] hover:text-[#F4EFE6] transition cursor-pointer"
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
                className="ml-auto bg-[#F4EFE6] border border-[#1C1B19]/25 px-2 py-1 text-[11px] font-mono"
              />
            </div>
          </div>
        )}

        <div className="bg-[#1C1B19]/95 text-[#F4EFE6] backdrop-blur-md border border-[#FAF6EE]/20 px-4 py-2.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`shrink-0 px-2 py-0.5 text-[10px] font-mono tracking-wider ${
                timeMode === 'sim' ? 'bg-[#A63429] text-white' : 'bg-[#1B4332] text-[#D4C5A9]'
              }`}
            >
              {timeMode === 'sim' ? 'SIM' : 'LIVE'} {timeStr.slice(0, 5)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold truncate">
                <span className="text-[#D4C5A9] font-mono text-[11px]">現在：</span>
                <span className="truncate">{hudCurrentSpot}</span>
                <span className="hidden md:inline font-mono text-[11px] text-[#D4C5A9] shrink-0">
                  ({formatDuration(tripStatus.remainingMs)})
                </span>
              </div>
              <p className="text-[11px] text-[#F4EFE6]/70 truncate">下一站：{hudNextSpot}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hudTargetItem && (
              <button
                onClick={() => handleOpenSpotOnMap(hudTargetItem, hudTargetItem.day || 1)}
                className="px-3 py-1.5 text-[11px] font-mono bg-[#F4EFE6] text-[#1C1B19] hover:bg-[#D4C5A9] transition cursor-pointer font-semibold inline-flex items-center gap-1"
              >
                <IconPin className="w-3 h-3" />
                <span>地圖看這站</span>
              </button>
            )}
            <button
              onClick={() => setShowHudSimPopover((v) => !v)}
              className="px-3 py-1.5 text-[11px] font-mono border border-[#F4EFE6]/30 text-[#F4EFE6] hover:bg-[#F4EFE6]/10 transition cursor-pointer inline-flex items-center gap-1"
            >
              <IconClock className="w-3 h-3" />
              <span>{timeMode === 'sim' ? dateStr.slice(5) : '時光機'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
