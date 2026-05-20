const Subscription = require('../../models/Subscription');
const { sendCsv, sendHtmlPdf, toCsv } = require('../utils/exporters');

function buildQuery({ q, month }) {
  const query = {};
  if (month) query.effectiveMonth = month; // "YYYY-MM"
  return query;
}

exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { q = '', month } = req.query;

    const query = buildQuery({ q, month });
    let cursor = Subscription.find(query)
      .populate('userId', 'name phone address email')
      .sort({ createdAt: -1 });

    let docs = await cursor;

    if (q) {
      const needle = q.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.userId &&
          ((d.userId.name || '').toLowerCase().includes(needle) ||
            (d.userId.phone || '').toLowerCase().includes(needle) ||
            (d.userId.email || '').toLowerCase().includes(needle))
      );
    }

    const total = docs.length;
    const start = (page - 1) * limit;
    const items = docs.slice(start, start + limit).map((s) => ({
      id: s._id,
      customerName: s.userId?.name || '-',
      phone: s.userId?.phone || '-',
      address: s.userId?.address || '-',
      quantity: s.quantity,
      pricePerLitre: s.pricePerLitre,
      effectiveMonth: s.effectiveMonth,
      selectedDates: s.selectedDates,
      cancelledDates: s.cancelledDates,
      alteredQuantities: s.alteredQuantities,
      status: s.status,
      createdAt: s.createdAt,
    }));

    res.json({ total, page, limit, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
};

const cols = [
  { key: 'customerName', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'quantity', label: 'Qty (L)' },
  { key: 'effectiveMonth', label: 'Month' },
  { key: 'status', label: 'Status' },
  { key: 'selectedDates', label: 'Selected Dates', value: (r) => (r.selectedDates || []).map((d) => new Date(d).toISOString().slice(0, 10)).join('; ') },
  { key: 'cancelledDates', label: 'Cancelled Dates', value: (r) => (r.cancelledDates || []).map((d) => new Date(d).toISOString().slice(0, 10)).join('; ') },
  { key: 'alteredQuantities', label: 'Altered', value: (r) => (r.alteredQuantities || []).map((a) => `${new Date(a.date).toISOString().slice(0, 10)}:${a.quantity}`).join('; ') },
];

async function fetchAll(req) {
  const { q = '', month } = req.query;
  let docs = await Subscription.find(buildQuery({ q, month })).populate('userId', 'name phone address email').sort({ createdAt: -1 });
  if (q) {
    const n = q.toLowerCase();
    docs = docs.filter((d) => d.userId && ((d.userId.name || '').toLowerCase().includes(n) || (d.userId.phone || '').toLowerCase().includes(n)));
  }
  return docs.map((s) => ({
    customerName: s.userId?.name || '-',
    phone: s.userId?.phone || '-',
    address: s.userId?.address || '-',
    quantity: s.quantity,
    effectiveMonth: s.effectiveMonth,
    status: s.status,
    selectedDates: s.selectedDates,
    cancelledDates: s.cancelledDates,
    alteredQuantities: s.alteredQuantities,
  }));
}

exports.exportCsv = async (req, res) => {
  const rows = await fetchAll(req);
  sendCsv(res, 'subscriptions', toCsv(rows, cols));
};

exports.exportPdf = async (req, res) => {
  const rows = await fetchAll(req);
  sendHtmlPdf(res, 'Subscriptions', rows, cols);
};
