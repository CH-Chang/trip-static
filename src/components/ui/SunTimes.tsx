import { SUN_SOURCES, hkMs, useSunTimes } from '../../utils/sun';

const SunIcon = ({ set = false }: { set?: boolean }) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M3 18h18M7 18a5 5 0 0 1 10 0" />
    <path d={set ? 'M12 4v4m0 0-2-2m2 2 2-2' : 'M12 8V4m0 0-2 2m2-2 2 2'} />
    <path d="M4.5 11.5l1.4 1.4M19.5 11.5l-1.4 1.4" />
  </svg>
);

/** 一天的日出日落（香港） */
export function DaySunBadge({ date, dark = false }: { date: string; dark?: boolean }) {
  const { data } = useSunTimes();
  const t = data?.hk[date];
  if (!t) return null;
  return (
    <span
      title={`日出日落資料來自${SUN_SOURCES.hk.name}`}
      className={`inline-flex items-center gap-2 px-2 py-1 border text-[11px] ${dark ? 'border-white/25 text-white' : 'border-ink/15 bg-card text-ink'}`}
    >
      <span className="inline-flex items-center gap-1 text-[#D99A00]">
        <SunIcon />
        <span className="font-mono">{t.rise}</span>
      </span>
      <span className="inline-flex items-center gap-1 text-accent">
        <SunIcon set />
        <span className="font-mono">{t.set}</span>
      </span>
    </span>
  );
}

/** 行程卡片：日出或日落剛好落在這一站的時段內，就自動標出來 */
export function SunEventTag({ date, startMs, endMs }: { date: string; startMs: number; endMs: number }) {
  const { data } = useSunTimes();
  const t = data?.hk[date];
  if (!t) return null;
  const set = hkMs(date, t.set);
  const rise = hkMs(date, t.rise);
  const tag = set >= startMs && set <= endMs ? { label: `日落 ${t.set}`, cls: 'bg-accent text-white', isSet: true } : rise >= startMs && rise <= endMs ? { label: `日出 ${t.rise}`, cls: 'bg-[#D99A00] text-white', isSet: false } : null;
  if (!tag) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold ${tag.cls}`} title={`資料來自${SUN_SOURCES.hk.name}`}>
      <SunIcon set={tag.isSet} />
      {tag.label}
    </span>
  );
}

/** 天氣卡片內的一列：日出日落 */
export function SunRow({ date, place = 'hk' }: { date: string; place?: 'hk' | 'tw' }) {
  const { data } = useSunTimes();
  const t = data?.[place][date];
  if (!t) return null;
  return (
    <p className="flex items-center gap-3 text-[11px] text-ink-soft">
      <span className="inline-flex items-center gap-1">
        <span className="text-[#D99A00]">
          <SunIcon />
        </span>
        日出 <span className="font-mono text-ink">{t.rise}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="text-accent">
          <SunIcon set />
        </span>
        日落 <span className="font-mono text-ink">{t.set}</span>
      </span>
    </p>
  );
}
