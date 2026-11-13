import { PACKING_CHECKLIST } from '../data/tripData';

interface LogisticsDrawerContentProps {
  checklistState: Record<string, boolean>;
  onToggleChecklist: (id: string) => void;
}

export default function LogisticsDrawerContent({
  checklistState,
  onToggleChecklist
}: LogisticsDrawerContentProps) {
  const checkedCount = PACKING_CHECKLIST.filter((c) => checklistState[c.id]).length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-mono text-xs tracking-widest text-[#A63429] uppercase">BOARDING PASSES</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F4EFE6] border border-[#1C1B19]/20 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-dashed border-[#1C1B19]/20">
                <span className="font-mono text-xs font-bold text-[#1B4332]">OUTBOUND ・ 去程</span>
                <span className="font-mono text-xs text-[#5A554C]">11.22 SUN</span>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-mono text-2xl font-bold">TPE</span>
                <span className="font-mono text-xs text-[#5A554C]">── HB703 ──</span>
                <span className="font-mono text-2xl font-bold">HKG</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#5A554C] mb-4">
                <span>桃園 T1</span>
                <span>2h 05m</span>
                <span>香港機場</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1C1B19]/15 flex justify-between font-mono text-sm">
              <span>DEP <strong>11:35</strong></span>
              <span className="text-[#1B4332]">ARR <strong>13:40</strong></span>
            </div>
          </div>

          <div className="bg-[#F4EFE6] border border-[#1C1B19]/20 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-dashed border-[#1C1B19]/20">
                <span className="font-mono text-xs font-bold text-[#A63429]">INBOUND ・ 回程</span>
                <span className="font-mono text-xs text-[#5A554C]">11.25 WED</span>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-mono text-2xl font-bold">HKG</span>
                <span className="font-mono text-xs text-[#5A554C]">── UO116 ──</span>
                <span className="font-mono text-2xl font-bold">TPE</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#5A554C] mb-4">
                <span>香港 T2</span>
                <span>1h 45m</span>
                <span>桃園機場</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1C1B19]/15 flex justify-between font-mono text-sm">
              <span>DEP <strong>18:40</strong></span>
              <span className="text-[#A63429]">ARR <strong>20:25</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-[#1B4332] text-[#F4EFE6] p-5 border border-[#1B4332]">
          <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-[#F4EFE6]/20">
            <span className="font-mono text-xs tracking-widest text-[#D4C5A9]">RESIDENCE ・ 3 NIGHTS</span>
            <span className="font-mono text-xs text-[#D4C5A9]">旺角東站 D 出口</span>
          </div>
          <h4 className="font-serif text-xl font-bold mb-1">帝京酒店 Royal Plaza Hotel</h4>
          <p className="text-xs text-[#D4C5A9] mb-3">九龍旺角太子道西 193 號（直通 MOKO 新世紀廣場）</p>
          <div className="flex justify-between font-mono text-xs text-[#F4EFE6]/85 pt-3 border-t border-[#F4EFE6]/15">
            <span>CHECK-IN 11/22 15:00</span>
            <span>CHECK-OUT 11/25 11:00</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs tracking-widest text-[#A63429] uppercase">PACKING CHECKLIST</h3>
          <span className="font-mono text-xs px-2.5 py-0.5 border border-[#1B4332]/30 text-[#1B4332] bg-[#1B4332]/10">
            {checkedCount} / {PACKING_CHECKLIST.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {PACKING_CHECKLIST.map((item) => {
            const checked = Boolean(checklistState[item.id]);
            return (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3.5 border border-[#1C1B19]/15 bg-[#F4EFE6] hover:border-[#1C1B19]/40 transition cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleChecklist(item.id)}
                  className="mt-1 w-4 h-4 accent-[#1B4332] cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[#B8863B] block">{item.group}</span>
                  <span className={`text-sm transition ${checked ? 'line-through text-[#5A554C]/60' : 'text-[#1C1B19]'}`}>
                    {item.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
