import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HOTEL_COORDS, ITINERARY_DAYS } from '../data/tripData';
import type { ResolvedTripItem, TripStatus } from '../types/trip';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconPin, IconSwap, IconTransit } from './Icons';
import { LineProgress, Seal, StationSign } from './ui/MtrKit';
import DelayControl from './ui/DelayControl';
import PaymentBadges from './ui/PaymentBadges';
import { TicketSlot } from './ui/Tickets';
import PhotoInspo, { PhotoSpotBadge } from './ui/PhotoInspo';
import PreDepartureCarousel from './PreDepartureCarousel';
import TransitLeg from './ui/TransitLeg';
import { DayWeatherBadge } from './ui/WeatherPanel';
import { SunEventTag } from './ui/SunTimes';

type AppTab = 'now' | 'map' | 'itinerary';

interface NowStatusViewProps {
  onOpenChecklist: () => void;
  onAdjustDelay: (itemId: string, deltaMin: number) => void;
  onResetDelays: (day?: number) => void;
  allItems: ResolvedTripItem[];
  tripStatus: TripStatus;
  effectiveNow: Date;
  timeMode: 'live' | 'sim';
  onOpenMapForSpot: (item: ResolvedTripItem, dayNum: number) => void;
  onOpenTab: (tab: AppTab) => void;
  onOpenTimeMachine: () => void;
  isDebug?: boolean;
  onOpenMtrDrawer: (mtrId: string) => void;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
  altSelections: Record<string, string>;
}

function getCountdownParts(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    days: pad(Math.floor(totalSec / 86400)),
    hours: pad(Math.floor((totalSec % 86400) / 3600)),
    mins: pad(Math.floor((totalSec % 3600) / 60)),
    secs: pad(totalSec % 60)
  };
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
};

/** 逐字浮現的標題 */
function HandHeadline({ text, className }: { text: string; className: string }) {
  return (
    <h1 className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 18, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.15 + i * 0.035, type: 'spring', stiffness: 220, damping: 18 }}
        >
          {ch}
        </motion.span>
      ))}
    </h1>
  );
}

/** 拍立得照片＋紙膠帶 */
function Polaroid({ src, alt, caption, tilt = -2 }: { src: string; alt: string; caption?: string; tilt?: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, rotate: tilt * 3, y: 20 }}
      animate={{ opacity: 1, rotate: tilt, y: 0 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      className="relative bg-card p-3 pb-12 shadow-[3px_3px_0_rgba(31,29,26,0.14)] rounded-sm"
    >
      <span className="washi -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
      <div className="aspect-[4/3] overflow-hidden bg-paper-2">
        <img
          src={src}
          alt={alt}
          onError={(e) => {
            const fig = e.currentTarget.closest('figure') as HTMLElement | null;
            if (fig) fig.style.display = 'none';
          }}
          className="w-full h-full object-cover sepia-[0.12] saturate-[0.92] contrast-[1.03]"
        />
      </div>
      {caption && <figcaption className="absolute bottom-3 inset-x-3 font-hand text-base text-ink-soft text-center truncate">{caption}</figcaption>}
    </motion.figure>
  );
}

export default function NowStatusView({
  allItems,
  tripStatus,
  effectiveNow,
  timeMode,
  onOpenMapForSpot,
  onOpenTab,
  onOpenTimeMachine,
  isDebug = false,
  onOpenMtrDrawer,
  onToggleAlternative,
  altSelections,
  onAdjustDelay,
  onResetDelays,
  onOpenChecklist
}: NowStatusViewProps) {
  const cd = getCountdownParts(tripStatus.remainingMs);

  // ───────────────────────── 出發前 ─────────────────────────
  if (tripStatus.phase === 'before') {
    return <PreDepartureCarousel cd={cd} onOpenTab={onOpenTab} onOpenChecklist={onOpenChecklist} isDebug={isDebug} onOpenTimeMachine={onOpenTimeMachine} />;
  }

  // ───────────────────────── 旅程結束 ─────────────────────────
  if (tripStatus.phase === 'after') {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-36 text-center">
        <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }}>
          <Seal text="圓滿" className="w-20 h-20 text-xl mb-6" />
        </motion.div>
        <HandHeadline text="底片已滿，九龍的夜色收進行囊。" className="font-hand text-4xl sm:text-5xl font-bold leading-snug mb-6" />
        <p className="text-[15px] text-ink-soft leading-[1.9] max-w-xl mx-auto mb-8">
          UO116 已於 11 月 25 日平安返抵桃園。謝謝這四天三夜，在叮叮車和天星小輪上，還有大嶼山的海風裡寫下的每一頁。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => onOpenTab('itinerary')} className="h-11 px-6 bg-ink text-paper text-sm font-bold cursor-pointer">
            回顧四日行程
          </button>
          {isDebug && (
            <button onClick={onOpenTimeMachine} className="h-11 px-6 border border-ink/20 text-sm font-bold cursor-pointer">
              時光機重溫
            </button>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────── 旅途中 ─────────────────────────
  return (
    <DuringView
      allItems={allItems}
      tripStatus={tripStatus}
      effectiveNow={effectiveNow}
      timeMode={timeMode}
      cd={cd}
      onOpenMapForSpot={onOpenMapForSpot}
      onOpenTab={onOpenTab}
      onOpenMtrDrawer={onOpenMtrDrawer}
      onToggleAlternative={onToggleAlternative}
      altSelections={altSelections}
      onAdjustDelay={onAdjustDelay}
      onResetDelays={onResetDelays}
    />
  );
}

function DuringView({
  allItems,
  tripStatus,
  effectiveNow,
  timeMode,
  cd,
  onOpenMapForSpot,
  onOpenTab,
  onOpenMtrDrawer,
  onToggleAlternative,
  altSelections,
  onAdjustDelay,
  onResetDelays
}: {
  onAdjustDelay: (itemId: string, deltaMin: number) => void;
  onResetDelays: (day?: number) => void;
  allItems: ResolvedTripItem[];
  tripStatus: TripStatus;
  effectiveNow: Date;
  timeMode: 'live' | 'sim';
  cd: ReturnType<typeof getCountdownParts>;
  onOpenMapForSpot: (item: ResolvedTripItem, dayNum: number) => void;
  onOpenTab: (tab: AppTab) => void;
  onOpenMtrDrawer: (mtrId: string) => void;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
  altSelections: Record<string, string>;
}) {
  const activeItem = tripStatus.currentItem;
  const nextItem = tripStatus.nextItem;
  const focusItem = activeItem || nextItem;
  const dayNum = focusItem?.day ?? 1;
  const dayObj = ITINERARY_DAYS.find((d) => d.day === dayNum) ?? ITINERARY_DAYS[0];
  const dayItems = useMemo(() => allItems.filter((i) => i.day === dayNum), [allItems, dayNum]);
  const nowMs = effectiveNow.getTime();

  // 今日路綫上的列車位置
  const progress = useMemo(() => {
    for (let i = 0; i < dayItems.length; i++) {
      const it = dayItems[i];
      if (nowMs < it.startMs) return Math.max(0, i - 0.5);
      if (nowMs < it.endMs) return i + Math.min(0.9, (nowMs - it.startMs) / Math.max(1, it.endMs - it.startMs)) * 0.5;
    }
    return dayItems.length - 1;
  }, [dayItems, nowMs]);

  const bearingInfo = focusItem?.isHK ? getBearingAndDistance(HOTEL_COORDS, focusItem.coords) : null;
  const isAltActive = Boolean(focusItem && altSelections[focusItem.id]);

  // 下一段交通：正在景點中 → 前往下一站；轉場中 → 前往即將抵達的景點
  const legTarget = activeItem ? nextItem : focusItem;
  const legFrom = legTarget ? dayItems[dayItems.findIndex((i) => i.id === legTarget.id) - 1] : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-36 space-y-6">
      {/* 車廂顯示屏 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-ink/10 overflow-hidden"
      >
        <div className="h-1.5" style={{ backgroundColor: dayObj.stationColor }} />
        <div className="px-5 sm:px-7 pt-5 pb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2"><DayWeatherBadge date={dayObj.date} /></div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-ink/45">
              DAY 0{dayNum} ・ {dayObj.dateLabel} ・ {timeMode === 'sim' ? 'SIMULATED' : 'LIVE'} {effectiveNow.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="led text-xs mt-2">{activeItem ? '此刻 NOW' : '列車即將到站 ARRIVING'}</p>
            <AnimatePresence mode="wait">
              <motion.h1
                key={focusItem?.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="font-serif text-3xl sm:text-4xl font-medium tracking-wide mt-1 leading-tight"
              >
                {focusItem?.title ?? '城市漫遊中'}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-[10px] tracking-widest text-ink/45">{activeItem ? '本段剩餘' : '距離抵達'}</p>
            <p className="led text-3xl sm:text-4xl font-bold tabular-nums">
              {cd.hours}:{cd.mins}
              <span className="text-lg opacity-70">:{cd.secs}</span>
            </p>
          </div>
        </div>
        <div className="px-3 sm:px-5 pb-4">
          <LineProgress
            color={dayObj.stationColor}
            progress={progress}
            stops={dayItems.map((it) => ({ id: it.id, label: it.title.length > 8 ? `${it.title.slice(0, 8)}…` : it.title, sub: it.timeLabel.slice(0, 5) }))}
          />
        </div>
      </motion.section>

      {/* 延誤調整＋下一段交通 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {focusItem && (
          <motion.div {...reveal} className="bg-card border border-ink/15 p-4 shadow-[3px_3px_0_rgba(31,29,26,0.1)]">
            <DelayControl item={focusItem} onAdjust={onAdjustDelay} onResetDay={onResetDelays} />
          </motion.div>
        )}
        {legTarget && (
          <motion.div {...reveal} className="bg-card border border-ink/15 p-4 shadow-[3px_3px_0_rgba(31,29,26,0.1)]">
            <p className="font-hand font-bold mb-2">
              怎麼去 <span className="text-accent">{legTarget.title}</span>
            </p>
            <TransitLeg
              steps={legTarget.transit}
              fromLabel={legFrom ? `從 ${legFrom.title}` : '從帝京酒店出發'}
              fromCoords={legFrom?.coords ?? HOTEL_COORDS}
              toCoords={legTarget.coords}
              toMtrId={legTarget.mtrId}
              onOpenMtr={onOpenMtrDrawer}
            />
          </motion.div>
        )}
      </div>

      {/* 焦點景點 */}
      {focusItem && (
        <AnimatePresence mode="wait">
          <motion.section
            key={focusItem.id + (isAltActive ? '-alt' : '')}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start"
          >
            {focusItem.image && (
              <div className="lg:col-span-5 px-4 sm:px-8 lg:px-2 pt-4">
                <Polaroid src={focusItem.image} alt={focusItem.title} caption={`${focusItem.district}・${focusItem.timeLabel}`} />
              </div>
            )}

            <div className={`${focusItem.image ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex flex-wrap items-center gap-2">
                {focusItem.photoSpot?.hot && <PhotoSpotBadge />}
                <SunEventTag date={dayObj.date} startMs={focusItem.startMs} endMs={focusItem.endMs} />
                <span className="px-2.5 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: focusItem.districtColor }}>
                  {focusItem.district}
                </span>
                <span className="font-mono text-xs text-ink-soft">{focusItem.timeLabel}</span>
                {bearingInfo && Number(bearingInfo.distanceKm) > 0 && (
                  <span className="font-mono text-xs font-bold text-accent">
                    距帝京 {bearingInfo.dirLabel} {bearingInfo.distanceKm} km
                  </span>
                )}
              </div>

              <p className="text-sm text-jade font-semibold inline-flex items-center gap-1.5">
                <IconPin /> {focusItem.location}
              </p>
              {focusItem.isHK && <PaymentBadges payment={focusItem.payment} />}
              <TicketSlot itemId={focusItem.id} hint={focusItem.ticketHint} />
              {focusItem.photoSpot && <PhotoInspo spot={focusItem.photoSpot} title={focusItem.title} location={focusItem.location} image={focusItem.image} />}

              {focusItem.alternatives && focusItem.alternatives.length > 0 && (
                <div className="rounded-2xl bg-paper-2/70 p-3">
                  <p className="font-hand text-sm text-ink-soft mb-2">人太多或下雨？換個備案：</p>
                  <div className="flex flex-wrap gap-1.5">
                    <AltChip active={!isAltActive} onClick={() => onToggleAlternative(focusItem.id, null)}>
                      原定行程
                    </AltChip>
                    {focusItem.alternatives.map((alt) => (
                      <AltChip key={alt.id} active={altSelections[focusItem.id] === alt.id} accent onClick={() => onToggleAlternative(focusItem.id, alt.id)}>
                        <IconSwap /> {alt.label}
                      </AltChip>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[15px] text-ink-soft leading-[1.9]">{focusItem.description}</p>

              <div className="relative rounded-2xl paper-card border border-ink/8 p-4 pl-5 shadow-[3px_3px_0_rgba(31,29,26,0.14)]">
                <span className="absolute left-0 top-4 bottom-4 w-1 bg-brass" />
                <p className="font-hand text-brass font-bold mb-0.5">手帖筆記</p>
                <p className="font-hand text-[15px] text-ink-soft leading-relaxed">{focusItem.tips}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {focusItem.isHK && (
                  <ActionBtn primary onClick={() => onOpenMapForSpot(focusItem, focusItem.day)}>
                    <IconPin /> 地圖方位
                  </ActionBtn>
                )}
                {focusItem.isHK && (
                  <ActionBtn href={getGoogleMapsDirectionsUrl(HOTEL_COORDS, focusItem.coords, 'transit')} red>
                    <IconTransit /> 帝京出發導航
                  </ActionBtn>
                )}
                {focusItem.mtrId && (
                  <ActionBtn onClick={() => onOpenMtrDrawer(focusItem.mtrId!)}>
                    <span className="w-3 h-3 rounded-full border-2 border-accent" /> 港鐵怎麼搭
                  </ActionBtn>
                )}
                <ActionBtn href={getGoogleMapsUrl(focusItem)}>
                  <IconArrowUpRight /> Google
                </ActionBtn>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {nextItem && activeItem && (
        <motion.button
          {...reveal}
          onClick={() => onOpenTab('itinerary')}
          className="w-full text-left cursor-pointer group"
        >
          <StationSign
            kicker="下一站 NEXT STATION"
            zh={nextItem.title}
            en={`${nextItem.timeLabel} ・ ${nextItem.location}`}
            color={ITINERARY_DAYS.find((d) => d.day === nextItem.day)?.stationColor ?? '#53B7E8'}
            className="group-hover:-translate-y-1 transition-transform"
          />
        </motion.button>
      )}
    </div>
  );
}

function AltChip({ active, accent, onClick, children }: { active: boolean; accent?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`h-8 px-3 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
        active ? (accent ? 'bg-accent text-white' : 'bg-ink text-paper') : accent ? 'bg-card text-accent' : 'bg-card text-ink'
      }`}
    >
      {children}
    </motion.button>
  );
}

function ActionBtn({
  children,
  onClick,
  href,
  primary,
  red
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
  red?: boolean;
}) {
  const cls = `h-10 px-4 text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition ${
    primary ? 'bg-ink text-paper' : red ? 'bg-accent text-white' : 'bg-card border border-ink/12 hover:border-ink/40'
  }`;
  return href ? (
    <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </motion.a>
  ) : (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={cls}>
      {children}
    </motion.button>
  );
}
