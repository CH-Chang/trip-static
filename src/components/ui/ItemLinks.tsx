import type { ItemLink } from '../../types/trip';

/** 行程卡片上的外部連結按鈕（另開新分頁） */
export default function ItemLinks({ links, dark = false }: { links?: ItemLink[]; dark?: boolean }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {links.map((l) => (
        <div key={l.url} className="min-w-0">
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-[12px] font-bold transition-colors ${
              dark ? 'border-white/40 text-white hover:bg-white/10' : 'border-ink/30 bg-card text-ink hover:border-accent hover:text-accent'
            }`}
          >
            {l.label}
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
          {l.note && <p className={`text-[10px] mt-0.5 leading-snug ${dark ? 'text-white/55' : 'text-ink-soft'}`}>{l.note}</p>}
        </div>
      ))}
    </div>
  );
}
