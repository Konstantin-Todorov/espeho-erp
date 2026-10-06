import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { TYPE_LABELS, SOURCE_LABELS, orderNo, dateBg, num } from './labels'
import { priceLine } from './pricing'

// Everything users typed (names, descriptions, notes…) is escaped before it goes into the print HTML
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const fmt = d => esc(dateBg(d))
const fmtNum = n => (n != null && n !== '' ? Number(n).toFixed(2) : '0.00')
const typeLabel = t => esc(TYPE_LABELS[t] || t || '—')
const UOM_UNITS = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: '' }

const STATUS_BG = {
  'НОВА': '#3b82f6', 'МАТЕРИАЛИ': '#f59e0b', 'ПРОИЗВОДСТВО': '#8b5cf6',
  'ГОТОВА': '#10b981', 'ДОСТАВЕНА': '#6b7280', 'ОТКАЗАНА': '#ef4444',
}
const STAGE_STATUS_BG = {
  'ЧАКАЩ': '#e5e7eb', 'В_ПРОЦЕС': '#f59e0b', 'ГОТОВ': '#10b981', 'ПРОПУСНАТ': '#9ca3af',
}
const STAGE_LABELS = { 'ЧАКАЩ': 'Чакащ', 'В_ПРОЦЕС': 'В процес', 'ГОТОВ': 'Готов', 'ПРОПУСНАТ': 'Пропуснат' }

// Line total as stored by the server; older lines without it are computed the same way
const lineTotal = (it, settings) => {
  if (it.line_total !== null && it.line_total !== undefined && it.line_total !== '') return Number(it.line_total)
  return priceLine(it, settings).total
}

function openPrint(html) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return alert('Браузърът блокира прозореца за печат — разрешете изскачащите прозорци.')
  win.document.write(html)
  win.document.close()
}

export function printWorkOrder(order) {
  const no = esc(orderNo(order))
  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<title>Производствен лист — ${no}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 20mm; background: white; }
  h1 { font-size: 20px; font-weight: bold; margin-bottom: 2px; }
  h2 { font-size: 13px; font-weight: bold; margin: 16px 0 6px; border-bottom: 1.5px solid #111; padding-bottom: 3px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .logo { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 14px; }
  .meta-item { display: flex; gap: 6px; }
  .meta-label { color: #666; min-width: 90px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; color: white; font-size: 10px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
  th { background: #f3f4f6; text-align: left; padding: 5px 8px; font-size: 10px; text-transform: uppercase; border: 1px solid #d1d5db; }
  td { padding: 5px 8px; border: 1px solid #d1d5db; }
  tr:nth-child(even) td { background: #f9fafb; }
  .sub { color: #666; font-size: 10px; }
  .stages-grid { display: flex; flex-direction: column; gap: 4px; }
  .stage-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; }
  .stage-num { width: 20px; height: 20px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; flex-shrink: 0; }
  .stage-name { flex: 1; font-weight: 500; }
  .stage-worker { color: #555; font-size: 10px; }
  .stage-cb { width: 14px; height: 14px; border: 1.5px solid #6b7280; border-radius: 2px; flex-shrink: 0; }
  .stage-done .stage-cb { background: #10b981; border-color: #10b981; }
  .notes-box { border: 1px solid #d1d5db; border-radius: 4px; padding: 8px; min-height: 40px; color: #333; white-space: pre-wrap; }
  .signature-row { display: flex; gap: 30px; margin-top: 20px; }
  .sig-box { flex: 1; border-top: 1px solid #999; padding-top: 4px; font-size: 10px; color: #666; }
  .urgent { background: #fef2f2; border: 2px solid #ef4444; border-radius: 4px; padding: 4px 10px; color: #ef4444; font-weight: bold; font-size: 11px; }
  @media print { body { padding: 10mm; } button { display: none !important; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">ЕСПЕХО ООД</div>
    <div style="color:#666;font-size:11px;margin-top:2px;">Производствен лист</div>
  </div>
  <div style="text-align:right">
    <h1>${no}</h1>
    ${order.external_ref ? `<div class="sub">вътрешен #${esc(order.order_number)}</div>` : ''}
    <div style="margin-top:4px;">
      <span class="badge" style="background:${STATUS_BG[order.status] || '#6b7280'}">${esc(order.status)}</span>
      ${order.is_urgent ? ' <span class="urgent">СПЕШНА</span>' : ''}
    </div>
    <div style="font-size:10px;color:#666;margin-top:4px;">Отпечатано: ${format(new Date(), 'd MMM yyyy HH:mm', { locale: bg })}</div>
  </div>
</div>

<h2>Информация за поръчката</h2>
<div class="meta-grid">
  <div class="meta-item"><span class="meta-label">Клиент:</span><strong>${esc(order.client_name)}</strong></div>
  <div class="meta-item"><span class="meta-label">Вид:</span>${typeLabel(order.order_type)}</div>
  <div class="meta-item"><span class="meta-label">Телефон:</span>${esc(order.client_phone || '—')}</div>
  <div class="meta-item"><span class="meta-label">Краен срок:</span>${fmt(order.deadline)}</div>
  <div class="meta-item"><span class="meta-label">Адрес:</span>${esc(order.delivery_address || '—')}</div>
  <div class="meta-item"><span class="meta-label">Създадена:</span>${fmt(order.created_at)}${order.created_by_name ? ` от ${esc(order.created_by_name)}` : ''}</div>
  ${order.source ? `<div class="meta-item"><span class="meta-label">Канал:</span>${esc(SOURCE_LABELS[order.source] || order.source)}</div>` : ''}
</div>

${order.items?.length > 0 ? `
<h2>Позиции</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Описание</th>
      <th>Ш (мм)</th>
      <th>В (мм)</th>
      <th>Бр.</th>
      <th>Бележки</th>
    </tr>
  </thead>
  <tbody>
    ${order.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(it.product_desc || TYPE_LABELS[it.product_type] || it.product_type)}${it.product_desc && it.product_type ? `<div class="sub">${typeLabel(it.product_type)}</div>` : ''}</td>
      <td>${esc(it.width || '—')}</td>
      <td>${esc(it.height || '—')}</td>
      <td><strong>${esc(it.qty)}</strong></td>
      <td>${esc(it.notes || '')}</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}

<h2>Производствени етапи</h2>
<div class="stages-grid">
  ${(order.stages || []).map((s, i) => `
  <div class="stage-row ${s.status === 'ГОТОВ' ? 'stage-done' : ''}">
    <div class="stage-num">${i + 1}</div>
    <div class="stage-name">${esc(s.stage_name)}</div>
    <span style="font-size:10px;background:${STAGE_STATUS_BG[s.status] || '#e5e7eb'};color:${s.status === 'ЧАКАЩ' ? '#374151' : 'white'};padding:1px 6px;border-radius:999px;">${esc(STAGE_LABELS[s.status] || s.status)}</span>
    ${s.worker_name ? `<span class="stage-worker">${esc(s.worker_name)}</span>` : ''}
    <div class="stage-cb">${s.status === 'ГОТОВ' ? '<span style="display:block;text-align:center;color:white;font-size:9px;line-height:14px;">✓</span>' : ''}</div>
  </div>`).join('')}
  ${!order.stages?.length ? '<div style="color:#999;padding:8px;">Няма добавени етапи</div>' : ''}
</div>

<h2>Бележки</h2>
<div class="notes-box">${esc(order.notes || 'Няма бележки')}</div>

<div class="signature-row">
  <div class="sig-box">Производство: _________________________</div>
  <div class="sig-box">Контрол: _________________________</div>
  <div class="sig-box">Дата: _________________________</div>
</div>

<div style="text-align:center;margin-top:10px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Принтирай / Свали PDF</button>
</div>

</body></html>`

  openPrint(html)
}

export function printDeliveryNote(order, settings = {}) {
  const no = esc(orderNo(order))
  // Prices only when the server sent them (admin/office)
  const withPrices = order.sale_price !== undefined && order.sale_price !== null
  const items = order.items || []
  const cols = withPrices ? 8 : 6
  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<title>Доставателна бележка — ${no}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 20mm; background: white; }
  h1 { font-size: 20px; font-weight: bold; margin-bottom: 2px; }
  h2 { font-size: 13px; font-weight: bold; margin: 16px 0 6px; border-bottom: 1.5px solid #111; padding-bottom: 3px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .logo { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
  .info-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; }
  .info-box h3 { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 6px; }
  .info-line { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; border: 1px solid #d1d5db; }
  td { padding: 6px 8px; border: 1px solid #d1d5db; }
  td.r, th.r { text-align: right; }
  .total-row td { font-weight: bold; background: #f9fafb; }
  .signature-row { display: flex; gap: 30px; margin-top: 24px; }
  .sig-box { flex: 1; border-top: 1px solid #999; padding-top: 4px; font-size: 10px; color: #666; }
  @media print { body { padding: 10mm; } button { display: none !important; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">ЕСПЕХО ООД</div>
    <div style="color:#666;font-size:11px;margin-top:2px;">Доставателна бележка</div>
    <div style="color:#333;font-size:13px;font-weight:bold;margin-top:6px;">№ ${no}</div>
  </div>
  <div style="text-align:right;font-size:11px;color:#555;">
    <div>Дата: <strong>${fmt(new Date())}</strong></div>
    <div style="margin-top:4px;">ЕСПЕХО ООД</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <h3>Доставя се на</h3>
    <div class="info-line"><strong>${esc(order.client_name)}</strong></div>
    ${order.client_phone ? `<div class="info-line">${esc(order.client_phone)}</div>` : ''}
    ${order.client_email ? `<div class="info-line">${esc(order.client_email)}</div>` : ''}
    ${order.delivery_address ? `<div class="info-line" style="margin-top:4px;">${esc(order.delivery_address)}</div>` : ''}
  </div>
  <div class="info-box">
    <h3>Детайли</h3>
    <div class="info-line">Поръчка: <strong>${no}</strong></div>
    <div class="info-line">Вид: ${typeLabel(order.order_type)}</div>
    <div class="info-line">Краен срок: ${fmt(order.deadline)}</div>
  </div>
</div>

<h2>Доставени стоки</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Описание</th>
      <th class="r">Ш (мм)</th>
      <th class="r">В (мм)</th>
      <th class="r">Бр.</th>
      <th class="r">Количество</th>
      ${withPrices ? '<th class="r">Ед. цена</th><th class="r">Сума</th>' : ''}
    </tr>
  </thead>
  <tbody>
    ${items.map((it, i) => {
      const uom = it.uom || 'm2'
      const p = priceLine(it, settings)
      const billed = it.billed_qty ?? p.billed
      const lt = withPrices ? lineTotal(it, settings) : null
      return `<tr>
      <td>${i + 1}</td>
      <td>${esc(it.product_desc || TYPE_LABELS[it.product_type] || it.product_type)}</td>
      <td class="r">${esc(it.width || '—')}</td>
      <td class="r">${esc(it.height || '—')}</td>
      <td class="r">${esc(it.qty)}</td>
      <td class="r">${uom === 'fixed' || billed == null ? '—' : `${esc(num(billed, 3))} ${UOM_UNITS[uom] || ''}`}</td>
      ${withPrices ? `<td class="r">${it.unit_price != null && it.unit_price !== '' ? fmtNum(it.unit_price) + ' €' : '—'}</td><td class="r">${lt != null ? fmtNum(lt) + ' €' : '—'}</td>` : ''}
    </tr>`
    }).join('')}
    ${items.length === 0 ? `<tr><td colspan="${cols}" style="text-align:center;color:#999;">Няма позиции</td></tr>` : ''}
    ${withPrices ? `<tr class="total-row"><td colspan="${cols - 1}" style="text-align:right;">Общо (с ДДС):</td><td class="r"><strong>${fmtNum(order.sale_price)} €</strong></td></tr>` : ''}
  </tbody>
</table>

<div style="border:1px solid #d1d5db;border-radius:6px;padding:8px;min-height:40px;margin-bottom:14px;">
  <strong style="font-size:10px;color:#666;text-transform:uppercase;">Бележки:</strong>
  <div style="margin-top:4px;white-space:pre-wrap;">${esc(order.notes || 'Без бележки')}</div>
</div>

<div class="signature-row">
  <div class="sig-box">Предал: _________________________<br/>Дата: _______________</div>
  <div class="sig-box">Получил: _________________________<br/>Дата: _______________</div>
</div>

<div style="text-align:center;margin-top:16px;font-size:10px;color:#999;">
  Документът е генериран от ЕСПЕХО ERP система
</div>

<div style="text-align:center;margin-top:10px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Принтирай / Свали PDF</button>
</div>

</body></html>`

  openPrint(html)
}
