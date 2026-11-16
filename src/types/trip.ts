export type Coords = [number, number];

/** 外部連結（例如即時空櫃查詢），顯示成按鈕、另開新分頁 */
export interface ItemLink {
  label: string;
  url: string;
  /** 按鈕下方的小字說明 */
  note?: string;
}

export interface AlternativeSpot {
  id: string;
  label: string;
  title: string;
  location: string;
  coords: Coords;
  googleQuery: string;
  description: string;
  /** 以下皆為選填：有填就取代原定行程的資料 */
  start?: string;
  end?: string;
  timeLabel?: string;
  image?: string;
  tips?: string;
  mtrId?: string | null;
  payment?: PaymentInfo;
  photoSpot?: PhotoSpot;
  /** 從上一站到這個備案怎麼走 */
  transit?: TransitStep[];
  /** 當天最後一站的備案：回酒店怎麼走 */
  transitBack?: TransitStep[];
  /** 選了這個備案後，下一站的交通（出發點改變了） */
  nextTransit?: TransitStep[];
  links?: ItemLink[];
}

/** 交通方式 */
export type TransitMode = 'walk' | 'mtr' | 'bus' | 'minibus' | 'tram' | 'ferry' | 'cable' | 'peak' | 'taxi' | 'flight' | 'rail' | 'car' | 'shuttle' | 'escalator';

export interface TransitStep {
  mode: TransitMode;
  /** 說明，例如「城巴 A21 機場 → 旺角」 */
  label: string;
  /** 約略分鐘數 */
  minutes?: number;
  /** 港鐵起訖站 id（mode = 'mtr' 時填，路綫與站數自動計算） */
  mtr?: [string, string];
  /** 巴士／小巴路線號、航班號 */
  code?: string;
  note?: string;
  /** 車費，例如 "HK$5.9（八達通）" */
  fare?: string;
  /** 交通本身也是拍照點（例如半山扶手電梯） */
  photoSpot?: PhotoSpot;
  photoImage?: string;
}

/** 拍照景點資訊 */
export interface PhotoSpot {
  /** IG 標籤，不含 # 號，例如 旺角天橋 */
  hashtags: string[];
  /** 搜尋關鍵字（小紅書、Google 圖片用） */
  keyword: string;
  /** 拍攝建議，例如時段與角度 */
  tip?: string;
  /** 經典熱門打卡點：顯示 IG 漸層外框與「熱門打卡點」標籤 */
  hot?: boolean;
}

/** 店家付款方式 */
export type PaymentMethod = 'cash' | 'octopus' | 'credit' | 'alipay' | 'wechat' | 'payme' | 'applepay';

export interface PaymentInfo {
  methods: PaymentMethod[];
  /** 例如「僅收現金」「信用卡滿 HK$100」「資料查證於 2026-11」 */
  note?: string;
}

export interface TripItem {
  id: string;
  start: string;
  end: string;
  timeLabel: string;
  title: string;
  location: string;
  district: string;
  districtColor: string;
  coords: Coords;
  isHK: boolean;
  mtrId: string | null;
  image?: string;
  googleQuery: string;
  description: string;
  tips: string;
  alternatives?: AlternativeSpot[];
  /** 外部連結，例如即時空櫃查詢 */
  links?: ItemLink[];
  /** 店家付款方式 */
  payment?: PaymentInfo;
  /** 拍照景點：顯示「看別人怎麼拍」，連到 IG 標籤頁、小紅書與 Google 圖片 */
  photoSpot?: PhotoSpot;
  /** 彈性景點：前面延誤時可以直接跳過，值為一句說明 */
  flexible?: string;
  /** 群組：同一區、走路幾分鐘就到的幾個點，會被框在一起顯示 */
  group?: { id: string; title: string; subtitle?: string };
  /** 需要票券（例如「山頂纜車票」），會提示上傳 */
  ticketHint?: string;
  /** 從上一站到這裡怎麼走（行程未定，先留空） */
  transit?: TransitStep[];
  /** 當天最後一站：回酒店怎麼走 */
  transitBack?: TransitStep[];
}

export interface ResolvedTripItem extends TripItem {
  day: number;
  dateLabel: string;
  startMs: number;
  endMs: number;
  isAlternativeActive: boolean;
  /** 因前面景點延誤而順延的分鐘數 */
  shiftMin: number;
  /** 此景點自身多待的分鐘數 */
  extraMin: number;
  /** 航班等不可移動的時段 */
  isFixed: boolean;
  /** 順延後撞到下一個固定時段（例如登機） */
  overlapsFixed: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  dateLabel: string;
  chineseDate: string;
  theme: string;
  subtitle: string;
  stationTag: string;
  stationColor: string;
  items: TripItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  group: string;
}

export interface TripStatus {
  phase: 'before' | 'during' | 'after';
  progressPct: number;
  currentItem: ResolvedTripItem | null;
  nextItem: ResolvedTripItem | null;
  completedCount: number;
  remainingMs: number;
}
