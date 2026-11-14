// 同步港鐵官方 PDF（車站街道圖 / 車站位置圖 / 全網路綫圖）與 pdf.js 中文字型資源到 public/
// 用法：npm run sync:mtr          只下載缺少的檔案
//       npm run sync:mtr -- --force  全部重新下載（更新為官網最新版）
import { cp, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MTR_STATION_DEFS } from '../src/data/mtrNetwork.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const force = process.argv.includes('--force');
const BASE = 'https://www.mtr.com.hk/archive/ch/services';

async function exists(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  if (!force && (await exists(dest))) return 'skip';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (trip-static asset sync)' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== '%PDF') throw new Error(`not a PDF: ${url}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return 'ok';
}

const jobs = [[`${BASE}/routemap.pdf`, path.join(pub, 'mtr/routemap.pdf')]];
for (const s of MTR_STATION_DEFS) {
  jobs.push([`${BASE}/maps/${s.code}.pdf`, path.join(pub, `mtr/maps/${s.code}.pdf`)]);
  jobs.push([`${BASE}/layouts/${s.code}.pdf`, path.join(pub, `mtr/layouts/${s.code}.pdf`)]);
}

let ok = 0, skip = 0;
const failed = [];
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const [url, dest] = queue.shift();
      try {
        (await download(url, dest)) === 'ok' ? ok++ : skip++;
      } catch (e) {
        failed.push(String(e.message || e));
      }
    }
  })
);
console.log(`MTR PDFs: ${ok} downloaded, ${skip} up-to-date, ${failed.length} failed`);
failed.forEach((f) => console.log('  ✗', f));

// pdf.js 需要 cMaps（中文字型編碼）與標準字型才能正確渲染港鐵的中文 PDF
const pdfjs = path.join(root, 'node_modules/pdfjs-dist');
await cp(path.join(pdfjs, 'cmaps'), path.join(pub, 'pdfjs/cmaps'), { recursive: true });
await cp(path.join(pdfjs, 'standard_fonts'), path.join(pub, 'pdfjs/standard_fonts'), { recursive: true });
console.log('pdf.js cmaps & standard_fonts copied to public/pdfjs');
if (failed.length) process.exitCode = 1;
