import type { PDFDocumentProxy } from 'pdfjs-dist';

const CACHE_NAME = 'hk-trip-mtr-pdf-v1';
const BASE = import.meta.env.BASE_URL;
const memoryCache = new Map<string, ArrayBuffer>();

export type MtrDocKind = 'map' | 'layout' | 'routemap';

export function mtrDocUrl(kind: MtrDocKind, code?: string): string {
  if (kind === 'routemap') return `${BASE}mtr/routemap.pdf`;
  return `${BASE}mtr/${kind === 'map' ? 'maps' : 'layouts'}/${code}.pdf`;
}

export const MTR_OFFICIAL_URL = (kind: MtrDocKind, code?: string) =>
  kind === 'routemap'
    ? 'https://www.mtr.com.hk/archive/ch/services/routemap.pdf'
    : `https://www.mtr.com.hk/archive/ch/services/${kind === 'map' ? 'maps' : 'layouts'}/${code}.pdf`;

const hasCacheApi = () => typeof caches !== 'undefined';

export async function isPdfCached(url: string): Promise<boolean> {
  if (memoryCache.has(url)) return true;
  if (!hasCacheApi()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return Boolean(await cache.match(url));
  } catch {
    return false;
  }
}

/**
 * 即時下載 PDF（串流讀取以回報進度），並存入 Cache Storage 供離線閱覽。
 * 第二次開啟同一份文件會直接從快取讀出。
 */
export async function fetchPdfBytes(
  url: string,
  onProgress?: (loaded: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ data: ArrayBuffer; fromCache: boolean }> {
  const mem = memoryCache.get(url);
  if (mem) return { data: mem.slice(0), fromCache: true };

  if (hasCacheApi()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) {
        const data = await hit.arrayBuffer();
        memoryCache.set(url, data);
        return { data: data.slice(0), fromCache: true };
      }
    } catch {
      /* Cache Storage 不可用時（非 HTTPS 區網）直接走網路 */
    }
  }

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`下載失敗，伺服器回應 HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;

  let data: ArrayBuffer;
  if (res.body && onProgress) {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total);
    }
    const out = new Uint8Array(loaded);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    data = out.buffer;
  } else {
    data = await res.arrayBuffer();
  }

  const head = new TextDecoder().decode(new Uint8Array(data, 0, Math.min(4, data.byteLength)));
  if (head !== '%PDF') throw new Error('檔案不是有效的 PDF');

  memoryCache.set(url, data);
  if (hasCacheApi()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, new Response(data.slice(0), { headers: { 'Content-Type': 'application/pdf' } }));
    } catch {
      /* ignore quota errors */
    }
  }
  return { data: data.slice(0), fromCache: false };
}

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

/** pdf.js 延遲載入（不拖慢首屏），並設定 worker 與中文 cMap */
export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
      ([pdfjs, worker]) => {
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        return pdfjs;
      }
    );
  }
  return pdfjsPromise;
}

export async function openPdf(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({
    data,
    cMapUrl: `${BASE}pdfjs/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${BASE}pdfjs/standard_fonts/`
  }).promise;
}

/** 預先下載一批 PDF（行程站點離線包） */
export async function prefetchPdfs(urls: string[], onStep?: (done: number, total: number) => void) {
  let done = 0;
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const url = queue.shift()!;
        try {
          await fetchPdfBytes(url);
        } catch {
          /* 單檔失敗不影響其他 */
        }
        onStep?.(++done, urls.length);
      }
    })
  );
}
