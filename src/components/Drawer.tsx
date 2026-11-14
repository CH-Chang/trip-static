import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { IconClose } from './Icons';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  /** md = 380px、lg = 900px、xl = 幾乎全寬（港鐵路網用） */
  size?: 'md' | 'lg' | 'xl';
  /** @deprecated 改用 size="lg" */
  wide?: boolean;
  title: string;
  subtitle?: string;
  /** 覆寫內容區樣式（例如移除 padding、自己管理捲動） */
  bodyClassName?: string;
  children: ReactNode;
}

function useIsMobile() {
  const query = '(max-width: 639px)';
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setMobile(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

export default function Drawer({
  open,
  onClose,
  side = 'right',
  size,
  wide = false,
  title,
  subtitle,
  bodyClassName,
  children
}: DrawerProps) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const resolved = size ?? (wide ? 'lg' : 'md');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const widthClass =
    resolved === 'xl' ? 'sm:w-[min(96vw,1440px)]' : resolved === 'lg' ? 'sm:w-[min(92vw,900px)]' : 'sm:w-[380px]';
  const hidden = isMobile ? { y: '100%' } : { x: side === 'left' ? '-100%' : '100%' };
  const shown = isMobile ? { y: 0 } : { x: 0 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            drag={isMobile ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className={`absolute bottom-0 top-0 max-sm:top-[env(safe-area-inset-top)] w-full ${widthClass} ${
              side === 'left' ? 'left-0 sm:border-r' : 'right-0 sm:border-l'
            } bg-paper border-ink/10 shadow-2xl flex flex-col max-sm:rounded-t-3xl overflow-hidden`}
          >
            {/* 手機版下拉把手 */}
            <div
              className="sm:hidden absolute top-0 inset-x-0 h-6 z-10 flex justify-center pt-2 touch-none cursor-grab"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="w-10 h-1.5 rounded-full bg-ink/20" />
            </div>

            <div
              className="px-5 pt-5 pb-3.5 sm:py-4 bg-card text-ink border-b border-ink/10 flex items-center justify-between gap-3 shrink-0 touch-none sm:touch-auto"
              onPointerDown={(e) => isMobile && dragControls.start(e)}
            >
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="min-w-0">
                {subtitle && (
                  <span className="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase block">{subtitle}</span>
                )}
                <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide truncate">{title}</h2>
              </motion.div>

              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ rotate: 90 }}
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="關閉"
                className="w-9 h-9 shrink-0 rounded-full border border-ink/15 text-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </motion.button>
            </div>

            <div className={bodyClassName ?? 'flex-1 overflow-y-auto p-5'}>{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
