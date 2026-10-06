#!/usr/bin/env node
/*
 * Bulk-attach large files (drawings, scans, PDFs) to orders — so office staff never have to upload them.
 *
 * Each file is matched to an order by the order number in its name or its folder name:
 *   imports/files/326-00512 чертеж.pdf        → order with original number 326-00512
 *   imports/files/326-00512/скица 1.jpg       → same (folder name)
 *   imports/files/#3169 снимка.png            → order with internal number 3169
 *
 * Usage (from backend/):
 *   ESPEHO_EMAIL=admin@espeho.com ESPEHO_PASSWORD=… node scripts/attach_files.js ../imports/files          # preview
 *   ESPEHO_EMAIL=… ESPEHO_PASSWORD=… node scripts/attach_files.js ../imports/files --apply                 # upload
 * Options: --url=https://espeho-erp-production.up.railway.app (default) or http://localhost:5001
 * Files already attached to the same order with the same name are skipped, so re-running is safe.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const apply = args.includes('--apply');
const base = (args.find(a => a.startsWith('--url=')) || '--url=https://espeho-erp-production.up.railway.app').slice(6).replace(/\/$/, '');
const ALLOWED = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg', '.dxf', '.xlsx', '.docx'];
const MIME = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

if (!dir || !fs.existsSync(dir)) {
  console.error('Употреба: node scripts/attach_files.js <папка> [--apply] [--url=…]');
  process.exit(1);
}

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.startsWith('.') ? [] : [path.join(d, e.name)]);
}

// Order references found in a path: "326-00512", "626-00015-1", "700030", "#3169"
function refsIn(p) {
  const rel = path.relative(dir, p);
  const out = [];
  for (const m of rel.matchAll(/(\d{3}-\d{4,6}(?:-\d+)?)|#(\d{1,6})|(?<![\d-])(\d{6})(?![\d-])/g)) {
    if (m[1]) out.push({ ext: m[1] });
    else if (m[2]) out.push({ num: m[2] });
    else if (m[3]) out.push({ ext: m[3] });
  }
  return out;
}

async function api(token, method, p, body) {
  const res = await fetch(base + '/api' + p, {
    method, body,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${data.error || ''}`);
  return data;
}

(async () => {
  const { ESPEHO_EMAIL: email, ESPEHO_PASSWORD: password } = process.env;
  if (!email || !password) { console.error('Задайте ESPEHO_EMAIL и ESPEHO_PASSWORD (администратор).'); process.exit(1); }
  const { token, user } = await api(null, 'POST', '/auth/login', JSON.stringify({ email, password }));
  if (user.role !== 'admin') { console.error('Нужен е администраторски акаунт.'); process.exit(1); }

  const files = walk(dir);
  const cache = new Map();
  async function findOrder(ref) {
    const key = ref.ext || '#' + ref.num;
    if (cache.has(key)) return cache.get(key);
    const { data } = await api(token, 'GET', `/orders?limit=10&search=${encodeURIComponent(ref.ext || ref.num)}`);
    const hits = data.filter(o => (ref.ext ? o.external_ref === ref.ext : String(o.order_number) === ref.num));
    cache.set(key, hits);
    return hits;
  }

  const plan = [];
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const size = fs.statSync(f).size;
    if (!ALLOWED.includes(ext)) { plan.push({ f, status: 'пропуснат — неразрешен тип' }); continue; }
    if (size > 200 * 1024 * 1024) { plan.push({ f, status: 'пропуснат — над 200 MB' }); continue; }
    const refs = refsIn(f);
    if (!refs.length) { plan.push({ f, status: 'без номер на поръчка в името' }); continue; }
    let orders = [];
    for (const r of refs) { orders = await findOrder(r); if (orders.length) break; }
    if (orders.length === 0) { plan.push({ f, status: `поръчка ${refs.map(r => r.ext || '#' + r.num).join('/')} не е намерена` }); continue; }
    if (orders.length > 1) { plan.push({ f, status: `${orders.length} поръчки с този номер — уточнете с #вътрешен номер` }); continue; }
    plan.push({ f, order: orders[0], size });
  }

  const ok = plan.filter(p => p.order);
  console.log(`\n${files.length} файла · ${ok.length} съвпадат · ${plan.length - ok.length} проблема\n`);
  for (const p of plan) {
    const name = path.relative(dir, p.f);
    if (p.order) console.log(`  ✓ ${name}  →  ${p.order.external_ref || '#' + p.order.order_number} (${p.order.client_name})  ${(p.size / 1048576).toFixed(1)} MB`);
    else console.log(`  ✗ ${name}  —  ${p.status}`);
  }
  if (!apply) { console.log('\nПреглед. За качване добавете --apply'); return; }

  let uploaded = 0, skipped = 0;
  for (const p of ok) {
    const existing = await api(token, 'GET', `/files/${p.order.id}`);
    if (existing.some(e => e.original_name === path.basename(p.f))) { skipped++; continue; }
    const fd = new FormData();
    const ext = path.extname(p.f).toLowerCase();
    fd.append('file', new Blob([fs.readFileSync(p.f)], { type: MIME[ext] || 'application/octet-stream' }), path.basename(p.f));
    await api(token, 'POST', `/files/${p.order.id}`, fd);
    uploaded++;
    process.stdout.write(`  ↑ ${path.basename(p.f)}\n`);
  }
  console.log(`\nКачени: ${uploaded} · вече съществуващи: ${skipped}`);
})().catch(e => { console.error('Грешка:', e.message); process.exit(1); });
