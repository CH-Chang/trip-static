import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';

/** 港鐵各綫代表色（裝飾用） */
export const LINE_PALETTE = ['#ED1D24', '#00AB4E', '#007DC5', '#923011', '#53B7E8', '#7D499D', '#F7943E', '#00888A', '#BAC429', '#F173AC'];

/** 頂部彩色路綫條：像港鐵路綫圖的圖例 */
export function LineRibbon({ className = 'h-1' }: { className?: string }) {
  return (
    <div className={`flex w-full ${className}`} aria-hidden="true">
      {LINE_PALETTE.map((c) => (
        <span key={c} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

/** 月台牆身馬賽克磚 */
export function TileWall({ color, className = '', children, style }: { color: string; className?: string; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`mtr-tiles ${className}`} style={{ ['--tile' as string]: color, ...style }}>
      {children}
    </div>
  );
}

/**
 * 站名牌：仿港鐵月台牆的站名標示（中文大字＋英文小字、磚牆底）
 */
export function StationSign({
  zh,
  en,
  color,
  size = 'md',
  kicker,
  className = ''
}: {
  zh: string;
  en: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  kicker?: string;
  className?: string;
}) {
  const zhSize = size === 'lg' ? 'text-4xl sm:text-5xl' : size === 'md' ? 'text-2xl sm:text-3xl' : 'text-lg';
  const pad = size === 'lg' ? 'px-6 py-5' : size === 'md' ? 'px-5 py-3.5' : 'px-3.5 py-2';
  return (
    <TileWall color={color} className={`relative rounded-2xl overflow-hidden shadow-[inset_0_-6px_0_rgba(0,0,0,0.12)] ${className}`}>
      <div className={`relative ${pad} flex items-end justify-between gap-3`}>
        <div className="min-w-0">
          {kicker && (
            <span className="inline-block mb-1.5 px-2 py-0.5 bg-card/90 text-[10px] font-mono tracking-[0.2em] text-ink">
              {kicker}
            </span>
          )}
          <p
            className={`font-serif font-black text-white leading-none tracking-[0.12em] ${zhSize}`}
            style={{ textShadow: '0 2px 0 rgba(0,0,0,0.18)' }}
          >
            {zh}
          </p>
          <p className="mt-1.5 font-sans text-[11px] sm:text-xs font-semibold tracking-[0.14em] text-white/95 uppercase truncate">{en}</p>
        </div>
      </div>
    </TileWall>
  );
}

/** 月台黃線＋「請小心月台空隙」跑馬燈 */
export function MindTheGap({ text, className = '' }: { text?: string; className?: string }) {
  const msg = text ?? '請小心月台空隙　Please mind the gap　・　列車即將到站　Train arriving　・　下一站　香江拾光　Next station　Hong Kong Memories　・　';
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <div className="platform-edge h-2" />
      <div className="bg-ink py-1.5 overflow-hidden">
        <div className="marquee-track led text-[11px]">
          <span className="pr-8">{msg}</span>
          <span className="pr-8">{msg}</span>
        </div>
      </div>
    </div>
  );
}

/** 區段標題：小字編號＋文青手寫標題 */
export function SectionTitle({ index, kicker, title, aside }: { index?: string; kicker: string; title: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div className="flex items-end gap-3">
        {index && <span className="font-mono text-4xl sm:text-5xl font-bold text-ink/10 leading-none -mb-1">{index}</span>}
        <div>
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-accent uppercase">{kicker}</span>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-ink leading-tight">{title}</h2>
        </div>
      </div>
      {aside}
    </div>
  );
}

/**
 * 路綫進度條：把一串地點畫成港鐵路綫，列車停在目前位置
 * progress: 0 ~ (stops.length - 1) 的浮點數
 */
export function LineProgress({
  stops,
  progress,
  color = '#ED1D24',
  dark = false,
  onStopClick
}: {
  stops: Array<{ id: string; label: string; sub?: string }>;
  progress: number;
  color?: string;
  dark?: boolean;
  onStopClick?: (id: string) => void;
}) {
  const n = Math.max(1, stops.length - 1);
  const pct = Math.max(0, Math.min(1, progress / n)) * 100;
  return (
    <div className="relative pt-2 pb-1">
      <div className="relative mx-3 h-2.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(31,29,26,0.1)' }}>
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
        {/* 列車 */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          initial={{ left: 0 }}
          animate={{ left: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        >
          <motion.span
            className="block w-6 h-4 rounded-sm border-2 shadow-[3px_3px_0_rgba(31,29,26,0.14)]"
            style={{ backgroundColor: dark ? '#FFB547' : '#2B2A28', borderColor: dark ? '#2B2A28' : '#FFFFFF' }}
            animate={{ y: [0, -1.5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </motion.div>
        {stops.map((s, i) => {
          const left = (i / n) * 100;
          const passed = i <= progress + 0.001;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStopClick?.(s.id)}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[3px] cursor-pointer transition-transform hover:scale-125"
              style={{
                left: `${left}%`,
                backgroundColor: dark ? '#2B2A28' : '#FFFFFF',
                borderColor: passed ? color : dark ? 'rgba(255,255,255,0.35)' : 'rgba(31,29,26,0.25)'
              }}
              aria-label={s.label}
            />
          );
        })}
      </div>
      <div className="relative mx-3 h-10 mt-2">
        {stops.map((s, i) => {
          const left = (i / n) * 100;
          const align = i === 0 ? 'translate-x-0 text-left' : i === stops.length - 1 ? '-translate-x-full text-right' : '-translate-x-1/2 text-center';
          return (
            <div key={s.id} className={`absolute top-0 ${align} max-w-[7rem] hidden sm:block`} style={{ left: `${left}%` }}>
              <p className={`text-[11px] font-semibold truncate ${dark ? 'text-paper' : 'text-ink'}`}>{s.label}</p>
              {s.sub && <p className={`text-[10px] font-mono ${dark ? 'text-white/50' : 'text-ink-soft'}`}>{s.sub}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 翻牌式數字（出發看板） */
export function FlipDigits({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {value.split('').map((ch, i) => (
          <span key={i} className="relative w-9 h-12 sm:w-11 sm:h-14 rounded-lg bg-ink overflow-hidden shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)]" style={{ perspective: 200 }}>
            <motion.span
              key={ch}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold led"
              style={{ transformOrigin: 'top center' }}
            >
              {ch}
            </motion.span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
          </span>
        ))}
      </div>
      <span className="font-mono text-[10px] tracking-[0.25em] text-white/55">{label}</span>
    </div>
  );
}

/** 圓形印章（文青落款） */
export function Seal({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-accent text-accent font-hand font-bold leading-none ${className}`}
      style={{ transform: 'rotate(-8deg)' }}
    >
      {text}
    </span>
  );
}
