// Single place that decides who may see money. Production and warehouse staff
// must never receive sale prices, costs, margins or wages in any API response.
const FINANCE_ROLES = ['admin', 'office'];

const canSeeMoney = user => FINANCE_ROLES.includes(user?.role);

const ORDER_FIELDS  = ['sale_price', 'total_cost', 'material_cost', 'labor_cost', 'machine_cost',
                       'overhead_cost', 'overhead_pct', 'paid_amount', 'margin', 'revenue', 'total_revenue'];
const ITEM_FIELDS   = ['unit_price', 'line_total'];
const COST_FIELDS   = ['material_cost', 'labor_cost', 'machine_cost', 'overhead_cost', 'overhead_pct', 'total_cost'];
const DEFECT_FIELDS = ['material_cost', 'labor_cost', 'total_cost'];
const LABOR_FIELDS  = ['hourly_rate', 'cost'];

const omit = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  for (const f of fields) delete out[f];
  return out;
};

// Strips financial fields from a row (or array of rows) unless the user may see them.
function stripMoney(user, data, fields = ORDER_FIELDS) {
  if (canSeeMoney(user)) return data;
  return Array.isArray(data) ? data.map(r => omit(r, fields)) : omit(data, fields);
}

// Costs, margins and wages are for the owner (admin) only — the office works with sale prices.
const canSeeCost = user => user?.role === 'admin';
const COST_ONLY = ['total_cost', 'material_cost', 'labor_cost', 'machine_cost', 'overhead_cost', 'overhead_pct',
                   'line_cost', 'cost_rate', 'margin', 'margin_pct', 'cost', 'hourly_rate', 'cost_delivered', 'expenses',
                   'total_material', 'total_labor', 'total_machine', 'total_overhead', 'total_margin', 'profit', 'commission'];

function stripCost(user, data, fields = COST_ONLY) {
  if (canSeeCost(user)) return data;
  return Array.isArray(data) ? data.map(r => omit(r, fields)) : omit(data, fields);
}

module.exports = { canSeeMoney, stripMoney, canSeeCost, stripCost, COST_ONLY,
  ORDER_FIELDS, ITEM_FIELDS, COST_FIELDS, DEFECT_FIELDS, LABOR_FIELDS };
