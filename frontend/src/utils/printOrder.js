import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

function fmt(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'd MMM yyyy', { locale: bg }) } catch { return d }
}

function fmtNum(n) {
  return n != null ? Number(n).toFixed(2) : '0.00'
}

const STATUS_BG = {
  'НОВА': '#3b82f6', 'МАТЕРИАЛИ': '#f59e0b', 'ПРОИЗВОДСТВО': '#8b5cf6',
  'ГОТОВА': '#10b981', 'ДОСТАВЕНА': '#6b7280', 'ОТКАЗАНА': '#ef4444',
}

const STAGE_STATUS_BG = {
  'ИЗЧАКВА': '#6b7280', 'В_ПРОЦЕС': '#f59e0b', 'ГОТОВ': '#10b981', 'ПРОПУСНАТ': '#9ca3af',
}

export function printWorkOrder(order) {
  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<title>Производствен лист — ${order.order_number}</title>
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
  .stages-grid { display: flex; flex-direction: column; gap: 4px; }
  .stage-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; }
  .stage-num { width: 20px; height: 20px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; flex-shrink: 0; }
  .stage-name { flex: 1; font-weight: 500; }
  .stage-worker { color: #555; font-size: 10px; }
  .stage-cb { width: 14px; height: 14px; border: 1.5px solid #6b7280; border-radius: 2px; flex-shrink: 0; }
  .stage-done .stage-cb { background: #10b981; border-color: #10b981; }
  .stage-done .stage-cb::after { content: '✓'; display: block; text-align: center; color: white; font-size: 9px; line-height: 14px; }
  .notes-box { border: 1px solid #d1d5db; border-radius: 4px; padding: 8px; min-height: 40px; color: #333; }
  .signature-row { display: flex; gap: 30px; margin-top: 20px; }
  .sig-box { flex: 1; border-top: 1px solid #999; padding-top: 4px; font-size: 10px; color: #666; }
  .urgent { background: #fef2f2; border: 2px solid #ef4444; border-radius: 4px; padding: 4px 10px; color: #ef4444; font-weight: bold; font-size: 11px; }
  @media print { body { padding: 10mm; } button { display: none !important; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">🏭 ЕСПЕХО ООД</div>
    <div style="color:#666;font-size:11px;margin-top:2px;">Производствен лист</div>
  </div>
  <div style="text-align:right">
    <h1>${order.order_number}</h1>
    <div style="margin-top:4px;">
      <span class="badge" style="background:${STATUS_BG[order.status] || '#6b7280'}">${order.status}</span>
      ${order.is_urgent ? ' <span class="urgent">🔴 СПЕШНА</span>' : ''}
    </div>
    <div style="font-size:10px;color:#666;margin-top:4px;">Отпечатано: ${format(new Date(), 'd MMM yyyy HH:mm', { locale: bg })}</div>
  </div>
</div>

<h2>Информация за поръчката</h2>
<div class="meta-grid">
  <div class="meta-item"><span class="meta-label">Клиент:</span><strong>${order.client_name}</strong></div>
  <div class="meta-item"><span class="meta-label">Тип:</span>${order.order_type}</div>
  <div class="meta-item"><span class="meta-label">Телефон:</span>${order.client_phone || '—'}</div>
  <div class="meta-item"><span class="meta-label">Краен срок:</span>${fmt(order.deadline)}</div>
  <div class="meta-item"><span class="meta-label">Адрес:</span>${order.delivery_address || '—'}</div>
  <div class="meta-item"><span class="meta-label">Създадена:</span>${fmt(order.created_at)} от ${order.created_by_name}</div>
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
      <th>Кол.</th>
      <th>Бележки</th>
    </tr>
  </thead>
  <tbody>
    ${order.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${it.product_desc || it.product_type}</td>
      <td>${it.width || '—'}</td>
      <td>${it.height || '—'}</td>
      <td><strong>${it.qty}</strong></td>
      <td>${it.notes || ''}</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}

<h2>Производствени етапи</h2>
<div class="stages-grid">
  ${(order.stages || []).map((s, i) => `
  <div class="stage-row ${s.status === 'ГОТОВ' ? 'stage-done' : ''}">
    <div class="stage-num">${i + 1}</div>
    <div class="stage-name">${s.stage_name}</div>
    <span style="font-size:10px;background:${STAGE_STATUS_BG[s.status] || '#e5e7eb'};color:${s.status === 'ИЗЧАКВА' ? '#6b7280' : 'white'};padding:1px 6px;border-radius:999px;">${s.status.replace('_',' ')}</span>
    ${s.worker_name ? `<span class="stage-worker">👷 ${s.worker_name}</span>` : ''}
    <div class="stage-cb">${s.status === 'ГОТОВ' ? '<span style="display:block;text-align:center;color:white;font-size:9px;line-height:14px;">✓</span>' : ''}</div>
  </div>`).join('')}
  ${order.stages?.length === 0 ? '<div style="color:#999;padding:8px;">Няма добавени етапи</div>' : ''}
</div>

<h2>Бележки</h2>
<div class="notes-box">${order.notes || 'Няма бележки'}</div>

<div class="signature-row">
  <div class="sig-box">Производство: _________________________</div>
  <div class="sig-box">Контрол: _________________________</div>
  <div class="sig-box">Дата: _________________________</div>
</div>

<div style="text-align:center;margin-top:10px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">🖨️ Принтирай / Свали PDF</button>
</div>

</body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}

export function printDeliveryNote(order) {
  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<title>Доставателна бележка — ${order.order_number}</title>
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
  .total-row td { font-weight: bold; background: #f9fafb; }
  .signature-row { display: flex; gap: 30px; margin-top: 24px; }
  .sig-box { flex: 1; border-top: 1px solid #999; padding-top: 4px; font-size: 10px; color: #666; }
  @media print { body { padding: 10mm; } button { display: none !important; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">🏭 ЕСПЕХО ООД</div>
    <div style="color:#666;font-size:11px;margin-top:2px;">Доставателна бележка</div>
    <div style="color:#333;font-size:13px;font-weight:bold;margin-top:6px;">№ ${order.order_number}</div>
  </div>
  <div style="text-align:right;font-size:11px;color:#555;">
    <div>Дата: <strong>${fmt(new Date().toISOString())}</strong></div>
    <div style="margin-top:4px;">ЕСПЕХО ООД</div>
    <div>тел: +359 ...</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <h3>Доставя се на</h3>
    <div class="info-line"><strong>${order.client_name}</strong></div>
    <div class="info-line">${order.client_phone || ''}</div>
    <div class="info-line">${order.client_email || ''}</div>
    ${order.delivery_address ? `<div class="info-line" style="margin-top:4px;">${order.delivery_address}</div>` : ''}
  </div>
  <div class="info-box">
    <h3>Детайли</h3>
    <div class="info-line">Поръчка: <strong>${order.order_number}</strong></div>
    <div class="info-line">Тип: ${order.order_type}</div>
    <div class="info-line">Краен срок: ${fmt(order.deadline)}</div>
  </div>
</div>

<h2>Доставени стоки</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Описание</th>
      <th>Ш (мм)</th>
      <th>В (мм)</th>
      <th>Кол.</th>
      ${order.sale_price ? '<th>Ед. цена</th><th>Сума</th>' : ''}
    </tr>
  </thead>
  <tbody>
    ${(order.items || []).map((it, i) => {
      const lineTotal = it.unit_price && it.qty ? (Number(it.unit_price) * Number(it.qty)).toFixed(2) : null
      return `<tr>
      <td>${i + 1}</td>
      <td>${it.product_desc || it.product_type}</td>
      <td>${it.width || '—'}</td>
      <td>${it.height || '—'}</td>
      <td>${it.qty}</td>
      ${order.sale_price ? `<td>${it.unit_price ? fmtNum(it.unit_price) + ' €' : '—'}</td><td>${lineTotal ? lineTotal + ' €' : '—'}</td>` : ''}
    </tr>`}).join('')}
    ${order.items?.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:#999;">Няма позиции</td></tr>` : ''}
    ${order.sale_price ? `<tr class="total-row"><td colspan="${order.items?.length > 0 && order.items[0].unit_price ? 5 : 5}" style="text-align:right;">Общо:</td><td colspan="2"><strong>${fmtNum(order.sale_price)} €</strong></td></tr>` : ''}
  </tbody>
</table>

<div style="border:1px solid #d1d5db;border-radius:6px;padding:8px;min-height:40px;margin-bottom:14px;">
  <strong style="font-size:10px;color:#666;text-transform:uppercase;">Бележки:</strong>
  <div style="margin-top:4px;">${order.notes || 'Без бележки'}</div>
</div>

<div class="signature-row">
  <div class="sig-box">Предал: _________________________<br/>Дата: _______________</div>
  <div class="sig-box">Получил: _________________________<br/>Дата: _______________</div>
</div>

<div style="text-align:center;margin-top:16px;font-size:10px;color:#999;">
  Документът е генериран от ЕСПЕХО ERP система
</div>

<div style="text-align:center;margin-top:10px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">🖨️ Принтирай / Свали PDF</button>
</div>

</body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}
