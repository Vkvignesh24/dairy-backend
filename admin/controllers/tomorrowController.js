const { getDeliveriesForDate, getTomorrowDate } = require('../services/deliveryService');
const { sendCsv, sendHtmlPdf, toCsv } = require('../utils/exporters');

function targetFromQuery(req) {
  if (req.query.date) {
    const d = new Date(req.query.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return getTomorrowDate();
}

exports.list = async (req, res) => {
  try {
    const date = targetFromQuery(req);
    const data = await getDeliveriesForDate(date);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load tomorrow deliveries' });
  }
};

const cols = [
  { key: 'customerName', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'quantity', label: 'Qty (L)' },
  { key: 'bottleSplit', label: 'Bottle Split' },
  { key: 'notes', label: 'Notes' },
];

exports.exportCsv = async (req, res) => {
  const data = await getDeliveriesForDate(targetFromQuery(req));
  sendCsv(res, `deliveries-${data.date.toISOString().slice(0, 10)}`, toCsv(data.deliveries, cols));
};

exports.exportPdf = async (req, res) => {

  const data =
    await getDeliveriesForDate(
      targetFromQuery(req)
    );

  const counts = data.totalBottleCounts;

  const summary =
    `${counts['1L']} x 1L, ` +
    `${counts['500ml']} x 500ml, ` +
    `${counts['250ml']} x 250ml`;

  sendHtmlPdf(
    res,
    `Deliveries — ${data.date.toISOString().slice(0, 10)
    } | Customers: ${data.totalCustomers
    } | Milk: ${data.totalQuantity
    }L | Bottles: ${summary}`,
    data.deliveries,
    cols
  );
};
