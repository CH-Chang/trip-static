import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedTripItem } from '../../types/trip';

interface DelayControlProps {
  item: ResolvedTripItem;
  onAdjust: (itemId: string, deltaMin: number) => void;
  onResetDay?: (day: number) => void;
  compact?: boolean;
  dark?: boolean;
}

/**
 * 延誤調整：在這一站多待（或提早離開），當天後續行程自動順延，
 * 遇到航班等固定時段就停下，若撞到會出現警示。
 */
export default function DelayControl({ item, onAdjust, onResetDay, compact = false, dark = false }: DelayControlProps) {
  if (item.isFixed) {
    return (
      <p className={`text-[11px] ${dark ? 'text-white/50' : 'text-ink-soft'}`}>✈ 航班時段固定，無法順延</p>
    );
  }

  const btn = `h-8 min-w-[3.25rem] px-2 border text-[12px] font-mono font-bold cursor-pointer transition-colors active:translate-y-px ${
    dark ? 'border-white/25 text-white hover:bg-card hover:text-ink' : 'border-ink/25 bg-card hover:bg-ink hover:text-paper'
  }`;

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      {!compact && (
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-hand font-bold ${dark ? 'text-white' : 'text-ink'}`}>行程延誤了？</p>
          <p className={`text-[11px] ${dark ? 'text-white/55' : 'text-ink-soft'}`}>這站多待幾分鐘，後面自動順延</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <button className={btn} onClick={() => onAdjust(item.id, -15)}>−15</button>
        <button className={btn} onClick={() => onAdjust(item.id, 15)}>+15</button>
        <button className={btn} onClick={() => onAdjust(item.id, 30)}>+30</button>
        {!compact && <button className={btn} onClick={() => onAdjust(item.id, 60)}>+60</button>}
        <AnimatePresence>
          {(item.extraMin !== 0 || item.shiftMin !== 0) && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`ml-1 font-mono text-[11px] ${dark ? 'text-[#FFB547]' : 'text-accent'}`}
            >
              {item.extraMin !== 0 && `本站 ${item.extraMin > 0 ? '+' : ''}${item.extraMin} 分`}
              {item.extraMin !== 0 && item.shiftMin !== 0 && '・'}
              {item.shiftMin !== 0 && `已順延 ${item.shiftMin > 0 ? '+' : ''}${item.shiftMin} 分`}
            </motion.span>
          )}
        </AnimatePresence>
        {onResetDay && (item.extraMin !== 0 || item.shiftMin !== 0) && (
          <button
            onClick={() => onResetDay(item.day)}
            className={`ml-auto text-[11px] underline underline-offset-2 cursor-pointer ${dark ? 'text-white/60' : 'text-ink-soft'}`}
          >
            重設當天
          </button>
        )}
      </div>
      <AnimatePresence>
        {item.overlapsFixed && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[12px] font-bold text-accent bg-accent/10 border-l-2 border-accent px-2 py-1"
          >
            ⚠ 順延後會壓到下一個航班時段，請提早移動！
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
