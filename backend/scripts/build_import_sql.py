#!/usr/bin/env python3
"""
Builds migration 012 from the office spreadsheet (ПОРЪЧКИ 2026-ЕВРО.xlsx, sheet "Sheet1").

Spreadsheet layout (one order = one header row + following rows until the next header):
  A Дата (= order number, e.g. 326-00160)   B Дата2 (order date dd,mm,yyyy)   C Краен срок
  D ОФИС (client — or a channel word: ОФИС / М-Ж = монтаж / Д-КА = доставка)
  E Стъклопакет (Единичен/Двоен/Троен — inherited by following rows when blank)
  F Видове (glass build-up / service — inherited when blank)   G mm (thickness OR a free-text note)
  H height mm   I width mm   J БР qty   K М2 billable area of the whole line (min applied per pane)   L ЛМ perimeter
  M М22 billed quantity   N ЦЕНА unit price (с ДДС)   O КРАЙНА ЦЕНА line total (с ДДС)
  U СЕБЕСТОЙНОСТ cost (без ДДС)
The first product line sits on the header row itself. Dealer orders often carry the whole order's
billed m² and total on the first line with 0 on the rest — summing column O per order is correct.

Usage: python3 build_import_sql.py <xlsx> <out.sql>
"""
import sys, re, datetime
import openpyxl

SRC, OUT = sys.argv[1], sys.argv[2]
DATE_MIN, DATE_MAX = datetime.date(2025, 11, 1), datetime.date(2026, 7, 31)
WALKIN = 'КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)'
CHANNEL_ONLY = {'', 'ОФИС', 'ОТ ЦЕХ', 'ЦЕХ', 'М-Ж', 'Д-КА', 'МЖ', 'ДКА'}
CLAIM_RE = re.compile(r'РЕКЛАМАЦ|СЧУП|ИЗПУС|ПЕТН|ДОПЪЛН', re.I)


def num(x):
    if x is None or x == '':
        return None
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).strip().replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None


def parse_date(x):
    if x is None or str(x).strip() == '':
        return None
    if isinstance(x, datetime.datetime):
        return x.date()
    m = re.match(r'^\s*(\d{1,2})[,./](\d{1,2})[,./](\d{2,4})\s*$', str(x))
    if not m:
        return None
    d, mo, y = int(m.group(1)), int(m.group(2)), m.group(3)
    y = {'206': 2026, '26': 2026, '25': 2025, '0260': 2026, '2029': 2026}.get(y, int(y) if y.isdigit() else 0)
    try:
        return datetime.date(y, mo, d)
    except ValueError:
        return None


def norm_client(raw):
    """Returns (client_name, fulfillment, urgent)."""
    s = re.sub(r'\s+', ' ', str(raw or '').strip().upper())
    urgent = False
    if s.startswith('СПЕШЕН') or s.startswith('СПЕШНО'):
        urgent, s = True, re.sub(r'^СПЕШН?[ЕО]?Н?\s*', '', s).strip()
    fulfillment = 'вземане'
    m = re.match(r'^(М-Ж|МЖ|Д-КА|ДКА)\b[\s\-.:]*(.*)$', s)
    if m:
        fulfillment = 'монтаж' if m.group(1) in ('М-Ж', 'МЖ') else 'доставка'
        s = m.group(2).strip()
    if s in CHANNEL_ONLY:
        s = WALKIN
    return s[:200], fulfillment, urgent


def item_type(t):
    t = (t or '').strip().upper()
    if t.startswith('ДВО') or t.startswith('ТРО'):
        return 'стъклопакет'
    if t.startswith('ЕДИН'):
        return 'единично_стъкло'
    return 'друго'


def q(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return repr(round(v, 4))
    if isinstance(v, datetime.date):
        return f"'{v.isoformat()}'"
    return "'" + str(v).replace("'", "''") + "'"


ws = openpyxl.load_workbook(SRC, data_only=True, read_only=True)['Sheet1']
rows = list(ws.iter_rows(values_only=True))[1:]

orders, cur, last_date = [], None, None
for r in rows:
    r = list(r) + [None] * (23 - len(r))
    if r[0] not in (None, ''):
        ref = str(r[0]).strip()
        if isinstance(r[0], float) and r[0].is_integer():
            ref = str(int(r[0]))
        d = parse_date(r[1])
        inferred = d is None or not (DATE_MIN <= d <= DATE_MAX)
        if inferred:
            d = last_date or DATE_MIN
        else:
            last_date = d
        dl = parse_date(r[2])
        if dl and not (d <= dl <= d + datetime.timedelta(days=120)):
            dl = None
        client, fulfillment, urgent = norm_client(r[3])
        cur = dict(ref=ref[:50], date=d, deadline=dl, client=client, fulfillment=fulfillment,
                   urgent=urgent, inferred=inferred, raw_office=str(r[3] or '').strip(), lines=[],
                   last_type=None, last_desc=None)
        orders.append(cur)
    if cur is None:
        continue
    ptype, desc, mm = r[4], r[5], r[6]
    h, w, qty = num(r[7]), num(r[8]), num(r[9])
    area, lm, billed, price, total, cost = num(r[10]), num(r[11]), num(r[12]), num(r[13]), num(r[14]), num(r[20])
    mm_num = num(mm)
    note = None if (mm is None or str(mm).strip() == '' or mm_num is not None) else str(mm).strip()
    has_content = any([desc, note, (h or 0) > 0, (w or 0) > 0, price, total, cost])
    if not has_content:
        continue
    if ptype not in (None, ''):
        cur['last_type'] = str(ptype).strip()
    if desc not in (None, ''):
        cur['last_desc'] = str(desc).strip()
    t = cur['last_type'] if (ptype in (None, '') and (h or w)) else (str(ptype).strip() if ptype else None)
    d_text = str(desc).strip() if desc not in (None, '') else (cur['last_desc'] if (h or w) else None)
    if not d_text:
        d_text = note or 'Услуга / артикул'
    qty = qty if qty and qty > 0 else 1
    if billed is None or billed == 0:
        uom, billed_q = ('m2', area) if (h and w) else ('pcs', qty)
    elif area is not None and abs(billed - area) < 0.011:
        uom, billed_q = 'm2', billed
    elif lm is not None and abs(billed - lm) < 0.011:
        uom, billed_q = 'lm', billed
    elif not (h and w):
        uom, billed_q = ('pcs', billed)
    else:
        uom, billed_q = 'm2', billed  # aggregate billed m² for the whole order on the first line
    cur['lines'].append(dict(
        type=item_type(t), desc=d_text[:2000], note=note[:500] if note and note != d_text else None,
        thickness=mm_num if mm_num and 3 <= mm_num <= 80 else None,
        w=w if w and w > 0 else None, h=h if h and h > 0 else None, qty=qty,
        # Column K is the billable area of the whole line (all pieces); the ERP stores it per piece
        area=round(area / qty, 4) if area else None,
        uom=uom, billed=billed_q, price=price, total=round(total or 0, 2), cost=cost))

out = []
for i, o in enumerate(orders):
    lines = o['lines']
    sale = round(sum(l['total'] for l in lines), 2)
    cost = round(sum(l['cost'] or 0 for l in lines), 2)
    types = {l['type'] for l in lines if l['type'] != 'друго'}
    otype = types.pop() if len(types) == 1 else 'смесена'
    notes_txt = ' · '.join(dict.fromkeys(l['note'] for l in lines if l['note']))
    claim = sale == 0 and bool(CLAIM_RE.search(notes_txt))
    extra = []
    if o['inferred']:
        extra.append('датата е приблизителна (липсва/грешна в таблицата)')
    notes = '; '.join(filter(None, [notes_txt, *extra])) or None
    out.append(dict(seq=i, **{k: o[k] for k in ('ref', 'date', 'deadline', 'client', 'fulfillment', 'urgent')},
                    otype=otype, sale=sale, cost=cost, notes=notes,
                    category='гаранция' if claim else 'нормална', lines=lines))

sql = [f"""-- 012: complete import of the office spreadsheet (ПОРЪЧКИ 2026-ЕВРО) — {len(out)} orders.
-- Generated by backend/scripts/build_import_sql.py. Additive: orders imported earlier (migration 010)
-- are matched by their original number and corrected in place; orders created in the ERP are untouched.

CREATE TEMP TABLE _imp_o (seq INT PRIMARY KEY, ref TEXT, d DATE, deadline DATE, client TEXT, fulfillment TEXT,
  urgent BOOLEAN, otype TEXT, sale NUMERIC, cost NUMERIC, notes TEXT, category TEXT, order_id UUID,
  client_id UUID, protected BOOLEAN NOT NULL DEFAULT false) ON COMMIT DROP;
CREATE TEMP TABLE _imp_i (seq INT, sort INT, ptype TEXT, descr TEXT, note TEXT, thickness NUMERIC, w NUMERIC,
  h NUMERIC, qty NUMERIC, area NUMERIC, uom TEXT, billed NUMERIC, price NUMERIC, total NUMERIC, cost NUMERIC) ON COMMIT DROP;
"""]
for chunk in range(0, len(out), 400):
    vals = [f"({q(o['seq'])},{q(o['ref'])},{q(o['date'])},{q(o['deadline'])},{q(o['client'])},{q(o['fulfillment'])},"
            f"{q(o['urgent'])},{q(o['otype'])},{q(o['sale'])},{q(o['cost'])},{q(o['notes'])},{q(o['category'])})"
            for o in out[chunk:chunk + 400]]
    sql.append("INSERT INTO _imp_o (seq,ref,d,deadline,client,fulfillment,urgent,otype,sale,cost,notes,category) VALUES\n"
               + ",\n".join(vals) + ";")
items = [(o['seq'], j, l) for o in out for j, l in enumerate(o['lines'])]
for chunk in range(0, len(items), 500):
    vals = [f"({s},{j},{q(l['type'])},{q(l['desc'])},{q(l['note'])},{q(l['thickness'])},{q(l['w'])},{q(l['h'])},"
            f"{q(l['qty'])},{q(l['area'])},{q(l['uom'])},{q(l['billed'])},{q(l['price'])},{q(l['total'])},{q(l['cost'])})"
            for s, j, l in items[chunk:chunk + 500]]
    sql.append("INSERT INTO _imp_i (seq,sort,ptype,descr,note,thickness,w,h,qty,area,uom,billed,price,total,cost) VALUES\n"
               + ",\n".join(vals) + ";")

sql.append(r"""
-- 1. Normalise the names of clients created by the first import (upper case, single spaces)
UPDATE clients c SET name = UPPER(REGEXP_REPLACE(TRIM(c.name), '\s+', ' ', 'g'))
 WHERE c.created_at <= (SELECT run_at FROM migrations WHERE filename = '010_import_real_data.sql')
   AND c.name <> UPPER(REGEXP_REPLACE(TRIM(c.name), '\s+', ' ', 'g'))
   AND NOT EXISTS (SELECT 1 FROM clients c2 WHERE c2.id <> c.id
                    AND c2.name = UPPER(REGEXP_REPLACE(TRIM(c.name), '\s+', ' ', 'g')));

-- 2. Resolve each spreadsheet name to a client: known aliases first (merged/renamed clients),
--    then the current name; create the clients that still don't exist
UPDATE _imp_o i SET client_id = a.client_id FROM client_aliases a WHERE a.name_key = i.client;
UPDATE _imp_o i SET client_id = (SELECT c.id FROM clients c
                                  WHERE UPPER(REGEXP_REPLACE(TRIM(c.name), '\s+', ' ', 'g')) = i.client
                                  ORDER BY c.created_at LIMIT 1)
 WHERE i.client_id IS NULL;
INSERT INTO clients (name, source, notes)
SELECT DISTINCT i.client, 'office',
       CASE WHEN i.client = 'КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)' THEN 'Поръчки без име на клиент в таблицата' END
  FROM _imp_o i WHERE i.client_id IS NULL;
UPDATE _imp_o i SET client_id = (SELECT c.id FROM clients c
                                  WHERE UPPER(REGEXP_REPLACE(TRIM(c.name), '\s+', ' ', 'g')) = i.client
                                  ORDER BY c.created_at LIMIT 1)
 WHERE i.client_id IS NULL;

-- 3. Match orders imported earlier by original number (n-th occurrence ↔ n-th occurrence)
WITH ex AS (
  SELECT id, external_ref, ROW_NUMBER() OVER (PARTITION BY external_ref ORDER BY created_at, order_number) rn
    FROM orders WHERE external_ref IS NOT NULL),
im AS (
  SELECT seq, ref, ROW_NUMBER() OVER (PARTITION BY ref ORDER BY d, seq) rn FROM _imp_o)
UPDATE _imp_o i SET order_id = ex.id FROM im JOIN ex ON ex.external_ref = im.ref AND ex.rn = im.rn
 WHERE i.seq = im.seq;

-- Orders the office has already worked with in the ERP (status change, edit, payment) are left untouched
UPDATE _imp_o i SET protected = true
  FROM orders o
 WHERE o.id = i.order_id
   AND (o.updated_by IS NOT NULL
        OR EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id)
        OR EXISTS (SELECT 1 FROM audit_log a WHERE a.table_name = 'orders' AND a.record_id = o.id)
        OR EXISTS (SELECT 1 FROM order_comments m WHERE m.order_id = o.id));

-- 4. Correct the matched orders in place (keep their id / internal number / comments / files)
UPDATE orders o SET
  client_id = i.client_id,
  order_type = i.otype, order_category = i.category, sale_price = i.sale, notes = i.notes,
  deadline = i.deadline, is_urgent = i.urgent, fulfillment = i.fulfillment,
  installation_status = CASE WHEN i.fulfillment = 'монтаж' THEN 'МОНТИРАНА' END,
  created_at = i.d + TIME '10:00', delivered_at = COALESCE(i.deadline, i.d) + TIME '17:00'
FROM _imp_o i WHERE i.order_id = o.id AND NOT i.protected;

DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM _imp_o WHERE order_id IS NOT NULL AND NOT protected);

-- 5. Insert the orders that were missing
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by,
                      deadline, is_urgent, fulfillment, installation_status, payment_status, external_ref,
                      created_at, updated_at, delivered_at)
  SELECT i.client_id,
         i.otype, i.category, 'ДОСТАВЕНА', i.sale, i.notes, 'office',
         (SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1),
         i.deadline, i.urgent, i.fulfillment, CASE WHEN i.fulfillment = 'монтаж' THEN 'МОНТИРАНА' END,
         'платена', i.ref || '#' || i.seq, i.d + TIME '10:00', i.d + TIME '10:00',
         COALESCE(i.deadline, i.d) + TIME '17:00'
    FROM _imp_o i WHERE i.order_id IS NULL ORDER BY i.d, i.seq
  RETURNING id, external_ref)
UPDATE _imp_o i SET order_id = ins.id FROM ins WHERE ins.external_ref = i.ref || '#' || i.seq;

UPDATE orders o SET external_ref = i.ref FROM _imp_o i WHERE o.id = i.order_id AND o.external_ref <> i.ref;

-- 6. Items with stored billed quantity, unit, line total and line cost
INSERT INTO order_items (order_id, product_type, product_desc, notes, thickness_mm, width, height, qty,
                         area_m2, uom, billed_qty, unit_price, line_total, line_cost, sort_order)
SELECT i.order_id, it.ptype, it.descr, it.note, it.thickness, it.w, it.h, it.qty,
       it.area, it.uom, it.billed, it.price, it.total, it.cost, it.sort
  FROM _imp_i it JOIN _imp_o i ON i.seq = it.seq
 WHERE NOT i.protected;

-- 7. Cost cards: spreadsheet cost, no extra overhead
INSERT INTO order_costs (order_id, material_cost, overhead_pct)
SELECT order_id, cost, 0 FROM _imp_o WHERE NOT protected
ON CONFLICT (order_id) DO UPDATE SET material_cost = EXCLUDED.material_cost, overhead_pct = 0, updated_at = NOW();

-- 8. Remove clients from the first import that no longer have any orders or quotations
--    (channel words such as "М-Ж", "ОФИС", "Д-КА" that were wrongly treated as clients)
DELETE FROM clients c
 WHERE c.created_at <= (SELECT run_at FROM migrations WHERE filename = '010_import_real_data.sql')
   AND c.phone IS NULL AND c.email IS NULL AND c.eik IS NULL
   AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.client_id = c.id)
   AND NOT EXISTS (SELECT 1 FROM quotations q WHERE q.client_id = c.id)
   AND NOT EXISTS (SELECT 1 FROM client_aliases a WHERE a.client_id = c.id);

SELECT setval('orders_order_number_seq', (SELECT MAX(order_number) FROM orders));
""")
open(OUT, 'w').write('\n'.join(sql))
print(f'orders={len(out)} items={len(items)} clients={len({o["client"] for o in out})} '
      f'sale={sum(o["sale"] for o in out):.2f} cost={sum(o["cost"] for o in out):.2f} '
      f'inferred_dates={sum(1 for o in orders if o["inferred"])} claims={sum(1 for o in out if o["category"]=="гаранция")}')
