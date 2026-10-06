// Company lookup in official public registers:
//  • Търговски регистър (portal.registryagency.bg) — search by name, full record by ЕИК
//    (name, legal form, seat address, phone/email if filed, manager = МОЛ, activity)
//  • VIES (European Commission) — is the company VAT-registered, official name/address
// Results are cached for a day; requests are made only when a user asks for a lookup.
const TR = 'https://portal.registryagency.bg/CR/api/Deeds';
const VIES = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms/BG/vat/';
const DAY = 24 * 3600 * 1000;
const cache = new Map();

async function getJson(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < DAY) return hit.data;
  // The register's API answers 500 without Accept-Language
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'Accept-Language': 'bg', 'User-Agent': 'EspehoERP/1.0 (office@espeho.com)' },
    signal: AbortSignal.timeout(12000),
  });
  if (res.status === 429) throw Object.assign(new Error('busy'), { busy: true });
  // Some searches (e.g. names with a hyphen) come back as an empty 200 — that simply means "nothing found"
  if (res.ok && res.headers.get('content-length') === '0') return null;
  if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error(`Регистърът не отговаря (${res.status})`);
  const data = await res.json();
  cache.set(url, { at: Date.now(), data });
  return data;
}

const text = html => (html || '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');

function fields(deed) {
  const out = {};
  const walk = o => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      if (o.nameCode && o.htmlData && !out[o.nameCode]) out[o.nameCode] = text(o.htmlData);
      Object.values(o).forEach(walk);
    }
  };
  walk(deed.sections);
  return out;
}

// "Държава: …\nОбласт: …\nНаселено място: гр. София, п.к. 1164\nр-н Лозенец\nбул./ул. … Телефон: … Адрес на електронна поща: x@y"
function parseSeat(raw = '') {
  const flat = raw.replace(/\n/g, ' | ');
  const phone = (flat.match(/Телефон:\s*([+\d][\d\s/-]{5,})/) || [])[1]?.trim() || null;
  const email = (flat.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0] || null;
  const website = (flat.match(/Интернет страница:\s*(\S+)/) || [])[1] || null;
  const place = (raw.match(/Населено място:\s*([^,\n|]+)/) || [])[1]?.trim() || null; // "гр. София"
  const postcode = (raw.match(/п\.к\.\s*(\d{4})/) || [])[1] || null;
  const lines = raw.split('\n')
    .filter(l => !/^(Държава|Област):/.test(l))
    .map(l => l.replace(/Населено място:\s*/, '').replace(/Телефон:.*$/, '').replace(/Адрес на електронна поща:.*$/, '')
      .replace(/Интернет страница:.*$/, '').replace(/бул\.\/ул\.\s*/, '').trim())
    .filter(Boolean);
  return { address: lines.join(', ').replace(/\s+,/g, ',') || null, city: place?.replace(/^(гр|с)\.\s*/, '') || null, postcode, phone, email, website };
}

async function searchByName(name) {
  const q = encodeURIComponent(String(name).trim().slice(0, 80));
  const rows = (await getJson(`${TR}/Summary?name=${q}&page=1&pageSize=10`)) || [];
  return rows.filter(r => !r.isPhysical).map(r => ({
    eik: r.ident, name: r.name, full_name: text(r.companyFullName),
    deleted: /заличен/i.test(r.companyFullName || ''),
  }));
}

async function getByEik(eik) {
  const deed = await getJson(`${TR}/${encodeURIComponent(eik)}`);
  if (!deed?.uic) return null;
  const f = fields(deed);
  const seat = parseSeat(f.CR_F_5_L);
  const manager = (f.CR_F_7_L || '').split('\n')[0].split(',')[0].trim() || null;
  return {
    eik: deed.uic,
    name: f.CR_F_2_L || deed.companyName,
    full_name: deed.fullName ? text(deed.fullName).replace(/\s*-\s*Заличен търговец\/ЮЛНЦ\s*$/i, '') : null,
    legal_form: f.CR_F_3_L || null,
    activity: f.CR_F_6_L ? f.CR_F_6_L.slice(0, 300) : null,
    manager,
    // Warn only when the record itself mentions liquidation / termination / insolvency / deletion
    closed: /заличен/i.test(deed.fullName || '')
      || Object.entries(f).some(([k, v]) => k !== 'CR_F_6_L' && /ликвидац|прекратяван|несъстоятелност|заличаван/i.test(v)),
    ...seat,
  };
}

async function vies(eik) {
  try {
    const d = await getJson(VIES + encodeURIComponent(eik));
    return { vat_registered: !!d.isValid, vat_number: d.isValid ? `BG${eik}` : null, vies_name: d.name !== '---' ? d.name : null, vies_address: d.address !== '---' ? d.address : null };
  } catch {
    return { vat_registered: null };
  }
}

module.exports = { searchByName, getByEik, vies };

// Compare company names ignoring case, quotes, hyphens/dots/spaces and the legal form
const normName = v => String(v || '').toUpperCase()
  .replace(/["„“'”]/g, '').replace(/\s+(ЕООД|ООД|ЕАД|АД|ЕТ|СД|КД|ЕТ)$/, '')
  .replace(/[\s.\-–_]+/g, '').trim();
module.exports.normName = normName;
