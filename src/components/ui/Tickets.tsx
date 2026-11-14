import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { ITINERARY_DAYS } from '../../data/tripData';
import { addTicket, deleteTicket, formatBytes, updateTicket, useTickets, type Ticket } from '../../utils/tickets';
import PdfViewer from '../mtr/PdfViewer';
import { IconClose, IconPlus } from '../Icons';
import SearchSelect, { type SelectOption } from './SearchSelect';

const ALL_ITEMS = ITINERARY_DAYS.flatMap((d) => d.items.map((i) => ({ id: i.id, label: `D${d.day} ${i.timeLabel.slice(0, 5)} ${i.title}`, hint: i.ticketHint })));

/** 自訂下拉選單用的選項（依天分組、可搜尋地點與日期） */
const ITEM_OPTIONS: SelectOption[] = [
  { value: '', label: '未分類', sub: '不綁定任何行程' },
  ...ITINERARY_DAYS.flatMap((d) =>
    d.items.map((i) => ({
      value: i.id,
      label: i.title,
      sub: `${i.timeLabel}・${i.location}`,
      group: `DAY ${d.day}・${d.date.slice(5).replace('-', '/')}`,
      badge: i.ticketHint ? '需要票券' : undefined,
      keywords: `D${d.day} DAY${d.day} ${d.date} ${d.theme} ${i.district}`
    }))
  )
];
const ACCEPT = 'image/*,application/pdf';

/** 物件網址：元件存在時有效，卸載時釋放 */
function useObjectUrl(blob: Blob | null) {
  // 在 effect 內建立／釋放，避免 StrictMode 重跑 effect 時用到已釋放的網址
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

// ───────────────────────── 全螢幕出示 ─────────────────────────
export function TicketViewer({ tickets, startIndex = 0, onClose }: { tickets: Ticket[]; startIndex?: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const t = tickets[Math.min(idx, tickets.length - 1)];
  const url = useObjectUrl(t?.blob ?? null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!t) return null;
  const isPdf = t.mime === 'application/pdf';

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-white text-[#2B2A28] flex flex-col"
      role="dialog"
      aria-label={`票券：${t.label}`}
    >
      <div className="shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-3 border-b border-black/10 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-[0.25em] text-black/45">TICKET ・ 出示時請調高螢幕亮度</p>
          <p className="font-serif text-lg font-medium truncate">{t.label}</p>
        </div>
        <button onClick={onClose} aria-label="關閉" className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
          <IconClose className="w-4 h-4" />
        </button>
      </div>

      {tickets.length > 1 && (
        <div className="shrink-0 flex gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar border-b border-black/5">
          {tickets.map((tk, i) => (
            <button
              key={tk.id}
              onClick={() => setIdx(i)}
              className={`shrink-0 h-8 px-3 text-xs border cursor-pointer ${i === idx ? 'bg-black text-white border-black' : 'border-black/15'}`}
            >
              {i + 1}. {tk.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 min-h-0 bg-white">
        {url &&
          (isPdf ? (
            <PdfViewer fill url={url} title={t.fileName} />
          ) : (
            <TransformWrapper minScale={1} maxScale={6} centerOnInit doubleClick={{ mode: 'toggle', step: 1.4 }} wheel={{ step: 0.15 }}>
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%', touchAction: 'none' }} contentStyle={{ width: '100%', height: '100%' }}>
                <img src={url} alt={t.label} className="w-full h-full object-contain select-none" draggable={false} />
              </TransformComponent>
            </TransformWrapper>
          ))}
      </div>
      <p className="shrink-0 text-center text-[10px] text-black/40 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        雙指或雙擊放大 QR code・票券只存在這台裝置
      </p>
    </motion.div>,
    document.body
  );
}

// ───────────────────────── 景點上的票券欄位 ─────────────────────────
/**
 * 綁定行程景點的票券：有票就「出示」，沒有就「上傳」。
 * hint 有值（例如山頂纜車）時會以醒目樣式提醒需要票券。
 */
export function TicketSlot({ itemId, hint, dark = false }: { itemId: string; hint?: string; dark?: boolean }) {
  const { tickets } = useTickets();
  const mine = tickets.filter((t) => t.itemId === itemId);
  const [viewing, setViewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      for (const f of Array.from(files)) await addTicket(f, itemId, mine.length === 0 && hint ? hint : undefined);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const muted = dark ? 'text-white/60' : 'text-ink-soft';
  if (!hint && mine.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {mine.length > 0 ? (
        <>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewing(true)}
            className="h-8 px-3 text-[12px] bg-accent text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="font-mono text-[10px] border border-white/60 px-1">QR</span>
            出示票券{mine.length > 1 ? ` ${mine.length} 張` : ''}
          </motion.button>
          <button onClick={() => inputRef.current?.click()} className={`h-8 px-2 text-[11px] border border-current/20 cursor-pointer ${muted}`} aria-label="再加一張票券">
            <IconPlus className="w-3 h-3" />
          </button>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`h-8 px-3 text-[12px] border border-dashed cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
            hint ? 'border-accent text-accent hover:bg-accent hover:text-white' : `border-current/30 ${muted} hover:text-ink`
          }`}
        >
          <IconPlus className="w-3 h-3" />
          {busy ? '儲存中…' : hint ? `上傳${hint}` : '上傳票券'}
        </button>
      )}
      {err && <span className="text-[11px] text-accent">{err}</span>}
      <AnimatePresence>{viewing && mine.length > 0 && <TicketViewer tickets={mine} onClose={() => setViewing(false)} />}</AnimatePresence>
    </div>
  );
}

// ───────────────────────── 票夾（手帖抽屜） ─────────────────────────
function Thumb({ t }: { t: Ticket }) {
  const url = useObjectUrl(t.mime.startsWith('image/') ? t.blob : null);
  return (
    <span className="w-14 h-14 shrink-0 bg-paper-2 border border-ink/10 flex items-center justify-center overflow-hidden">
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span className="font-mono text-[11px] text-accent">PDF</span>}
    </span>
  );
}

export function TicketWallet() {
  const { tickets, ready, error } = useTickets();
  const [target, setTarget] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const needed = ALL_ITEMS.filter((i) => i.hint);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const item = ALL_ITEMS.find((i) => i.id === target);
      for (const f of Array.from(files)) await addTicket(f, target || null, item?.hint);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="font-mono text-[11px] tracking-[0.3em] text-accent">TICKET WALLET</h3>
          <p className="font-serif text-xl font-medium">票夾</p>
        </div>
        <span className="font-mono text-[11px] text-ink-soft">{tickets.length} 張</span>
      </div>

      {/* 需要票券的行程提醒 */}
      <div className="flex flex-wrap gap-1.5">
        {needed.map((n) => {
          const has = tickets.some((t) => t.itemId === n.id);
          return (
            <span key={n.id} className={`px-2 py-1 text-[11px] border ${has ? 'border-jade text-jade' : 'border-accent/50 text-accent'}`}>
              {has ? '✓' : '○'} {n.hint}
            </span>
          );
        })}
      </div>

      {/* 上傳 */}
      <div className="bg-card border border-ink/10 p-3 space-y-2">
        <label className="block text-[11px] text-ink-soft">綁定到行程，也可以不選</label>
        <SearchSelect
          value={target}
          onChange={setTarget}
          options={ITEM_OPTIONS}
          placeholder="未分類"
          searchPlaceholder="搜尋景點地點或 D2"
          ariaLabel="綁定到行程"
        />
        <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full h-10 bg-ink text-paper text-[13px] cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <IconPlus className="w-3.5 h-3.5" />
          {busy ? '儲存中…' : '選擇票券，圖片或 PDF 都可以多選'}
        </button>
        {(err || error) && <p className="text-[11px] text-accent">{err || error}</p>}
      </div>

      {/* 清單 */}
      {ready && tickets.length === 0 && <p className="text-[12px] text-ink-soft">還沒有票券。電子票的截圖或 PDF 都可以存進來，到現場離線也能出示。</p>}
      <ul className="space-y-2">
        {tickets.map((t, i) => (
          <motion.li key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-ink/10 p-2.5 flex gap-3">
            <button onClick={() => setViewIdx(i)} className="cursor-pointer" aria-label={`出示 ${t.label}`}>
              <Thumb t={t} />
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <input
                defaultValue={t.label}
                onBlur={(e) => e.target.value.trim() && e.target.value !== t.label && updateTicket(t.id, { label: e.target.value.trim() })}
                className="w-full bg-transparent border-b border-transparent focus:border-ink/30 outline-none font-serif text-[14px] font-medium"
                aria-label="票券名稱"
              />
              <SearchSelect
                size="sm"
                value={t.itemId ?? ''}
                onChange={(v) => updateTicket(t.id, { itemId: v || null })}
                options={ITEM_OPTIONS}
                placeholder="未分類"
                searchPlaceholder="搜尋景點地點或 D2"
                ariaLabel="綁定行程"
              />
              <div className="flex items-center gap-2 text-[11px] text-ink-soft">
                <span className="font-mono">{formatBytes(t.size)}</span>
                <button onClick={() => setViewIdx(i)} className="underline underline-offset-2 cursor-pointer hover:text-ink">出示</button>
                {confirmId === t.id ? (
                  <>
                    <button onClick={() => deleteTicket(t.id)} className="text-accent font-bold cursor-pointer">確定刪除</button>
                    <button onClick={() => setConfirmId(null)} className="cursor-pointer">取消</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmId(t.id)} className="ml-auto cursor-pointer hover:text-accent">刪除</button>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
      <p className="text-[10px] text-ink-soft leading-relaxed">
        ※ 票券只存在這台裝置的瀏覽器裡，不會上傳到任何地方。清除瀏覽器資料，或 iPhone Safari 很久沒開這個網站時，票券都可能被清掉，請另外保留原始電子票。
      </p>

      <AnimatePresence>{viewIdx !== null && <TicketViewer tickets={tickets} startIndex={viewIdx} onClose={() => setViewIdx(null)} />}</AnimatePresence>
    </section>
  );
}
