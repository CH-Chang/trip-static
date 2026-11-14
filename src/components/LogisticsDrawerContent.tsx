import { AnimatePresence, motion } from 'motion/react';
import { PACKING_CHECKLIST } from '../data/tripData';
import { Seal } from './ui/MtrKit';
import { TicketWallet } from './ui/Tickets';

interface LogisticsDrawerContentProps {
  checklistState: Record<string, boolean>;
  onToggleChecklist: (id: string) => void;
}

const FLIGHTS = [
  { dir: '去程 OUTBOUND', date: '11.22 SUN', from: 'TPE', to: 'HKG', fromZh: '桃園 T1', toZh: '香港機場', no: 'HB703', dur: '2h05m', dep: '11:35', arr: '13:40', color: '#1B4332' },
  { dir: '回程 INBOUND', date: '11.25 WED', from: 'HKG', to: 'TPE', fromZh: '香港 T2', toZh: '桃園機場', no: 'UO116', dur: '1h45m', dep: '18:40', arr: '20:25', color: '#C8102E' }
];

export default function LogisticsDrawerContent({ checklistState, onToggleChecklist }: LogisticsDrawerContentProps) {
  const checkedCount = PACKING_CHECKLIST.filter((c) => checklistState[c.id]).length;
  const pct = checkedCount / PACKING_CHECKLIST.length;
  const groups = [...new Set(PACKING_CHECKLIST.map((c) => c.group))];

  return (
    <div className="space-y-8">
      <TicketWallet />

      <section className="space-y-3">
        <h3 className="font-mono text-[11px] tracking-[0.3em] text-accent">BOARDING PASSES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FLIGHTS.map((f, i) => (
            <motion.div
              key={f.no}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-3xl bg-card border border-ink/8 overflow-hidden"
            >
              <div className="h-1.5" style={{ backgroundColor: f.color }} />
              <div className="p-5">
                <div className="flex justify-between text-[11px] font-mono mb-3">
                  <span className="font-bold" style={{ color: f.color }}>{f.dir}</span>
                  <span className="text-ink-soft">{f.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-bold">{f.from}</span>
                  <span className="font-mono text-[11px] text-ink-soft">{f.no} ・ {f.dur}</span>
                  <span className="font-mono text-3xl font-bold">{f.to}</span>
                </div>
                <div className="flex justify-between text-[11px] text-ink-soft">
                  <span>{f.fromZh}</span>
                  <span>{f.toZh}</span>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-dashed border-ink/10 flex justify-between font-mono text-sm">
                  <span>DEP <strong>{f.dep}</strong></span>
                  <span style={{ color: f.color }}>ARR <strong>{f.arr}</strong></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="relative rounded-3xl p-5 overflow-hidden text-[#3A2A08]"
          style={{ background: 'linear-gradient(135deg,#F7D58A 0%,#E9B44C 50%,#C98F2E 100%)' }}
        >
          <div className="absolute -right-10 -bottom-14 w-44 h-44 rounded-full border-[14px] border-white/20" />
          <p className="font-mono text-[10px] tracking-[0.3em]">RESIDENCE ・ 3 NIGHTS</p>
          <h4 className="font-hand text-2xl font-bold mt-1">帝京酒店 Royal Plaza Hotel</h4>
          <p className="text-xs mt-1 text-[#3A2A08]/80">九龍旺角太子道西 193 號・旺角東站 D 出口直通 MOKO</p>
          <div className="mt-4 flex justify-between font-mono text-xs font-bold">
            <span>CHECK-IN 11/22 15:00</span>
            <span>CHECK-OUT 11/25 11:00</span>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.3em] text-accent">PACKING CHECKLIST</h3>
            <p className="font-hand text-xl font-bold">出門前，再確認一次</p>
          </div>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#2B2A28" strokeOpacity="0.08" strokeWidth="4" />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#1B4332"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: pct }}
                transition={{ type: 'spring', stiffness: 80, damping: 16 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold">
              {checkedCount}/{PACKING_CHECKLIST.length}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <p className="font-mono text-[10px] tracking-widest text-brass mb-2">{g}</p>
              <div className="space-y-2">
                {PACKING_CHECKLIST.filter((c) => c.group === g).map((item) => {
                  const checked = Boolean(checklistState[item.id]);
                  return (
                    <motion.button
                      key={item.id}
                      layout
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onToggleChecklist(item.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left cursor-pointer transition-colors border ${
                        checked ? 'bg-jade/6 border-jade/15' : 'bg-card border-ink/8 hover:border-ink/25'
                      }`}
                    >
                      <span
                        className={`relative w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                          checked ? 'border-accent' : 'border-ink/25'
                        }`}
                      >
                        <AnimatePresence>
                          {checked && (
                            <motion.span
                              initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
                              animate={{ scale: 1, opacity: 1, rotate: -8 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                              className="font-hand text-sm font-bold text-accent"
                            >
                              ✓
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className={`text-sm transition-colors ${checked ? 'line-through text-ink-soft/60' : 'text-ink'}`}>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {checkedCount === PACKING_CHECKLIST.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center justify-center gap-3 text-accent"
            >
              <Seal text="齊" className="w-12 h-12 text-xl" />
              <span className="font-hand text-lg font-bold">行李備妥，出發吧！</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
