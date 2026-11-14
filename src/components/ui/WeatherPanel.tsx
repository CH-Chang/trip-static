import { motion } from 'motion/react';
import { ITINERARY_DAYS } from '../../data/tripData';
import {
  TAOYUAN_SOURCE,
  WEATHER_SOURCE,
  hkoIconUrl,
  packingHint,
  useHkoWeather,
  wmoText,
  type DayForecast,
  type TaoyuanDay
} from '../../utils/weather';
import { SUN_SOURCES } from '../../utils/sun';
import { SunRow } from './SunTimes';

const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong' });

/** 九天預報涵蓋到的日期之外，推算哪一天起會有資料 */
function availableFrom(date: string, days = 8) {
  const d = new Date(`${date}T00:00:00+08:00`);
  d.setDate(d.getDate() - days);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 第一天桃園出發、最後一天回到桃園 */
const TAOYUAN_ROLE: Record<number, string> = { 1: '桃園出發', 4: '桃園抵達' };

export function SourceNote({ issuedAt, fetchedAt, dark = false }: { issuedAt?: string; fetchedAt?: number; dark?: boolean }) {
  const link = 'underline underline-offset-2 hover:text-accent';
  return (
    <p className={`text-[10px] leading-relaxed ${dark ? 'text-white/50' : 'text-ink-soft'}`}>
      香港天氣來自
      <a href={WEATHER_SOURCE.url} target="_blank" rel="noopener noreferrer" className={link}>
        {WEATHER_SOURCE.name}
      </a>
      的九天天氣預報{issuedAt && `，發布於 ${fmtTime(new Date(issuedAt).getTime())}`}；桃園天氣來自
      <a href={TAOYUAN_SOURCE.url} target="_blank" rel="noopener noreferrer" className={link}>
        {TAOYUAN_SOURCE.name}
      </a>
      的{TAOYUAN_SOURCE.place}預報{fetchedAt && `，這台裝置於 ${fmtTime(fetchedAt)} 更新`}。日出日落時間來自
      <a href={SUN_SOURCES.hk.url} target="_blank" rel="noopener noreferrer" className={link}>
        {SUN_SOURCES.hk.name}
      </a>
      和 Open-Meteo。
    </p>
  );
}

function GlyphStamp({ glyph }: { glyph: string }) {
  return (
    <span className="inline-flex w-7 h-7 items-center justify-center border border-accent text-accent font-hand font-bold text-sm shrink-0" style={{ transform: 'rotate(-4deg)' }}>
      {glyph}
    </span>
  );
}

export function DayWeatherBadge({ date, dark = false }: { date: string; dark?: boolean }) {
  const { data } = useHkoWeather();
  const f = data?.forecasts.find((x) => x.date === date);
  const base = `inline-flex items-center gap-1.5 px-2 py-0.5 border text-[12px] ${dark ? 'border-white/25 text-white' : 'border-ink/15 bg-card'}`;
  if (!f) return <span className={`${base} text-[11px] opacity-70`}>香港天氣 {availableFrom(date)} 起提供</span>;
  return (
    <span title={`${f.weather}，資料來自${WEATHER_SOURCE.short}`} className={base}>
      <img src={hkoIconUrl(f.icon)} alt="" className="w-6 h-6" />
      <span className="font-mono font-bold">
        {f.minTemp}–{f.maxTemp}°
      </span>
      <span className="text-[10px]">雨 {f.psr}</span>
      <span className="text-[9px] opacity-60">HKO</span>
    </span>
  );
}

function TaoyuanRow({ t, role, date }: { t?: TaoyuanDay; role: string; date: string }) {
  if (!t) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-ink-soft">
        <span className="font-mono">{role}</span>
        <span>預報約 {availableFrom(date, 15)} 起提供</span>
      </div>
    );
  }
  const w = wmoText(t.code);
  return (
    <div className="flex items-center gap-2">
      <GlyphStamp glyph={w.glyph} />
      <div className="min-w-0">
        <p className="text-[10px] font-mono text-ink-soft">{role}・{w.text}</p>
        <p className="font-mono text-sm font-bold leading-tight">
          {t.maxTemp}°<span className="text-ink-soft font-normal">/{t.minTemp}°</span>
          {t.pop != null && <span className="text-[10px] font-normal text-ink-soft ml-1.5">降雨 {t.pop}%</span>}
        </p>
      </div>
    </div>
  );
}

function DayCard({ day, date, label, color, f, tao, i }: { day: number; date: string; label: string; color: string; f?: DayForecast; tao?: TaoyuanDay; i: number }) {
  const role = TAOYUAN_ROLE[day];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className="relative bg-card border border-ink/15 shadow-[3px_3px_0_rgba(31,29,26,0.1)] flex flex-col"
    >
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-3.5 flex-1 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-widest text-ink-soft">DAY 0{day}</span>
          <span className="font-mono text-[10px] text-ink-soft">{label}</span>
        </div>

        {role && day === 1 && (
          <div className="space-y-1">
            <TaoyuanRow t={tao} role={role} date={date} />
            <SunRow date={date} place="tw" />
          </div>
        )}

        <div>
          <p className="text-[10px] font-mono text-ink-soft">香港</p>
          {f ? (
            <>
              <div className="flex items-center gap-2">
                <img src={hkoIconUrl(f.icon)} alt={f.weather} className="w-11 h-11 -ml-1" />
                <div>
                  <p className="font-mono text-2xl font-bold leading-none">
                    {f.maxTemp}°<span className="text-base text-ink-soft">/{f.minTemp}°</span>
                  </p>
                  <p className="text-[11px] text-ink-soft mt-1">
                    降雨 <strong className={f.psr.includes('高') ? 'text-accent' : ''}>{f.psr}</strong>・濕度 {f.minRh}–{f.maxRh}%
                  </p>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed mt-1 line-clamp-2">{f.weather}</p>
              <p className="font-hand text-[13px] text-jade mt-1">→ {packingHint(f)}</p>
            </>
          ) : (
            <div className="mt-1 border border-dashed border-ink/20 px-2.5 py-2.5 text-center">
              <p className="text-[12px] text-ink-soft">天文台預報尚未釋出</p>
              <p className="font-mono text-[10px] text-ink-soft mt-0.5">約 {availableFrom(date)} 起自動顯示</p>
            </div>
          )}
        </div>

        <div className="pt-1.5 border-t border-dashed border-ink/10">
          <SunRow date={date} />
        </div>

        {role && day === 4 && (
          <div className="pt-2 border-t border-dashed border-ink/15 space-y-1">
            <TaoyuanRow t={tao} role={`${role} 20:25`} date={date} />
            <SunRow date={date} place="tw" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** 四日天氣面板（香港：天文台；第一天與最後一天另附桃園機場） */
export default function WeatherPanel() {
  const { data, error, loading, reload } = useHkoWeather();
  const byDate = new Map(data?.forecasts.map((f) => [f.date, f]));
  const tao = new Map(data?.taoyuan?.map((t) => [t.date, t]));

  return (
    <div className="space-y-3">
      {(data?.currentTemp || (data?.warnings.length ?? 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          {data?.currentTemp && (
            <span className="px-2 py-1 border border-ink/20 font-mono">
              香港此刻 {data.currentTemp.value}°C{data.humidity != null && `・濕度 ${data.humidity}%`}
            </span>
          )}
          {data?.warnings.map((w) => (
            <span key={w.code} className="px-2 py-1 bg-accent text-white font-bold">
              ⚠ {w.name}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ITINERARY_DAYS.map((d, i) => (
          <DayCard key={d.day} day={d.day} date={d.date} label={d.dateLabel} color={d.stationColor} f={byDate.get(d.date)} tao={tao.get(d.date)} i={i} />
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <SourceNote issuedAt={data?.issuedAt} fetchedAt={data?.fetchedAt} />
        <button onClick={reload} className="text-[11px] underline underline-offset-2 text-ink-soft hover:text-accent cursor-pointer">
          {loading ? '更新中…' : error ? '更新失敗，重試' : '重新整理'}
        </button>
      </div>
    </div>
  );
}
