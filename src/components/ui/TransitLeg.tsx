import { motion } from 'motion/react';
import type { Coords, TransitMode, TransitStep } from '../../types/trip';
import { LINE_BY_ID, STATION_BY_ID, planRoute } from '../../utils/mtr';
import { getGoogleMapsDirectionsUrl } from '../../utils/geo';
import { IconArrowUpRight } from '../Icons';
import PhotoInspo from './PhotoInspo';

/** 交通方式的方形字標（仿香港街頭指示牌） */
export const MODE_META: Record<TransitMode, { glyph: string; name: string; color: string }> = {
  walk: { glyph: '步', name: '步行', color: '#8A8478' },
  mtr: { glyph: '鐵', name: '港鐵', color: '#C8102E' },
  bus: { glyph: '巴', name: '巴士', color: '#D99A00' },
  minibus: { glyph: '小', name: '小巴', color: '#00A651' },
  tram: { glyph: '叮', name: '電車', color: '#006B3F' },
  ferry: { glyph: '船', name: '渡輪', color: '#0E5A8A' },
  cable: { glyph: '纜', name: '纜車', color: '#7D499D' },
  peak: { glyph: '山', name: '山頂纜車', color: '#8B5A2B' },
  taxi: { glyph: '的', name: '的士', color: '#D7263D' },
  flight: { glyph: '機', name: '航班', color: '#2B2A28' },
  rail: { glyph: '軌', name: '鐵路', color: '#5B5650' },
  car: { glyph: '駕', name: '自駕', color: '#3D5A80' },
  shuttle: { glyph: '接', name: '接駁車', color: '#6A8EAE' },
  escalator: { glyph: '梯', name: '半山扶手電梯', color: '#2E8B8B' }
};

export function ModeGlyph({ mode, size = 'md' }: { mode: TransitMode; size?: 'sm' | 'md' }) {
  const m = MODE_META[mode];
  return (
    <span
      title={m.name}
      className={`inline-flex items-center justify-center shrink-0 font-serif font-black text-white ${size === 'sm' ? 'w-5 h-5 text-[11px]' : 'w-6 h-6 text-[13px]'}`}
      style={{ backgroundColor: m.color }}
    >
      {m.glyph}
    </span>
  );
}

export function stepMinutes(step: TransitStep): number {
  if (step.mode === 'mtr' && step.mtr) {
    const r = planRoute(step.mtr[0], step.mtr[1]);
    return (r?.totalMinutes ?? 0) + 3; // 含候車
  }
  return step.minutes ?? 0;
}

interface TransitLegProps {
  steps?: TransitStep[];
  /** 起點描述，例如「從帝京酒店出發」 */
  fromLabel?: string;
  fromCoords?: Coords;
  toCoords: Coords;
  toMtrId?: string | null;
  onOpenMtr?: (stationId: string) => void;
  dark?: boolean;
}

/**
 * 兩個行程點之間的交通段
 * - 有資料：逐段列出交通方式、路綫／班次、分鐘數，港鐵段自動帶出路綫顏色與轉乘
 * - 未填：顯示「待補」欄位，並提供 Google Maps 大眾運輸路線與港鐵查詢
 */
export default function TransitLeg({ steps, fromLabel, fromCoords, toCoords, toMtrId, onOpenMtr, dark = false }: TransitLegProps) {
  const total = steps?.reduce((n, s) => n + stepMinutes(s), 0) ?? 0;
  const muted = dark ? 'text-white/55' : 'text-ink-soft';
  const gmaps = fromCoords ? getGoogleMapsDirectionsUrl(fromCoords, toCoords, 'transit') : null;

  return (
    <div className={`text-[12px] ${dark ? 'text-paper' : 'text-ink'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
        <span className={`font-mono text-[10px] tracking-[0.2em] ${muted}`}>{fromLabel ?? '交通 TRANSIT'}</span>
        {total > 0 && <span className="font-mono text-[11px] font-bold">約 {total} 分</span>}
        <span className="ml-auto flex items-center gap-2">
          {gmaps && (
            <a href={gmaps} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-0.5 underline underline-offset-2 ${muted} hover:text-accent`}>
              Google 路線 <IconArrowUpRight className="w-2.5 h-2.5" />
            </a>
          )}
          {toMtrId && onOpenMtr && (
            <button onClick={() => onOpenMtr(toMtrId)} className={`underline underline-offset-2 cursor-pointer ${muted} hover:text-accent`}>
              港鐵怎麼搭
            </button>
          )}
        </span>
      </div>

      {steps && steps.length > 0 ? (
        <ol className="space-y-1">
          {steps.map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2"
            >
              <ModeGlyph mode={step.mode} size="sm" />
              <div className="min-w-0 flex-1 leading-5">
                {step.mode === 'mtr' && step.mtr ? <MtrStep from={step.mtr[0]} to={step.mtr[1]} dark={dark} onOpenMtr={onOpenMtr} /> : (
                  <span>
                    {step.code && <span className="font-mono font-bold mr-1">{step.code}</span>}
                    {step.label}
                  </span>
                )}
                {(step.note || step.fare) && (
                  <span className={`block text-[11px] ${muted}`}>
                    {step.fare && <span className="font-mono font-bold text-brass mr-1.5">{step.fare}</span>}
                    {step.note}
                  </span>
                )}
                {step.photoSpot && (
                  <span className="block mt-1">
                    <PhotoInspo spot={step.photoSpot} title={step.label} location={MODE_META[step.mode].name} image={step.photoImage} />
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] shrink-0 tabular-nums">{stepMinutes(step) || '—'} 分</span>
            </motion.li>
          ))}
        </ol>
      ) : (
        <div className={`flex items-center gap-2 border border-dashed px-2.5 py-2 ${dark ? 'border-white/25' : 'border-ink/25'}`}>
          <span className="flex gap-0.5 opacity-50">
            <ModeGlyph mode="walk" size="sm" />
            <ModeGlyph mode="mtr" size="sm" />
            <ModeGlyph mode="bus" size="sm" />
          </span>
          <span className={muted}>交通方式待補，之後填上搭什麼車和約幾分鐘</span>
        </div>
      )}
    </div>
  );
}

/** 站名：可點時打開港鐵路網並對準該站 */
function StationName({ id, name, color, onOpenMtr }: { id: string; name: string; color: string; onOpenMtr?: (id: string) => void }) {
  if (!onOpenMtr) return <span>{name}</span>;
  return (
    <button
      type="button"
      onClick={() => onOpenMtr(id)}
      title={`在港鐵路網查看${name}站`}
      className="cursor-pointer underline decoration-dotted underline-offset-[3px] hover:decoration-solid hover:text-accent transition-colors"
      style={{ textDecorationColor: color }}
    >
      {name}
    </button>
  );
}

function MtrStep({ from, to, dark, onOpenMtr }: { from: string; to: string; dark: boolean; onOpenMtr?: (id: string) => void }) {
  const route = planRoute(from, to);
  const A = STATION_BY_ID.get(from);
  const B = STATION_BY_ID.get(to);
  if (!route || !A || !B) return <span>港鐵 {from} → {to}</span>;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {route.legs.map((leg, i) => {
        if (leg.kind === 'walk') {
          return (
            <span key={i} className={dark ? 'text-white/60' : 'text-ink-soft'}>
              站內通道步行
            </span>
          );
        }
        const line = LINE_BY_ID.get(leg.lineId!)!;
        const s = STATION_BY_ID.get(leg.stations[0])!;
        const e = STATION_BY_ID.get(leg.stations[leg.stations.length - 1])!;
        return (
          <span key={i} className="inline-flex items-center gap-1">
            {i > 0 && <span className={dark ? 'text-white/50' : 'text-ink-soft'}>轉</span>}
            <span className="px-1.5 text-[11px] font-bold text-white" style={{ backgroundColor: line.color }}>
              {line.zh}
            </span>
            <span>
              <StationName id={s.id} name={s.zh} color={line.color} onOpenMtr={onOpenMtr} /> →{' '}
              <StationName id={e.id} name={e.zh} color={line.color} onOpenMtr={onOpenMtr} />
              <span className={`ml-1 font-mono text-[10px] ${dark ? 'text-white/50' : 'text-ink-soft'}`}>{leg.stations.length - 1} 站</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
