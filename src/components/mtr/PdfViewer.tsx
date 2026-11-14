import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { fetchPdfBytes, openPdf } from '../../utils/pdf';
import { IconArrowUpRight, IconExpand, IconFit, IconMinus, IconPlus, IconShrink } from '../Icons';

interface PdfViewerProps {
  url: string;
  title: string;
  officialUrl?: string;
  /** 填滿父容器高度（主畫面舞台用） */
  fill?: boolean;
}

type LoadState =
  | { status: 'loading'; loaded: number; total: number }
  | { status: 'ready'; fromCache: boolean }
  | { status: 'error'; message: string };

const MAX_CANVAS_PIXELS = 14_000_000; // iOS Safari canvas 上限約 16.7M px
const MAX_ZOOM = 8;

/**
 * pdf.js 即時渲染 + react-zoom-pan-pinch 手勢縮放
 * - 縮放倍率 1 = 整頁剛好塞進視窗（contain）
 * - 放大停止後依目前倍率重新以更高解析度渲染，保持街道小字清晰
 */
export default function PdfViewer({ url, title, officialUrl, fill = false }: PdfViewerProps) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading', loaded: 0, total: 0 });
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageAspect, setPageAspect] = useState(1.414); // width / height
  const [fullscreen, setFullscreen] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoomPct, setZoomPct] = useState(100);
  const [renderZoom, setRenderZoom] = useState(1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);

  // 1) 下載 + 解析
  useEffect(() => {
    const ctrl = new AbortController();
    let loaded: PDFDocumentProxy | null = null;
    setLoad({ status: 'loading', loaded: 0, total: 0 });
    setDoc(null);
    setPageNum(1);
    setRenderZoom(1);
    fetchPdfBytes(url, (l, t) => setLoad({ status: 'loading', loaded: l, total: t }), ctrl.signal)
      .then(async ({ data, fromCache }) => {
        const pdf = await openPdf(data);
        if (ctrl.signal.aborted) {
          pdf.destroy();
          return;
        }
        loaded = pdf;
        setDoc(pdf);
        setLoad({ status: 'ready', fromCache });
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setLoad({ status: 'error', message: err instanceof Error ? err.message : '無法載入 PDF' });
      });
    return () => {
      ctrl.abort();
      loaded?.destroy();
    };
  }, [url]);

  // 2) 監聽容器尺寸
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullscreen]);

  // contain 尺寸：倍率 1 時整頁剛好可見
  const fitW = box.w && box.h ? Math.min(box.w, box.h * pageAspect) : 0;
  const fitH = fitW / pageAspect;

  // 3) 渲染頁面（先畫到離屏 canvas，完成後一次貼上，避免縮放時閃爍）
  const renderPage = useCallback(async () => {
    if (!doc || !fitW || !canvasRef.current) return;
    const page = await doc.getPage(pageNum);
    const base = page.getViewport({ scale: 1 });
    const aspect = base.width / base.height;
    if (Math.abs(aspect - pageAspect) > 0.001) {
      setPageAspect(aspect);
      return; // 尺寸改變後會再觸發一次
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let scale = (fitW / base.width) * dpr * renderZoom;
    const px = base.width * scale * base.height * scale;
    if (px > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / px);
    const viewport = page.getViewport({ scale });

    const off = document.createElement('canvas');
    off.width = Math.floor(viewport.width);
    off.height = Math.floor(viewport.height);
    renderTaskRef.current?.cancel();
    const task = page.render({ canvas: off, canvasContext: off.getContext('2d')!, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch {
      return; // 被新的渲染取消
    }
    const vis = canvasRef.current;
    if (!vis) return;
    vis.width = off.width;
    vis.height = off.height;
    vis.getContext('2d')!.drawImage(off, 0, 0);
  }, [doc, pageNum, fitW, renderZoom, pageAspect]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => () => renderTaskRef.current?.cancel(), []);

  // 全螢幕時鎖定背景捲動、Esc 離開
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const handleTransformed = (_: unknown, state: { scale: number }) => {
    setZoomPct(Math.round(state.scale * 100));
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      // 以 1 / 2 / 4 / 8 階梯重新渲染，避免頻繁重繪
      const bucket = Math.min(MAX_ZOOM, 2 ** Math.ceil(Math.log2(Math.max(1, state.scale))));
      setRenderZoom((z) => (z === bucket ? z : bucket));
    }, 220);
  };

  const pct = load.status === 'loading' && load.total ? Math.round((load.loaded / load.total) * 100) : null;

  const viewer = (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[80] bg-[#2B2A28] flex flex-col'
          : fill
          ? 'relative h-full bg-[#EFE8DA] overflow-hidden flex flex-col'
          : 'relative bg-[#EFE8DA] border border-[#2B2A28]/15 overflow-hidden flex flex-col'
      }
    >
      {/* 工具列 */}
      <div
        className={`flex items-center gap-1.5 px-3 py-2 shrink-0 ${
          fullscreen ? 'bg-[#2B2A28] text-[#F7F5F0] pt-[max(0.5rem,env(safe-area-inset-top))]' : 'bg-[#FAF6EE] border-b border-[#2B2A28]/10'
        }`}
      >
        <span className="font-serif font-bold text-sm truncate min-w-0 flex-1">{title}</span>
        {load.status === 'ready' && (
          <span
            className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono ${
              fullscreen ? 'bg-white/10' : 'bg-[#1B4332]/10 text-[#1B4332]'
            }`}
          >
            {load.fromCache ? '● 已離線保存' : '● 已下載並快取'}
          </span>
        )}
        {doc && doc.numPages > 1 && (
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <ToolBtn dark={fullscreen} label="上一頁" disabled={pageNum <= 1} onClick={() => setPageNum((p) => p - 1)}>‹</ToolBtn>
            <span>{pageNum}/{doc.numPages}</span>
            <ToolBtn dark={fullscreen} label="下一頁" disabled={pageNum >= doc.numPages} onClick={() => setPageNum((p) => p + 1)}>›</ToolBtn>
          </div>
        )}
        <span className="font-mono text-[11px] w-11 text-right tabular-nums opacity-70">{zoomPct}%</span>
        <ToolBtn dark={fullscreen} label="縮小" onClick={() => zoomRef.current?.zoomOut(0.5, 200)}><IconMinus className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn dark={fullscreen} label="放大" onClick={() => zoomRef.current?.zoomIn(0.5, 200)}><IconPlus className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn dark={fullscreen} label="符合視窗" onClick={() => zoomRef.current?.resetTransform(260)}><IconFit className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn dark={fullscreen} label={fullscreen ? '離開全螢幕' : '全螢幕'} onClick={() => setFullscreen((v) => !v)}>
          {fullscreen ? <IconShrink className="w-3.5 h-3.5" /> : <IconExpand className="w-3.5 h-3.5" />}
        </ToolBtn>
      </div>

      {/* 閱覽區 */}
      <div
        ref={wrapRef}
        className={`relative ${fullscreen || fill ? 'flex-1 min-h-0' : 'h-[min(62vh,560px)] sm:h-[min(68vh,620px)]'} ${
          fullscreen ? 'bg-[#2A2925]' : 'bg-[#E6DECD]'
        }`}
      >
        {fitW > 0 && (
          <TransformWrapper
            key={`${url}-${pageNum}-${fullscreen}-${box.w}x${box.h}`}
            ref={zoomRef}
            minScale={1}
            maxScale={MAX_ZOOM}
            initialScale={1}
            centerOnInit
            limitToBounds
            wheel={{ step: 0.18 }}
            pinch={{ step: 6 }}
            doubleClick={{ mode: 'toggle', step: 1.2, animationTime: 260 }}
            panning={{ velocityDisabled: false }}
            velocityAnimation={{ sensitivity: 1, animationTime: 320 }}
            onTransformed={handleTransformed}
          >
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', touchAction: 'none' }}
              contentStyle={{ width: fitW, height: fitH }}
            >
              <canvas
                ref={canvasRef}
                style={{ width: fitW, height: fitH }}
                className="block bg-white shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
              />
            </TransformComponent>
          </TransformWrapper>
        )}

        <AnimatePresence>
          {load.status !== 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6"
            >
              {load.status === 'loading' ? (
                <>
                  <div className="w-48 h-1.5 bg-[#2B2A28]/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#C8102E]"
                      initial={{ width: '8%' }}
                      animate={{ width: pct != null ? `${Math.max(8, pct)}%` : ['8%', '70%', '8%'] }}
                      transition={pct != null ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity }}
                    />
                  </div>
                  <p className="font-mono text-[11px] text-[#5A554C]">
                    即時下載中{pct != null ? ` ${pct}%` : '…'}
                    {load.total ? `，檔案共 ${(load.total / 1024 / 1024).toFixed(1)} MB` : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#C8102E] font-semibold">{load.message}</p>
                  {officialUrl && (
                    <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-[#1B4332]">
                      改到港鐵官網開啟
                    </a>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {load.status === 'ready' && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#2B2A28]/70 text-[#F7F5F0] text-[10px] font-mono">
            用雙指或滾輪縮放，雙擊放大，拖曳移動
          </div>
        )}
      </div>

      {fullscreen && officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] text-center text-[11px] font-mono text-[#D4C5A9] inline-flex items-center justify-center gap-1"
        >
          港鐵官網原始檔 <IconArrowUpRight />
        </a>
      )}
    </div>
  );

  return fullscreen ? createPortal(viewer, document.body) : viewer;
}

function ToolBtn({
  children,
  onClick,
  label,
  disabled,
  dark
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  dark?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 shrink-0 flex items-center justify-center transition cursor-pointer disabled:opacity-30 ${
        dark ? 'bg-white/10 hover:bg-white/20 text-[#F7F5F0]' : 'bg-[#2B2A28]/5 hover:bg-[#2B2A28]/10 text-[#2B2A28]'
      }`}
    >
      {children}
    </motion.button>
  );
}
