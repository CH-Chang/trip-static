import { HOTEL_COORDS } from '../data/tripData';
import type { ResolvedTripItem, TripStatus } from '../types/trip';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconClock, IconPin, IconSwap, IconTransit } from './Icons';

type AppTab = 'now' | 'map' | 'itinerary';

interface NowStatusViewProps {
  tripStatus: TripStatus;
  effectiveNow: Date;
  timeMode: 'live' | 'sim';
  onOpenMapForSpot: (item: ResolvedTripItem, dayNum: number) => void;
  onOpenTab: (tab: AppTab) => void;
  onOpenTimeMachine: () => void;
  onOpenMtrDrawer: (mtrId: string) => void;
  onToggleAlternative: (itemId: string, altId: string | null) => void;
  altSelections: Record<string, string>;
}

function getCountdownParts(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return { days: pad(days), hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}

export default function NowStatusView({
  tripStatus,
  effectiveNow,
  timeMode,
  onOpenMapForSpot,
  onOpenTab,
  onOpenTimeMachine,
  onOpenMtrDrawer,
  onToggleAlternative,
  altSelections
}: NowStatusViewProps) {
  const cd = getCountdownParts(tripStatus.remainingMs);

  if (tripStatus.phase === 'before') {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-28 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#1C1B19]/15 pb-10">
          <div className="lg:col-span-7 flex items-start gap-5 sm:gap-7">
            <div
              className="hidden sm:block text-xs tracking-[0.45em] text-[#5A554C] font-serif pt-1 border-r border-[#1C1B19]/20 pr-4 select-none"
              style={{ writingMode: 'vertical-rl' }}
            >
              啟期將至・二零二六年十一月廿二日
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#1B4332]/40 bg-[#1B4332]/10 text-[#1B4332] font-mono text-[11px] tracking-widest mb-4">
                <span>PRE-DEPARTURE ・ 尚未出發</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#1C1B19] leading-[1.18] tracking-tight mb-4">
                把維港的晚風與九龍的燈火，留給幾日後的我們。
              </h1>

              <p className="text-sm sm:text-base text-[#4A463F] leading-relaxed mb-6 max-w-xl">
                行囊正在等待封箱。從桃園第一航廈起飛，四天三夜寄居旺角東「帝京酒店」，穿過百年叮叮車的鈴聲與大嶼山的霧氣，走進這座不曾褪色的電影城市。
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onOpenTab('map')}
                  className="px-4 py-2 bg-[#1B4332] text-[#F4EFE6] hover:bg-[#143326] transition font-mono text-xs tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                >
                  <IconPin />
                  <span>先逛香港實景地圖</span>
                </button>
                <button
                  onClick={onOpenTimeMachine}
                  className="px-4 py-2 border border-[#A63429] text-[#A63429] bg-[#FAF6EE] hover:bg-[#A63429] hover:text-[#F4EFE6] transition font-mono text-xs tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                >
                  <IconClock />
                  <span>切換模擬時光機預覽旅途</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1B4332] text-[#F4EFE6] p-6 sm:p-8 border border-[#1B4332] shadow-[8px_8px_0px_rgba(28,27,25,0.12)]">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#F4EFE6]/20">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[#D4C5A9]">COUNTDOWN TO TAKEOFF</span>
              <span className="font-mono text-[11px] text-[#D4C5A9]">11.22 09:00 報到</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              {[
                [cd.days, 'DAYS'],
                [cd.hours, 'HRS'],
                [cd.mins, 'MIN'],
                [cd.secs, 'SEC']
              ].map(([val, unit]) => (
                <div key={unit} className="bg-[#F4EFE6]/10 border border-[#F4EFE6]/15 py-3 px-1">
                  <span className="block font-mono text-2xl sm:text-3xl font-bold text-white">{val}</span>
                  <span className="block font-mono text-[10px] tracking-widest text-[#D4C5A9] mt-1">{unit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F4EFE6]/20 flex items-center justify-between text-xs">
              <span className="text-[#D4C5A9] font-mono">FIRST STOP</span>
              <span className="font-semibold text-white">桃園機場 T1 ・ HB703 報到</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.25em] text-[#A63429] uppercase">
              FLIGHT TICKETS &amp; RESIDENCE
            </span>
            <button
              onClick={() => onOpenTab('itinerary')}
              className="font-mono text-xs text-[#1B4332] hover:underline cursor-pointer"
            >
              查看四日完整行程 →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="ticket-notch bg-[#FAF6EE] border border-[#1C1B19]/20 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-dashed border-[#1C1B19]/20">
                  <span className="font-mono text-xs font-bold text-[#1B4332]">OUTBOUND ・ 去程</span>
                  <span className="font-mono text-xs text-[#5A554C]">2026.11.22 SUN</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-3xl font-bold text-[#1C1B19]">TPE</span>
                  <span className="font-mono text-xs text-[#5A554C]">── HB703 ──</span>
                  <span className="font-mono text-3xl font-bold text-[#1C1B19]">HKG</span>
                </div>
                <div className="flex justify-between text-xs text-[#5A554C] mb-5">
                  <span>桃園機場 T1</span>
                  <span>大灣區航空 ・ 2h 05m</span>
                  <span>香港機場</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1C1B19]/15 flex justify-between font-mono">
                <div>
                  <span className="block text-[10px] text-[#5A554C]">DEPARTURE</span>
                  <span className="text-lg font-bold text-[#1C1B19]">11:35</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-[#5A554C]">ARRIVAL</span>
                  <span className="text-lg font-bold text-[#1B4332]">13:40</span>
                </div>
              </div>
            </div>

            <div className="ticket-notch bg-[#FAF6EE] border border-[#1C1B19]/20 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-dashed border-[#1C1B19]/20">
                  <span className="font-mono text-xs font-bold text-[#A63429]">INBOUND ・ 回程</span>
                  <span className="font-mono text-xs text-[#5A554C]">2026.11.25 WED</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-3xl font-bold text-[#1C1B19]">HKG</span>
                  <span className="font-mono text-xs text-[#5A554C]">── UO116 ──</span>
                  <span className="font-mono text-3xl font-bold text-[#1C1B19]">TPE</span>
                </div>
                <div className="flex justify-between text-xs text-[#5A554C] mb-5">
                  <span>香港機場 T2</span>
                  <span>香港快運 ・ 1h 45m</span>
                  <span>桃園機場</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1C1B19]/15 flex justify-between font-mono">
                <div>
                  <span className="block text-[10px] text-[#5A554C]">DEPARTURE</span>
                  <span className="text-lg font-bold text-[#1C1B19]">18:40</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-[#5A554C]">ARRIVAL</span>
                  <span className="text-lg font-bold text-[#A63429]">20:25</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF6EE] border border-[#1C1B19]/25 p-6 flex flex-col justify-between shadow-[5px_5px_0px_rgba(27,67,50,0.12)]">
              <div>
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#1C1B19]/15">
                  <span className="font-mono text-xs font-bold text-[#B8863B]">HOTEL ・ 連住三晚</span>
                  <span className="font-mono text-xs text-[#5A554C]">旺角東站 D 出口</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1C1B19] mb-1">帝京酒店 Royal Plaza</h3>
                <p className="text-xs text-[#5A554C] mb-3">九龍旺角太子道西 193 號（直通 MOKO 新世紀廣場）</p>
                <p className="text-xs text-[#4A463F] leading-relaxed">
                  下樓即是東鐵線與商場，步行 7 分鐘可達旺角 / 太子站，是這趟四日漫遊最穩妥的九龍基地。
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-dashed border-[#1C1B19]/20 flex justify-between font-mono text-xs text-[#1B4332] font-semibold">
                <span>IN 11/22 15:00</span>
                <span>OUT 11/25 11:00</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (tripStatus.phase === 'after') {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-28 text-center">
        <span className="inline-block px-3 py-1 border border-[#B8863B] text-[#B8863B] font-mono text-xs tracking-widest mb-5">
          JOURNEY COMPLETED ・ 旅程圓滿
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#1C1B19] leading-tight mb-5">
          底片已滿，九龍的夜色收進行囊。
        </h1>
        <p className="text-base text-[#4A463F] leading-relaxed max-w-xl mx-auto mb-8">
          UO116 已於 11 月 25 日平安返抵桃園。感謝這四天三夜在叮叮車、天星小輪與大嶼山海風裡寫下的每一頁記憶。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onOpenTab('itinerary')}
            className="px-5 py-2.5 bg-[#1B4332] text-[#F4EFE6] font-mono text-xs cursor-pointer"
          >
            回顧四日完整行程
          </button>
          <button
            onClick={onOpenTimeMachine}
            className="px-5 py-2.5 border border-[#1C1B19]/25 bg-[#FAF6EE] font-mono text-xs cursor-pointer"
          >
            開啟時光機重溫時刻
          </button>
        </div>
      </div>
    );
  }

  const activeItem = tripStatus.currentItem;
  const nextItem = tripStatus.nextItem;
  const focusItem = activeItem || nextItem;
  const bearingInfo = focusItem?.isHK ? getBearingAndDistance(HOTEL_COORDS, focusItem.coords) : null;
  const hasAlt = Boolean(focusItem?.alternatives && focusItem.alternatives.length > 0);
  const isAltActive = Boolean(focusItem && altSelections[focusItem.id]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-28 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1B19]/15 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-[#A63429] text-[#F4EFE6] font-mono text-xs tracking-widest font-bold">
            {activeItem ? `DAY 0${activeItem.day} ・ 此刻進行中` : `DAY 0${nextItem?.day} ・ 轉場時間`}
          </span>
          <span className="font-mono text-xs text-[#5A554C]">
            {timeMode === 'sim' ? '模擬時刻：' : '現在時間：'}
            {effectiveNow.toLocaleTimeString('zh-TW', { hour12: false })}
          </span>
        </div>

        <span className="font-mono text-xs font-bold text-[#1B4332]">
          {activeItem ? `本時段剩餘 ${cd.hours}:${cd.mins}:${cd.secs}` : `距下一站 ${cd.hours}:${cd.mins}:${cd.secs}`}
        </span>
      </div>

      {focusItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAF6EE] border border-[#1C1B19]/25 p-5 sm:p-7 shadow-[7px_7px_0px_rgba(27,67,50,0.12)]">
          {focusItem.image && (
            <div className="lg:col-span-6 overflow-hidden border border-[#1C1B19]/15 bg-[#EFE8DA] aspect-[16/10]">
              <img
                src={focusItem.image}
                alt={focusItem.title}
                onError={(e) => {
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.style.display = 'none';
                  }
                }}
                className="w-full h-full object-cover sepia-[0.08] contrast-[1.03]"
              />
            </div>
          )}

          <div className={`${focusItem.image ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col justify-between gap-4`}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs text-[#5A554C]">
                  {focusItem.district} ・ {focusItem.timeLabel}
                </span>
                {bearingInfo && Number(bearingInfo.distanceKm) > 0 && (
                  <span className="font-mono text-xs font-bold text-[#A63429]">
                    距帝京 {bearingInfo.dirLabel} {bearingInfo.distanceKm} km
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#1C1B19] leading-tight mb-2">
                {activeItem ? focusItem.title : `準備前往：${focusItem.title}`}
              </h1>

              <p className="font-mono text-xs text-[#1B4332] mb-4 inline-flex items-center gap-1">
                <IconPin />
                <span>{focusItem.location}</span>
              </p>

              {hasAlt && focusItem.alternatives && (
                <div className="mb-4 p-3 bg-[#EFE8DA]/80 border border-[#1C1B19]/15">
                  <span className="block font-mono text-[10px] text-[#5A554C] mb-1.5">
                    現場人太多或下雨？即時切換備案：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => onToggleAlternative(focusItem.id, null)}
                      className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer ${
                        !isAltActive
                          ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]'
                          : 'bg-[#FAF6EE] text-[#1C1B19] border-[#1C1B19]/20'
                      }`}
                    >
                      原定行程
                    </button>
                    {focusItem.alternatives.map((alt) => (
                      <button
                        key={alt.id}
                        onClick={() => onToggleAlternative(focusItem.id, alt.id)}
                        className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer inline-flex items-center gap-1 ${
                          isAltActive
                            ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                            : 'bg-[#FAF6EE] text-[#A63429] border-[#A63429]/40'
                        }`}
                      >
                        <IconSwap />
                        <span>{alt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-[#4A463F] leading-relaxed mb-3">{focusItem.description}</p>

              <div className="p-3 bg-[#F4EFE6] border-l-2 border-[#B8863B] text-xs text-[#5A554C]">
                <strong className="text-[#B8863B]">手帖筆記：</strong>
                {focusItem.tips}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-dashed border-[#1C1B19]/20">
              {focusItem.isHK && (
                <button
                  onClick={() => onOpenMapForSpot(focusItem, focusItem.day)}
                  className="px-4 py-2 bg-[#1B4332] text-[#F4EFE6] hover:bg-[#143326] transition font-mono text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <IconPin />
                  <span>在地圖查看方位</span>
                </button>
              )}
              <a
                href={getGoogleMapsUrl(focusItem)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[#1C1B19]/25 bg-[#F4EFE6] text-[#1C1B19] hover:bg-[#1C1B19] hover:text-[#F4EFE6] transition font-mono text-xs inline-flex items-center gap-1.5"
              >
                <IconArrowUpRight />
                <span>Google 地點</span>
              </a>
              {focusItem.isHK && (
                <a
                  href={getGoogleMapsDirectionsUrl(HOTEL_COORDS, focusItem.coords, 'transit')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#A63429] text-[#F4EFE6] hover:bg-[#8A2920] transition font-mono text-xs inline-flex items-center gap-1.5"
                >
                  <IconTransit />
                  <span>帝京出發導航</span>
                </a>
              )}
              {focusItem.mtrId && (
                <button
                  onClick={() => onOpenMtrDrawer(focusItem.mtrId!)}
                  className="px-3 py-2 font-mono text-xs text-[#1B4332] hover:underline cursor-pointer"
                >
                  查港鐵轉乘 →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {nextItem && (
        <div className="p-4 bg-[#EFE8DA] border border-[#1C1B19]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#A63429] block mb-0.5">
              UP NEXT ・ 下一站預告
            </span>
            <p className="font-serif text-base font-bold text-[#1C1B19]">
              {nextItem.timeLabel} — {nextItem.title}
            </p>
          </div>
          <button
            onClick={() => onOpenTab('itinerary')}
            className="font-mono text-xs text-[#1B4332] hover:underline cursor-pointer self-start sm:self-auto"
          >
            檢視完整四日行程 →
          </button>
        </div>
      )}
    </div>
  );
}
