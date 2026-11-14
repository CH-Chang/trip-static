import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { IconSearch } from '../Icons';

export interface SelectOption {
  value: string;
  label: string;
  /** 次要說明（地點、時間…） */
  sub?: string;
  /** 分組標題，例如 DAY 1 */
  group?: string;
  /** 右側小標籤，例如「需要票券」 */
  badge?: string;
  /** 額外可搜尋的文字 */
  keywords?: string;
}

interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

/** 反白搜尋關鍵字 */
function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-accent/15 text-accent rounded-none px-0">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * 可搜尋的下拉選單（取代原生 select）
 * - 以 portal + fixed 定位，不會被抽屜的 overflow 裁切；下方空間不足時自動往上開
 * - 鍵盤：↑↓ 移動、Enter 選取、Esc 關閉
 */
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder = '請選擇',
  searchPlaceholder = '搜尋…',
  size = 'md',
  ariaLabel
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean; maxH: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => [o.label, o.sub, o.group, o.badge, o.keywords].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [options, query]);

  // 計算位置（跟著捲動／縮放更新）
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom - 12;
      const above = r.top - 12;
      const up = below < 260 && above > below;
      const maxH = Math.min(380, Math.max(180, up ? above : below));
      setPos({ left: r.left, top: up ? r.top - 6 : r.bottom + 6, width: Math.max(r.width, 260), up, maxH });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // 開啟時：聚焦搜尋框、定位到目前選項
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const idx = Math.max(0, options.findIndex((o) => o.value === value));
    setActive(idx);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, options, value]);

  useEffect(() => setActive(0), [query]);

  // 點外面關閉
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  // 讓目前項目保持在可視範圍
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (o: SelectOption) => {
    onChange(o.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // 只關選單，不要連帶關掉外層抽屜
      e.nativeEvent.stopImmediatePropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const h = size === 'sm' ? 'h-7 text-[11px]' : 'h-9 text-[13px]';
  let lastGroup: string | undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        className={`w-full ${h} px-2.5 flex items-center gap-2 bg-paper border text-left cursor-pointer transition-colors ${
          open ? 'border-ink/60' : 'border-ink/15 hover:border-ink/35'
        }`}
      >
        <span className={`flex-1 min-w-0 truncate ${selected ? '' : 'text-ink-soft'}`}>
          {selected ? (
            <>
              {selected.group && <span className="font-mono text-ink-soft mr-1.5">{selected.group}</span>}
              {selected.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ink-soft text-[10px] shrink-0">
          ▾
        </motion.span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              style={{
                position: 'fixed',
                left: Math.min(pos.left, window.innerWidth - pos.width - 8),
                width: pos.width,
                ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
                transformOrigin: pos.up ? 'bottom' : 'top'
              }}
              className="z-[95] bg-card text-ink border border-ink/15 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] flex flex-col"
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-2 px-2.5 h-10 border-b border-ink/10 shrink-0">
                <IconSearch className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] placeholder:text-ink-soft/70"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-[11px] text-ink-soft hover:text-ink cursor-pointer">
                    清除
                  </button>
                )}
              </div>
              <ul ref={listRef} id={listId} role="listbox" className="overflow-y-auto py-1" style={{ maxHeight: pos.maxH - 40 }}>
                {filtered.length === 0 && <li className="px-3 py-4 text-[12px] text-ink-soft text-center">找不到「{query}」</li>}
                {filtered.map((o, i) => {
                  const showGroup = o.group && o.group !== lastGroup;
                  lastGroup = o.group;
                  const isSel = o.value === value;
                  return (
                    <li key={o.value || '__none'} role="presentation">
                      {showGroup && (
                        <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-[0.2em] text-ink-soft sticky top-0 bg-card">{o.group}</p>
                      )}
                      <div
                        id={`${listId}-${i}`}
                        data-idx={i}
                        role="option"
                        aria-selected={isSel}
                        onPointerMove={() => setActive(i)}
                        onClick={() => choose(o)}
                        className={`mx-1 px-2.5 py-2 flex items-start gap-2 cursor-pointer ${i === active ? 'bg-paper-2' : ''}`}
                      >
                        <span className={`w-3 shrink-0 text-[11px] leading-5 ${isSel ? 'text-accent' : 'text-transparent'}`}>✓</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] leading-5 truncate">{highlight(o.label, query.trim())}</span>
                          {o.sub && <span className="block text-[11px] text-ink-soft truncate">{highlight(o.sub, query.trim())}</span>}
                        </span>
                        {o.badge && <span className="shrink-0 px-1.5 py-0.5 text-[10px] border border-accent/40 text-accent">{o.badge}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
