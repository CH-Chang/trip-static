export type Coords = [number, number];

export interface AlternativeSpot {
  id: string;
  label: string;
  title: string;
  location: string;
  coords: Coords;
  googleQuery: string;
  description: string;
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
}

export interface ResolvedTripItem extends TripItem {
  day: number;
  dateLabel: string;
  startMs: number;
  endMs: number;
  isAlternativeActive: boolean;
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

export interface MtrLine {
  id: string;
  name: string;
  color: string;
  points: [number, number][];
}

export interface MtrStation {
  id: string;
  name: string;
  x: number;
  y: number;
  coords: Coords;
  lines: string[];
  color: string;
  isBase?: boolean;
  fromHotel: string;
  nearby: string;
}

export interface TripStatus {
  phase: 'before' | 'during' | 'after';
  progressPct: number;
  currentItem: ResolvedTripItem | null;
  nextItem: ResolvedTripItem | null;
  completedCount: number;
  remainingMs: number;
}
