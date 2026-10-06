#!/usr/bin/env node
/*
 * Proposes Търговски регистър matches for the biggest clients that have no ЕИК yet.
 * Nothing is written to the client cards — proposals go to client_registry_suggestions and the office
 * confirms or rejects each one in Клиенти → „Предложения от регистъра“.
 *
 * The register rate-limits requests, so this runs slowly (a few seconds per company).
 * Usage (from backend/): DATABASE_URL=… node scripts/suggest_registry_matches.js [--limit=50]
 */
require('dotenv').config();
const pool = require('../src/db/pool');
const registry = require('../src/utils/registry');

const limit = parseInt((process.argv.find(a => a.startsWith('--limit=')) || '--limit=50').slice(8));
const SKIP = ['КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)', 'МП', 'ОБЕКТ СЛАТИНА БЛ.246'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = v => String(v || '').toUpperCase().replace(/["„“]/g, '')
  .replace(/\s+(ЕООД|ООД|ЕАД|АД|ЕТ|СД|КД)$/, '').replace(/\s+/g, ' ').trim();
const isSofia = r => /софия/i.test(r?.city || '') || /софия/i.test(r?.address || '');

async function retry(fn) {
  for (let i = 0; i < 6; i++) {
    try { return await fn() } catch (e) {
      if (!e.busy) throw e
      process.stdout.write(' (регистърът е зает, изчаквам 60 с)')
      await sleep(60000)
    }
  }
  throw new Error('регистърът не отговаря')
}

(async () => {
  const { rows: clients } = await pool.query(
    `SELECT c.id, c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.sale_price),0) AS turnover
     FROM clients c JOIN orders o ON o.client_id = c.id
     WHERE c.eik IS NULL AND c.name <> ALL($1)
       AND NOT EXISTS (SELECT 1 FROM client_registry_suggestions s WHERE s.client_id = c.id)
     GROUP BY c.id ORDER BY turnover DESC LIMIT $2`, [SKIP, limit]);

  console.log(`${clients.length} клиента за проверка\n`);
  const tally = { high: 0, medium: 0, low: 0, none: 0 };

  for (const [i, c] of clients.entries()) {
    process.stdout.write(`${String(i + 1).padStart(2)}. ${c.name} …`);
    let hits = [];
    try { hits = await retry(() => registry.searchByName(c.name)) } catch (e) { console.log(' грешка:', e.message); continue }
    await sleep(2500);

    const exact = hits.filter(h => norm(h.name) === norm(c.name));
    let confidence = 'none', reason = 'Няма фирма с това име — вероятно физическо лице или съкращение', candidate = null, alternatives = [];

    if (exact.length) {
      // Details for up to 3 same-name companies, to tell them apart by city
      const details = [];
      for (const h of exact.slice(0, 3)) {
        try { details.push(await retry(() => registry.getByEik(h.eik))) } catch { /* skip */ }
        await sleep(2500);
      }
      const active = details.filter(d => d && !d.closed);
      const sofia = active.filter(isSofia);
      if (exact.length === 1 && active.length === 1) {
        confidence = 'high'; candidate = active[0]; reason = 'Единствена фирма с точно това име';
      } else if (sofia.length === 1) {
        confidence = 'medium'; candidate = sofia[0];
        reason = `${exact.length} фирми с това име — предложена е единствената в София`;
        alternatives = active.filter(d => d !== sofia[0]);
      } else if (active.length) {
        confidence = 'low'; candidate = active[0];
        reason = `${exact.length} фирми с това име — проверете града и управителя`;
        alternatives = active.slice(1);
      }
      if (candidate) {
        try { Object.assign(candidate, await registry.vies(candidate.eik)) } catch { /* VIES optional */ }
      }
    } else if (hits.length) {
      confidence = 'low';
      candidate = null;
      alternatives = hits.slice(0, 3);
      reason = 'Няма точно съвпадение — подобни имена: ' + hits.slice(0, 3).map(h => h.full_name || h.name).join('; ');
    }

    await pool.query(
      `INSERT INTO client_registry_suggestions (client_id, confidence, reason, candidate, alternatives)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (client_id) DO NOTHING`,
      [c.id, candidate ? confidence : (confidence === 'low' ? 'low' : 'none'), reason,
       candidate ? JSON.stringify(candidate) : null, JSON.stringify(alternatives)]);
    tally[candidate ? confidence : (confidence === 'low' ? 'low' : 'none')]++;
    console.log(` ${candidate ? `${confidence} → ${candidate.full_name || candidate.name} (${candidate.eik}, ${candidate.city || '—'})` : reason}`);
  }

  console.log(`\nГотово: сигурни ${tally.high} · вероятни ${tally.medium} · за проверка ${tally.low} · без съвпадение ${tally.none}`);
  await pool.end();
})().catch(async e => { console.error(e); await pool.end(); process.exit(1) });
