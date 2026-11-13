import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  wide?: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Drawer({
  open,
  onClose,
  side = 'right',
  wide = false,
  title,
  subtitle,
  children
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const widthClass = wide ? 'w-full sm:w-[min(92vw,900px)]' : 'w-full sm:w-[380px]';
  const positionClass = side === 'left' ? 'left-0 border-r' : 'right-0 border-l';
  const translateClass = open
    ? 'translate-x-0'
    : side === 'left'
    ? '-translate-x-full'
    : 'translate-x-full';

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div onClick={onClose} className="absolute inset-0 bg-[#1C1B19]/35 backdrop-blur-[2px]" />

      <aside
        className={`absolute top-0 bottom-0 ${positionClass} ${widthClass} ${translateClass} bg-[#FAF6EE] border-[#1C1B19]/25 shadow-2xl transition-transform duration-300 ease-out flex flex-col`}
      >
        <div className="px-5 py-4 bg-[#1B4332] text-[#F4EFE6] flex items-center justify-between shrink-0">
          <div>
            {subtitle && (
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#D4C5A9] uppercase block">
                {subtitle}
              </span>
            )}
            <h2 className="font-serif text-lg sm:text-xl font-bold">{title}</h2>
          </div>

          <button
            onClick={onClose}
            aria-label="關閉抽屜"
            className="w-8 h-8 border border-[#F4EFE6]/30 text-[#F4EFE6] font-mono text-xs flex items-center justify-center hover:bg-[#A63429] hover:border-[#A63429] transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
