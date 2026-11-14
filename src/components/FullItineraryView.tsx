import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { HOTEL_COORDS, ITINERARY_DAYS } from '../data/tripData';
import type { ResolvedTripItem, TripStatus } from '../types/trip';
import { getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconPin, IconSwap } from './Icons';
import { SectionTitle } from './ui/MtrKit';
import DelayControl from './ui/DelayControl';
import PaymentBadges from './ui/PaymentBadges';
import { TicketSlot } from './ui/Tickets';
import PhotoInspo, { IG_GRADIENT, PhotoSpotBadge } from './ui/PhotoInspo';
import TransitLeg from './ui/TransitLeg';
import { DayWeatherBadge } from './ui/WeatherPanel';
import { DaySunBadge, SunEventTag } from './ui/SunTimes';

interface FullItineraryViewProps {
  allItems: ResolvedTripItem[];
  tripStatus: TripStatus;
  effectiveNowMs: number;
  onOpenMapForSpot: (item: ResolvedTripItem, dayNum: number) => void;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
  onOpenMtr?: (mtrId: string) => void;
  onAdjustDelay: (itemId: string, deltaMin: number) => void;
  onResetDelays: (day?: number) => void;
}

export default function FullItineraryView({
  allItems,
  tripStatus,
  effectiveNowMs,
  onOpenMapForSpot,
  onToggleAlternative,
  onOpenMtr,
  onAdjustDelay,
  onResetDelays
}: FullItineraryViewProps) {
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [delayOpenId, setDelayOpenId] = useState<string | null>(null);
  const daysToShow = dayFilter === 'all' ? ITINERARY_DAYS : ITINERARY_DAYS.filter((d) => d.day === dayFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-36">
      <SectionTitle kicker="FULL ITINERARY ・ 四日手帖" title="四天三夜，一站一站慢慢走" />

      {/* 日期切換：像選擇路綫 */}
      <LayoutGroup id="day-filter">
        <div className="sticky top-[4.25rem] sm:top-[4.75rem] z-20 -mx-4 px-4 py-2 mb-6 bg-paper/85 backdrop-blur-md">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[{ day: 'all' as const, label: '全部', color: '#2B2A28', date: '4 DAYS' }, ...ITINERARY_DAYS.map((d) => ({ day: d.day, label: `DAY ${d.day}`, color: d.stationColor, date: d.date.slice(5).replace('-', '/') }))].map((opt) => {
              const active = dayFilter === opt.day;
              return (
                <motion.button
                  key={String(opt.day)}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setDayFilter(opt.day)}
                  className="relative shrink-0 h-10 pl-2 pr-3.5 text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer border border-ink/10 bg-card"
                >
                  {active && (
                    <motion.span layoutId="day-pill" className="absolute inset-0" style={{ backgroundColor: opt.color }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative w-5 h-5 rounded-full border-[3px] bg-card" style={{ borderColor: opt.color }} />
                  <span className={`relative ${active ? 'text-white' : ''}`}>{opt.label}</span>
                  <span className={`relative font-mono text-[10px] ${active ? 'text-white/75' : 'text-ink-soft'}`}>{opt.date}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.div
          key={String(dayFilter)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-14"
        >
          {daysToShow.map((dayObj) => (
            <section key={dayObj.day}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
                {/* 日系章節標題：細馬賽克色帶＋明朝體 */}
                <div className="flex items-end gap-4 pb-3 border-b border-ink/10">
                  <span className="font-serif text-5xl sm:text-6xl font-light text-ink/15 leading-none">0{dayObj.day}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] tracking-[0.3em] text-ink-soft">
                      DAY 0{dayObj.day} ・ {dayObj.dateLabel} ・ {dayObj.stationTag}
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.06em] mt-1">{dayObj.theme}</h3>
                  </div>
                </div>
                <div className="flex h-1.5 w-40 mt-0" aria-hidden="true">
                  <span className="mtr-tiles flex-1" style={{ ['--tile' as string]: dayObj.stationColor }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 px-1">
                  <p className="font-hand text-[15px] text-ink-soft">{dayObj.subtitle}</p>
                  <div className="flex items-center gap-2">
                    {allItems.some((i) => i.day === dayObj.day && (i.extraMin || i.shiftMin)) && (
                      <button onClick={() => onResetDelays(dayObj.day)} className="text-[11px] underline underline-offset-2 text-accent cursor-pointer">
                        取消當天順延
                      </button>
                    )}
                    <DaySunBadge date={dayObj.date} />
                    <DayWeatherBadge date={dayObj.date} />
                  </div>
                </div>
              </motion.div>

              {/* 垂直路綫 */}
              <ol className="relative">
                <span
                  className="absolute left-[22px] sm:left-[86px] top-3 bottom-3 w-[6px]"
                  style={{ backgroundColor: dayObj.stationColor }}
                  aria-hidden="true"
                />
                {dayObj.items.map((rawItem, idx) => {
                  const item = allItems.find((x) => x.id === rawItem.id);
                  if (!item) return null;
                  const isActive = tripStatus.currentItem?.id === item.id;
                  const isNext = !tripStatus.currentItem && tripStatus.nextItem?.id === item.id;
                  const isDone = effectiveNowMs >= item.endMs;
                  // 群組：同一區、走路幾分鐘就到的連續幾站，用同一個框包起來
                  const grp = rawItem.group;
                  const isGFirst = Boolean(grp && dayObj.items[idx - 1]?.group?.id !== grp.id);
                  const isGLast = Boolean(grp && dayObj.items[idx + 1]?.group?.id !== grp.id);
                  const groupSize = grp ? dayObj.items.filter((x) => x.group?.id === grp.id).length : 0;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ type: 'spring', stiffness: 140, damping: 20, delay: Math.min(idx * 0.04, 0.2) }}
                      className={`relative grid grid-cols-[50px_1fr] sm:grid-cols-[110px_1fr] gap-x-2 sm:gap-x-4 ${grp && !isGLast ? 'pb-0' : 'pb-6 last:pb-0'}`}
                    >
                      {/* 時間＋車站點 */}
                      <div className="relative flex sm:block justify-center">
                        <span className="hidden sm:block absolute right-[38px] top-3 font-mono text-[11px] text-right text-ink-soft leading-tight">
                          {item.timeLabel.split(' — ')[0]}
                          <br />
                          <span className="opacity-60">{item.timeLabel.split(' — ')[1]}</span>
                        </span>
                        <span className="absolute left-[13px] sm:left-[77px] top-2.5">
                          {isActive && <span className="absolute -inset-2.5 rounded-full animate-ping" style={{ backgroundColor: `${dayObj.stationColor}55` }} />}
                          <span
                            className={`relative block w-6 h-6 rounded-full border-[5px] ${isDone ? 'bg-paper-2' : 'bg-card'}`}
                            style={
                              item.photoSpot?.hot && !isActive
                                ? { border: '5px solid transparent', background: `linear-gradient(var(--color-card), var(--color-card)) padding-box, ${IG_GRADIENT} border-box` }
                                : { borderColor: isActive ? '#C8102E' : dayObj.stationColor }
                            }
                          />
                        </span>
                      </div>

                      <div
                        className={
                          grp
                            ? `min-w-0 px-2.5 sm:px-4 bg-[#2E8B8B]/[0.06] border-x-2 border-dashed border-[#2E8B8B]/45 ${isGFirst ? 'border-t-2 pt-3' : 'pt-1'} ${isGLast ? 'border-b-2 pb-3' : 'pb-5'}`
                            : 'min-w-0'
                        }
                      >
                      {grp && isGFirst && (
                        <div className="mb-3 flex items-start gap-2">
                          <span className="shrink-0 w-6 h-6 bg-[#2E8B8B] text-white font-serif text-[12px] flex items-center justify-center">梯</span>
                          <div className="min-w-0">
                            <p className="font-serif text-[15px] font-medium text-[#2E8B8B]">
                              {grp.title}
                              <span className="ml-2 font-mono text-[10px] text-ink-soft">{groupSize} 個點</span>
                            </p>
                            {grp.subtitle && <p className="text-[11px] text-ink-soft">{grp.subtitle}</p>}
                          </div>
                        </div>
                      )}
                      {/* 交通段 */}
                      <div className="mb-2.5 pl-1 pr-1 sm:pr-0">
                        <TransitLeg
                          steps={item.transit}
                          fromLabel={idx === 0 ? (dayObj.day === 1 ? '從家出發' : '從帝京酒店出發') : `從 ${allItems.find((x) => x.id === dayObj.items[idx - 1].id)?.title ?? '上一站'}`}
                          fromCoords={idx === 0 ? (dayObj.day === 1 ? undefined : HOTEL_COORDS) : allItems.find((x) => x.id === dayObj.items[idx - 1].id)?.coords}
                          toCoords={item.coords}
                          toMtrId={item.mtrId}
                          onOpenMtr={onOpenMtr}
                        />
                      </div>
                      <motion.article
                        whileHover={{ y: -3 }}
                        className={`rounded-3xl overflow-hidden border transition-shadow ${item.photoSpot?.hot ? 'photo-spot-card ' : ''}${
                          isActive
                            ? 'bg-card border-accent/40 shadow-[3px_3px_0_rgba(180,52,41,0.3)]'
                            : isDone
                            ? 'bg-card/70 border-ink/8 opacity-70'
                            : 'bg-card border-ink/8 shadow-[3px_3px_0_rgba(31,29,26,0.14)] hover:shadow-[3px_3px_0_rgba(31,29,26,0.14)]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {item.image && (
                            <div className="sm:w-44 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden bg-paper-2 group">
                              <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                                onError={(e) => {
                                  if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = 'none';
                                }}
                                className="w-full h-full object-cover sepia-[0.1] group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                          )}
                          <div className="p-4 sm:p-5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="sm:hidden font-mono text-[11px] text-ink-soft">{item.timeLabel}</span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.districtColor }} />
                                {item.district}
                              </span>
                              {isActive && <Tag className="bg-accent text-white">● 此刻</Tag>}
                              {isNext && <Tag className="bg-ink text-paper">下一站</Tag>}
                              {isDone && <Tag className="bg-ink/8 text-ink-soft">✓ 走過了</Tag>}
                              {item.isAlternativeActive && <Tag className="bg-brass text-white">備案</Tag>}
                              {item.photoSpot?.hot && <PhotoSpotBadge />}
                              <SunEventTag date={dayObj.date} startMs={item.startMs} endMs={item.endMs} />
                              {rawItem.flexible && <Tag className="border border-dashed border-ink/40 text-ink-soft">彈性景點</Tag>}
                            </div>
                            <h4 className="font-hand text-xl font-bold leading-snug">{item.title}</h4>
                            <p className="text-xs text-ink-soft mt-0.5">{item.location}</p>
                            {rawItem.flexible && <p className="mt-1.5 text-[12px] text-ink-soft border-l-2 border-dashed border-ink/30 pl-2">可跳過：{rawItem.flexible}</p>}
                            {item.isHK && <div className="mt-1.5"><PaymentBadges payment={item.payment} /></div>}
                            <div className="mt-2"><TicketSlot itemId={item.id} hint={rawItem.ticketHint} /></div>
                            {item.photoSpot && <div className="mt-2"><PhotoInspo spot={item.photoSpot} title={item.title} location={item.location} image={item.image} /></div>}

                            {rawItem.alternatives && rawItem.alternatives.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                <MiniChip active={!item.isAlternativeActive} onClick={() => onToggleAlternative(rawItem.id, null)}>
                                  原定
                                </MiniChip>
                                {rawItem.alternatives.map((alt) => (
                                  <MiniChip key={alt.id} accent active={item.isAlternativeActive && item.title === alt.title} onClick={() => onToggleAlternative(rawItem.id, alt.id)}>
                                    <IconSwap /> {alt.label}
                                  </MiniChip>
                                ))}
                              </div>
                            )}

                            <p className="text-[13px] text-ink-soft leading-relaxed mt-2.5">{item.description}</p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.isHK && (
                                <SmallBtn dark onClick={() => onOpenMapForSpot(item, dayObj.day)}>
                                  <IconPin /> 地圖
                                </SmallBtn>
                              )}
                              {item.mtrId && onOpenMtr && (
                                <SmallBtn onClick={() => onOpenMtr(item.mtrId!)}>
                                  <span className="w-2.5 h-2.5 rounded-full border-2 border-accent" /> 港鐵
                                </SmallBtn>
                              )}
                              <SmallBtn href={getGoogleMapsUrl(item)}>
                                <IconArrowUpRight /> Google
                              </SmallBtn>
                              {!isDone && !item.isFixed && (
                                <SmallBtn onClick={() => setDelayOpenId((v) => (v === item.id ? null : item.id))}>
                                  ⏱ 延誤調整
                                </SmallBtn>
                              )}
                            </div>
                            <AnimatePresence>
                              {delayOpenId === item.id && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                  <div className="mt-3 pt-3 border-t border-dashed border-ink/15">
                                    <DelayControl item={item} onAdjust={onAdjustDelay} onResetDay={onResetDelays} compact />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {(item.extraMin !== 0 || item.shiftMin !== 0 || item.overlapsFixed) && delayOpenId !== item.id && (
                              <p className={`mt-2 text-[11px] font-mono ${item.overlapsFixed ? 'text-accent font-bold' : 'text-brass'}`}>
                                {item.overlapsFixed ? '⚠ 會壓到航班時段' : `⏱ 已調整 ${item.shiftMin + item.extraMin > 0 ? '+' : ''}${item.shiftMin + item.extraMin} 分`}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.article>
                      {idx === dayObj.items.length - 1 && dayObj.day !== 4 && (
                        <div className="mt-3 pl-1">
                          <TransitLeg
                            steps={item.transitBack}
                            fromLabel="回帝京酒店"
                            fromCoords={item.coords}
                            toCoords={HOTEL_COORDS}
                            toMtrId="mong-kok-east"
                            onOpenMtr={onOpenMtr}
                          />
                        </div>
                      )}
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>;
}

function MiniChip({ active, accent, onClick, children }: { active: boolean; accent?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`h-7 px-2.5 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
        active ? (accent ? 'bg-accent text-white' : 'bg-ink text-paper') : 'bg-paper-2 text-ink'
      }`}
    >
      {children}
    </motion.button>
  );
}

function SmallBtn({ children, onClick, href, dark }: { children: React.ReactNode; onClick?: () => void; href?: string; dark?: boolean }) {
  const cls = `h-8 px-3 text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95 ${
    dark ? 'bg-ink text-paper' : 'bg-paper-2/70 hover:bg-paper-2'
  }`;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
