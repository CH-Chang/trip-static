import type { TripItem } from '../types/trip';

export type EffectiveItem = TripItem & { isAlternativeActive: boolean };

/**
 * 套用備案：一天的行程依序處理
 * - 備案有自己的交通、時間、付款、照片、提醒時，整個換掉，不再沿用原定行程的資料
 * - 備案的 nextTransit：選了這個備案後，「下一站」要怎麼去（因為出發點變了）
 * 行程頁、地圖、此刻頁都用這個函式，切換備案時三邊一致。
 */
export function applyAlternatives(items: TripItem[], altSelections: Record<string, string>): EffectiveItem[] {
  let pendingNext: TripItem['transit'] | undefined;
  return items.map((item) => {
    const altId = altSelections[item.id];
    const alt = altId ? item.alternatives?.find((a) => a.id === altId) : undefined;
    const inherited = pendingNext;
    pendingNext = alt?.nextTransit;

    if (!alt) {
      return { ...item, transit: inherited ?? item.transit, isAlternativeActive: false };
    }
    return {
      ...item,
      title: alt.title,
      location: alt.location,
      coords: alt.coords,
      googleQuery: alt.googleQuery,
      description: alt.description,
      start: alt.start ?? item.start,
      end: alt.end ?? item.end,
      timeLabel: alt.timeLabel ?? item.timeLabel,
      image: alt.image ?? item.image,
      tips: alt.tips ?? item.tips,
      mtrId: alt.mtrId !== undefined ? alt.mtrId : item.mtrId,
      payment: alt.payment ?? item.payment,
      photoSpot: alt.photoSpot ?? item.photoSpot,
      transit: alt.transit ?? inherited ?? item.transit,
      transitBack: alt.transitBack ?? item.transitBack,
      isAlternativeActive: true
    };
  });
}
