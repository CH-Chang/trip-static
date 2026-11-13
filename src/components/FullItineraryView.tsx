import { useState } from 'react';
import { ITINERARY_DAYS } from '../data/tripData';
import type { ResolvedTripItem, TripStatus } from '../types/trip';
import { getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconPin, IconSwap } from './Icons';

interface FullItineraryViewProps {
  allItems: ResolvedTripItem[];
  tripStatus: TripStatus;
  effectiveNowMs: number;
  onOpenMapForSpot: (item: ResolvedTripItem, dayNum: number) => void;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
}

export default function FullItineraryView({
  allItems,
  tripStatus,
  effectiveNowMs,
  onOpenMapForSpot,
  onToggleAlternative
}: FullItineraryViewProps) {
  const [dayFilter, setDayFilter] = useState<string>('all');

  const daysToShow =
    dayFilter === 'all' ? ITINERARY_DAYS : ITINERARY_DAYS.filter((d) => String(d.day) === dayFilter);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-[#1C1B19]/15">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] text-[#A63429] uppercase">
            FULL ITINERARY ・ 四日手帖
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B19] mt-1">
            完整四天三夜香港行程
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            ['all', '全部四天'],
            ['1', 'DAY 01 (11/22)'],
            ['2', 'DAY 02 (11/23)'],
            ['3', 'DAY 03 (11/24)'],
            ['4', 'DAY 04 (11/25)']
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setDayFilter(val)}
              className={`px-3 py-1.5 text-xs font-mono border transition cursor-pointer whitespace-nowrap ${
                dayFilter === val
                  ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]'
                  : 'bg-[#FAF6EE] text-[#5A554C] border-[#1C1B19]/20 hover:border-[#1C1B19]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {daysToShow.map((dayObj) => (
          <section key={dayObj.day}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5 pb-3 border-b border-[#1C1B19]/15">
              <div>
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-mono tracking-widest text-white mb-2"
                  style={{ backgroundColor: dayObj.stationColor }}
                >
                  DAY 0{dayObj.day} ・ {dayObj.dateLabel} ・ {dayObj.stationTag}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1B19]">{dayObj.theme}</h3>
              </div>
              <p className="text-xs text-[#5A554C]">{dayObj.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dayObj.items.map((rawItem, idx) => {
                const resolved = allItems.find((x) => x.id === rawItem.id);
                if (!resolved) return null;

                const isActive = tripStatus.currentItem?.id === resolved.id;
                const isNext = !tripStatus.currentItem && tripStatus.nextItem?.id === resolved.id;
                const isDone = effectiveNowMs >= resolved.endMs;

                return (
                  <article
                    key={resolved.id}
                    className={`border p-5 flex flex-col justify-between transition ${
                      isActive
                        ? 'border-[#A63429] bg-[#FFFDF8] shadow-[5px_5px_0px_rgba(166,52,41,0.18)]'
                        : isNext
                        ? 'border-[#1B4332] bg-[#FAF6EE]'
                        : isDone
                        ? 'border-[#1C1B19]/15 bg-[#FAF6EE] opacity-60'
                        : 'border-[#1C1B19]/15 bg-[#FAF6EE] hover:border-[#1C1B19]/45'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#1C1B19]/12">
                        <span className="font-mono text-xs font-semibold text-[#1C1B19]">
                          #{idx + 1} ・ {resolved.timeLabel}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono border ${
                            isActive
                              ? 'border-[#A63429] text-[#A63429] bg-[#A63429]/10 font-bold'
                              : isNext
                              ? 'border-[#1B4332] text-[#1B4332] bg-[#1B4332]/10 font-semibold'
                              : 'border-[#1C1B19]/15 text-[#5A554C]'
                          }`}
                        >
                          {isActive ? '進行中' : isNext ? '下一站' : isDone ? '已走過' : '待前往'}
                        </span>
                      </div>

                      {resolved.image && (
                        <div className="mb-3 overflow-hidden border border-[#1C1B19]/15 bg-[#EFE8DA] aspect-[16/9] group">
                          <img
                            src={resolved.image}
                            alt={resolved.title}
                            loading="lazy"
                            onError={(e) => {
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.style.display = 'none';
                              }
                            }}
                            className="w-full h-full object-cover sepia-[0.08] contrast-[1.03] group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 inline-block" style={{ backgroundColor: resolved.districtColor }} />
                        <span className="text-[11px] font-mono text-[#5A554C]">
                          {resolved.district} ・ {resolved.location}
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-[#1C1B19] mb-2 leading-snug">
                        {resolved.title}
                      </h4>

                      {rawItem.alternatives && rawItem.alternatives.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          <button
                            onClick={() => onToggleAlternative(rawItem.id, null)}
                            className={`px-2 py-0.5 text-[10px] font-mono border cursor-pointer ${
                              !resolved.isAlternativeActive
                                ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]'
                                : 'bg-[#F4EFE6] text-[#5A554C] border-[#1C1B19]/20'
                            }`}
                          >
                            原定
                          </button>
                          {rawItem.alternatives.map((alt) => (
                            <button
                              key={alt.id}
                              onClick={() => onToggleAlternative(rawItem.id, alt.id)}
                              className={`px-2 py-0.5 text-[10px] font-mono border cursor-pointer inline-flex items-center gap-1 ${
                                resolved.isAlternativeActive
                                  ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                                  : 'bg-[#F4EFE6] text-[#A63429] border-[#A63429]/40'
                              }`}
                            >
                              <IconSwap />
                              <span>{alt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-[#4A463F] leading-relaxed mb-3">{resolved.description}</p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-[#1C1B19]/15 flex items-center gap-2">
                      {resolved.isHK && (
                        <button
                          onClick={() => onOpenMapForSpot(resolved, dayObj.day)}
                          className="flex-1 py-2 px-2.5 text-[11px] font-mono bg-[#1B4332] text-[#F4EFE6] hover:bg-[#143326] transition cursor-pointer inline-flex items-center justify-center gap-1"
                        >
                          <IconPin />
                          <span>地圖方位</span>
                        </button>
                      )}
                      <a
                        href={getGoogleMapsUrl(resolved)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-2.5 text-[11px] font-mono bg-[#F4EFE6] text-[#1C1B19] border border-[#1C1B19]/25 hover:bg-[#1C1B19] hover:text-[#F4EFE6] transition inline-flex items-center justify-center gap-1"
                      >
                        <IconArrowUpRight />
                        <span>Google Maps</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
