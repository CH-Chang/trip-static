import { useEffect, useState } from 'react';

/**
 * 票券本機儲存（IndexedDB）
 * - 圖片／PDF 以 Blob 原檔存在這台裝置，不會上傳到任何伺服器
 * - localStorage 只有約 5MB 且只能存字串，所以票券用 IndexedDB
 * - 會嘗試 navigator.storage.persist() 降低被瀏覽器自動清除的機率
 */

export interface Ticket {
  id: string;
  /** 綁定的行程景點 id；null = 未分類 */
  itemId: string | null;
  label: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: number;
  blob: Blob;
}

const DB_NAME = 'hk-trip-2026';
const STORE = 'tickets';
const MAX_BYTES = 25 * 1024 * 1024;

let dbPromise: Promise<IDBDatabase> | null = null;
function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('itemId', 'itemId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

let cache: Ticket[] | null = null;
const listeners = new Set<(t: Ticket[]) => void>();
const emit = () => listeners.forEach((l) => l(cache ?? []));

async function loadAll(): Promise<Ticket[]> {
  const all = await tx<Ticket[]>('readonly', (s) => s.getAll() as IDBRequest<Ticket[]>);
  cache = all.sort((a, b) => a.createdAt - b.createdAt);
  emit();
  return cache;
}

export async function addTicket(file: File, itemId: string | null, label?: string): Promise<Ticket> {
  if (!/^image\/|application\/pdf/.test(file.type)) throw new Error('只支援圖片或 PDF');
  if (file.size > MAX_BYTES) throw new Error('檔案超過 25MB');
  const t: Ticket = {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId,
    label: label?.trim() || file.name.replace(/\.[^.]+$/, ''),
    fileName: file.name,
    mime: file.type,
    size: file.size,
    createdAt: Date.now(),
    blob: file
  };
  await tx('readwrite', (s) => s.put(t));
  // 第一次存票時請求「持久儲存」，避免空間不足時被瀏覽器清掉
  navigator.storage?.persist?.().catch(() => undefined);
  await loadAll();
  return t;
}

export async function updateTicket(id: string, patch: Partial<Pick<Ticket, 'label' | 'itemId'>>) {
  const cur = cache?.find((t) => t.id === id);
  if (!cur) return;
  await tx('readwrite', (s) => s.put({ ...cur, ...patch }));
  await loadAll();
}

export async function deleteTicket(id: string) {
  await tx('readwrite', (s) => s.delete(id));
  await loadAll();
}

/** 所有票券（跨元件共享、即時更新） */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(cache ?? []);
  const [ready, setReady] = useState(cache !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const l = (t: Ticket[]) => {
      setTickets(t);
      setReady(true);
    };
    listeners.add(l);
    if (cache === null) {
      loadAll().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '無法開啟本機儲存');
        setReady(true);
      });
    }
    return () => {
      listeners.delete(l);
    };
  }, []);

  return { tickets, ready, error };
}

export const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
