import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ITINERARY_DAYS } from '../data/tripData';
import { AIRPORT_TRANSFER, PRE_DEPARTURE_NOTES } from '../data/predeparture';
import LightParticles from './LightParticles';
import HandwrittenText from './ui/HandwrittenText';
import WeatherPanel from './ui/WeatherPanel';
import { TileWall } from './ui/MtrKit';
import SkylineSketch from './ui/SkylineSketch';
import { IconArrowUpRight, IconClock } from './Icons';

type AppTab = 'now' | 'map' | 'itinerary';

interface Props {
  cd: { days: string; hours: string; mins: string; secs: string };
  onOpenTab: (tab: AppTab) => void;
  onOpenChecklist: () => void;
  isDebug: boolean;
  onOpenTimeMachine: () => void;
}

const SLIDES = [
  { id: 'cover', label: '封面', no: '01' },
  { id: 'notes', label: '出發須知', no: '02' },
  { id: 'weather', label: '天氣', no: '03' },
  { id: 'tickets', label: '機票與接送', no: '04' },
  { id: 'days', label: '四日路綫', no: '05' }
] as const;

const AUTOPLAY_MS = 12000;
const IDLE_RESUME_MS = 30000;
const INK = 'var(--color-ink)';

const COVER_PHOTO = {
  src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg?width=1200',
  credit: 'Photo: Haydn Hsin / Wikimedia Commons (CC BY-SA 3.0)',
  page: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg'
};

/** 港鐵月台馬賽克磚的細色帶（點綴用） */
function MosaicBand({ colors, className = '' }: { colors: string[]; className?: string }) {
  return (
    <div className={`flex h-2 ${className}`} aria-hidden="true">
      {colors.map((c, i) => (
        <TileWall key={i} color={c} className="flex-1" />
      ))}
    </div>
  );
}

export default function PreDepartureCarousel({ cd, onOpenTab, onOpenChecklist, isDebug, onOpenTimeMachine }: Props) {
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const idleTimer = useRef<number | undefined>(undefined);

  const go = useCallback((next: number, userInitiated = true) => {
    setPage(([cur]) => {
      const n = (next + SLIDES.length) % SLIDES.length;
      return [n, n > cur || (!userInitiated && n === 0) ? 1 : -1];
    });
    if (userInitiated) {
      setPaused(true);
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setPaused(false), IDLE_RESUME_MS);
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => go(index + 1, false), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, [role=dialog]')) return;
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40 || info.velocity.x < -300) go(index + 1);
    else if (info.offset.x > 40 || info.velocity.x > 300) go(index - 1);
  };

  const slide = SLIDES[index];

  return (
    <div className="relative h-[calc(100dvh-3.8rem)] sm:h-[calc(100dvh-4.3rem)] overflow-hidden bg-paper text-ink select-none">
      {/* 午後窗光 */}
      <div className="window-light absolute inset-0 pointer-events-none" />
      <SkylineSketch className="absolute inset-x-0 bottom-[7.6rem] sm:bottom-[7rem] h-[110px] sm:h-[150px] w-full text-ink/15 pointer-events-none" delay={0.6} />
      <LightParticles />

      {/* 頁首細資訊列 */}
      <div className="absolute top-0 inset-x-0 px-5 sm:px-12 pt-4 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] sm:tracking-[0.25em] text-ink/50 pointer-events-none">
        <span className="min-w-0 truncate">
          <span className="hidden sm:inline">HONG KONG JOURNAL ・ </span>2026.11.22—25
        </span>
        <span className="shrink-0">
          {slide.no} / 0{SLIDES.length}
        </span>
      </div>

      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d >= 0 ? 60 : -60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d >= 0 ? -60 : 60, opacity: 0 })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.35}
          onDragEnd={onDragEnd}
          className="absolute inset-0 px-5 sm:px-14 pt-10 sm:pt-12 pb-[10rem] sm:pb-[9rem] flex"
        >
          <div className="carousel-slide m-auto w-full max-w-6xl max-h-full overflow-y-auto no-scrollbar touch-pan-y">
            {index === 0 && (
              <CoverSlide cd={cd} onOpenTab={onOpenTab} onNext={() => go(1)} isDebug={isDebug} onOpenTimeMachine={onOpenTimeMachine} />
            )}
            {index === 1 && <NotesSlide onOpenChecklist={onOpenChecklist} />}
            {index === 2 && (
              <SlideFrame no="03" kicker="WEATHER" title="出門前，先看看天色">
                <WeatherPanel />
              </SlideFrame>
            )}
            {index === 3 && <TicketsSlide />}
            {index === 4 && <DaysSlide onOpenTab={onOpenTab} />}
          </div>
        </motion.div>
      </AnimatePresence>

      {[-1, 1].map((d) => (
        <button
          key={d}
          onClick={() => go(index + d)}
          aria-label={d < 0 ? '上一頁' : '下一頁'}
          className={`hidden md:flex absolute ${d < 0 ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-ink/20 bg-card/60 backdrop-blur text-ink hover:bg-ink hover:text-white transition cursor-pointer`}
        >
          {d < 0 ? '←' : '→'}
        </button>
      ))}

      {/* 路綫式頁碼 */}
      <nav className="absolute left-0 right-0 bottom-[5.6rem] sm:bottom-[5.4rem] px-8 sm:px-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(70vw,560px)]">
        <div className="relative h-10">
          <div className="absolute left-2 right-2 top-[7px] h-[2px] bg-ink/15" />
          <motion.div
            className="absolute left-2 top-[7px] h-[2px] bg-ink"
            animate={{ width: `calc((100% - 1rem) * ${index / (SLIDES.length - 1)})` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer group"
              style={{ left: `calc(0.5rem + (100% - 1rem) * ${i / (SLIDES.length - 1)})` }}
              aria-label={s.label}
              aria-current={i === index}
            >
              <span
                className={`block w-4 h-4 rounded-full border-2 transition-colors ${
                  i === index ? 'bg-accent border-accent' : i < index ? 'bg-ink border-ink' : 'bg-paper border-ink/30 group-hover:border-ink/70'
                }`}
              />
              <span className={`text-[11px] whitespace-nowrap tracking-wider ${i === index ? 'text-ink font-medium' : 'text-ink/45 hidden sm:block'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function SlideFrame({ no, kicker, title, aside, children }: { no: string; kicker: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-4">
          <span className="font-serif text-5xl sm:text-6xl font-light text-ink/15 leading-none">{no}</span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] text-ink/50">{kicker}</p>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-[0.08em] mt-1">
              <HandwrittenText text={title} perChar={0.5} stagger={0.07} delay={0.1} color={INK} glow="rgba(0,0,0,0)" weight={500} />
            </h2>
          </div>
        </div>
        {aside}
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        {children}
      </motion.div>
    </div>
  );
}

function CoverSlide({
  cd,
  onOpenTab,
  onNext,
  isDebug,
  onOpenTimeMachine
}: {
  cd: Props['cd'];
  onOpenTab: (tab: AppTab) => void;
  onNext: () => void;
  isDebug: boolean;
  onOpenTimeMachine: () => void;
}) {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
      {/* 手機版：右上角斜放的小明信片 */}
      <motion.figure
        initial={{ opacity: 0, y: -16, rotate: 14 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 80, damping: 14 }}
        className="sm:hidden absolute -top-1 right-0 w-[36%] max-w-[150px] z-0 bg-card p-1.5 pb-5 shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
      >
        <span className="washi -top-2.5 left-1/2 -translate-x-1/2 rotate-[-4deg] scale-75" />
        <div className="aspect-[4/5] overflow-hidden bg-paper-2">
          <img
            src={COVER_PHOTO.src}
            alt="從太平山頂眺望維多利亞港"
            className="photo w-full h-full object-cover"
            style={{ filter: 'saturate(0.7) contrast(0.95) brightness(1.06) sepia(0.12)' }}
          />
        </div>
        <figcaption className="absolute bottom-1 inset-x-1.5 font-serif text-[9px] text-ink-soft tracking-wider truncate">太平山頂・維港</figcaption>
      </motion.figure>
      <div className="lg:col-span-6 flex gap-6 sm:gap-8">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="hidden sm:block vertical-rl font-serif text-xs tracking-[0.6em] text-ink/50 pt-1 border-r border-ink/15 pr-4"
        >
          二〇二六年十一月・香港四日
        </motion.span>
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-mono text-[10px] tracking-[0.4em] text-accent mb-5">
            BEFORE DEPARTURE
          </motion.p>
          <h1 className="font-serif font-medium leading-[1.35] tracking-[0.1em] text-[clamp(2.2rem,8vw,4.4rem)]">
            <HandwrittenText text="維港晚風，" delay={0.4} color={INK} glow="rgba(0,0,0,0)" weight={500} />
            <br />
            <HandwrittenText text="九龍燈火" delay={1.5} color={INK} glow="rgba(0,0,0,0)" weight={500} />
          </h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.4, duration: 0.8, ease: 'easeOut' }} style={{ originX: 0 }} className="mt-6 w-48">
            <MosaicBand colors={['#ED1D24', '#00AB4E', '#007DC5', '#F7943E']} />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className="text-sm sm:text-base font-light text-ink/70 mt-5 leading-loose tracking-wider">
            四天三夜，住在旺角東。
            <br />
            搭港鐵坐叮叮車，慢慢吃也慢慢走。
          </motion.p>

          {/* 倒數 */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.9 }} className="mt-7 flex items-end gap-5">
            {[
              [cd.days, '日'],
              [cd.hours, '時'],
              [cd.mins, '分'],
              [cd.secs, '秒']
            ].map(([v, u], i) => (
              <div key={u} className="flex items-baseline gap-1">
                <span className={`font-serif tabular-nums leading-none ${i === 0 ? 'text-5xl sm:text-6xl font-medium' : 'text-2xl sm:text-3xl font-light'} ${i === 3 ? 'text-accent' : ''}`}>{v}</span>
                <span className="text-xs text-ink/50">{u}</span>
              </div>
            ))}
          </motion.div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ink/45">UNTIL HB703 ・ 11.22 SUN 11:35 TPE</p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.1 }} className="flex flex-wrap gap-2.5 mt-7">
            <button onClick={onNext} className="h-11 px-6 rounded-full bg-ink text-paper text-sm cursor-pointer hover:bg-accent transition-colors">
              出發前須知 →
            </button>
            <button onClick={() => onOpenTab('itinerary')} className="h-11 px-6 rounded-full border border-ink/25 text-sm cursor-pointer hover:border-ink transition-colors">
              看四日行程
            </button>
            {isDebug && (
              <button onClick={onOpenTimeMachine} className="h-11 px-4 text-accent text-sm cursor-pointer inline-flex items-center gap-1.5">
                <IconClock /> 時光機
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-6 relative hidden sm:block"
      >
        <div className="relative bg-card p-2.5 pb-9 shadow-[0_20px_40px_-20px_rgba(43,42,40,0.35)] rotate-[1.5deg] max-w-[520px] ml-auto">
          <span className="washi -top-3 left-10 rotate-[-6deg]" />
          <div className="aspect-[4/3] overflow-hidden bg-paper-2">
            <motion.img
              src={COVER_PHOTO.src}
              alt="從太平山頂眺望維多利亞港"
              initial={{ scale: 1.12, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 2.2, ease: 'easeOut' }}
              className="photo w-full h-full object-cover"
              style={{ filter: 'saturate(0.7) contrast(0.95) brightness(1.06) sepia(0.12)' }}
            />
          </div>
          <figcaption className="absolute bottom-2 inset-x-3 flex items-end justify-between gap-2">
            <span className="font-serif text-sm text-ink/70 tracking-wider">太平山頂，看維港</span>
            <a href={COVER_PHOTO.page} target="_blank" rel="noopener noreferrer" className="text-[8px] text-ink/45 hover:underline truncate">
              {COVER_PHOTO.credit}
            </a>
          </figcaption>
        </div>
      </motion.figure>
    </div>
  );
}

function NotesSlide({ onOpenChecklist }: { onOpenChecklist: () => void }) {
  return (
    <SlideFrame
      no="02"
      kicker="BEFORE YOU GO"
      title="出發前，記得這幾件事"
      aside={
        <button onClick={onOpenChecklist} className="h-9 px-4 rounded-full border border-ink/25 text-xs cursor-pointer hover:bg-ink hover:text-paper transition-colors">
          打開行前清單勾選 →
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRE_DEPARTURE_NOTES.map((n, i) => (
          <motion.article
            key={n.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            className="relative bg-card/85 backdrop-blur-sm border border-ink/10 p-4 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <TileWall color={n.color} className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px] text-ink/40">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="font-serif text-[15px] font-medium leading-snug tracking-wide">{n.title}</h3>
            <p className="text-[12px] font-light text-ink/75 leading-relaxed mt-1.5 flex-1">{n.body}</p>
            {n.alert && <p className="text-[11px] text-accent mt-2 leading-snug">※ {n.alert}</p>}
            {n.link && (
              <a href={n.link.url} target="_blank" rel="noopener noreferrer" className="mt-2.5 text-[11px] text-ink/60 underline underline-offset-2 hover:text-accent inline-flex items-center gap-1">
                {n.link.label} <IconArrowUpRight className="w-2.5 h-2.5" />
              </a>
            )}
          </motion.article>
        ))}
      </div>
      <p className="text-[10px] text-ink/45 mt-3">※ 入境和行李規定請在出發前以官方網站公告為準。</p>
    </SlideFrame>
  );
}

function TicketsSlide() {
  const passes = [
    { dir: '去程', date: '11.22 SUN', from: 'TPE', to: 'HKG', fromZh: '桃園 T1', toZh: '香港機場', no: 'HB703', carrier: '大灣區航空', dep: '11:35', arr: '13:40', color: '#00AB4E' },
    { dir: '回程', date: '11.25 WED', from: 'HKG', to: 'TPE', fromZh: '香港 T2', toZh: '桃園機場', no: 'UO116', carrier: '香港快運', dep: '18:40', arr: '20:25', color: '#C8102E' }
  ];
  const t = AIRPORT_TRANSFER;
  return (
    <SlideFrame no="04" kicker="TICKETS & TRANSFER" title="機票接送與三晚的家">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {passes.map((p, i) => (
          <motion.div
            key={p.no}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="ticket-notch bg-card border border-ink/10"
          >
            <div className="px-5 pt-4 pb-3">
              <div className="flex justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5">
                  <TileWall color={p.color} className="w-3 h-3" />
                  {p.dir}・{p.no}
                </span>
                <span className="font-mono text-ink/50">{p.date}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-serif text-3xl font-light tracking-wider">{p.from}</span>
                <span className="flex-1 mx-4 relative border-t border-dashed border-ink/25">
                  <motion.span
                    className="absolute -top-[10px] text-sm text-ink/70"
                    initial={{ left: '0%' }}
                    animate={{ left: '88%' }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 1.6, ease: 'easeInOut' }}
                  >
                    ✈
                  </motion.span>
                </span>
                <span className="font-serif text-3xl font-light tracking-wider">{p.to}</span>
              </div>
              <div className="flex justify-between text-[10px] text-ink/50">
                <span>{p.fromZh}</span>
                <span>{p.toZh}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-ink/15 px-5 py-2.5 flex justify-between text-sm">
              <span className="text-[11px] text-ink/50">{p.carrier}</span>
              <span className="font-mono">
                {p.dep} → <span style={{ color: p.color }}>{p.arr}</span>
              </span>
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-card border border-ink/10 p-5">
          <p className="text-[11px] inline-flex items-center gap-1.5">
            <TileWall color="#53B7E8" className="w-3 h-3" />
            機場接送・{t.date}
          </p>
          <h3 className="font-serif text-xl font-medium tracking-wide mt-1.5">{t.title}</h3>
          <p className="text-[12px] font-light text-ink/75 leading-relaxed mt-1.5">{t.note}</p>
          <dl className="mt-3 grid grid-cols-[4.5rem_1fr] gap-y-1 text-[12px]">
            {[
              ['接送業者', t.provider],
              ['聯絡電話', t.contact],
              ['集合地點', t.meetingPoint]
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink/50">{k}</dt>
                <dd className={v ? '' : 'text-ink/35 border-b border-dashed border-ink/20'}>{v || '待填'}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.63 }} className="bg-card border border-ink/10 p-5">
          <p className="text-[11px] inline-flex items-center gap-1.5">
            <TileWall color="#B8863B" className="w-3 h-3" />
            住宿・3 晚
          </p>
          <h3 className="font-serif text-xl font-medium tracking-wide mt-1.5">帝京酒店 Royal Plaza Hotel</h3>
          <p className="text-[12px] font-light text-ink/75 leading-relaxed mt-1.5">
            九龍旺角太子道西 193 號・港鐵旺角東站 D 出口直通 MOKO 新世紀廣場。
          </p>
          <div className="mt-3 pt-3 border-t border-dashed border-ink/15 flex justify-between font-mono text-[11px]">
            <span>IN 11/22 15:00</span>
            <span>OUT 11/25 11:00</span>
          </div>
        </motion.div>
      </div>
    </SlideFrame>
  );
}

function DaysSlide({ onOpenTab }: { onOpenTab: (tab: AppTab) => void }) {
  return (
    <SlideFrame no="05" kicker="FOUR DAYS" title="四天，搭上四條路綫">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ITINERARY_DAYS.map((d, i) => (
          <motion.button
            key={d.day}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            whileHover={{ y: -4 }}
            onClick={() => onOpenTab('itinerary')}
            className="text-left bg-card border border-ink/10 cursor-pointer overflow-hidden"
          >
            <TileWall color={d.stationColor} className="h-2" />
            <div className="p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink/45">DAY 0{d.day}・{d.dateLabel}</p>
              <h3 className="font-serif text-base sm:text-lg font-medium leading-snug tracking-wide mt-1">{d.theme}</h3>
              <p className="hidden sm:block text-[12px] font-light text-ink/65 leading-relaxed mt-1.5 line-clamp-2">{d.subtitle}</p>
              <p className="mt-3 text-[10px] font-mono text-ink/40">
                {d.stationTag.split(' ')[0]}・{d.items.length} STOPS →
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </SlideFrame>
  );
}
