// Pure backend delivery calculation. Frontend never computes this.
const Subscription = require('../../models/Subscription');

function sameDay(a, b) {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

function isDateIn(list, date) {
  return (list || []).some((d) => sameDay(d, date));
}

function alteredFor(list, date) {
  const found = (list || []).find((a) => sameDay(a.date, date));
  return found ? found.quantity : null;
}

// Build bottle split text e.g. "2 x 1L + 1 x 500ml"
function bottleSplit(qtyLitres) {
  let q = Math.round(qtyLitres * 1000); // millilitres
  const parts = [];
  const sizes = [1000, 500, 250];
  for (const s of sizes) {
    const c = Math.floor(q / s);
    if (c > 0) {
      parts.push(`${c} x ${s >= 1000 ? s / 1000 + 'L' : s + 'ml'}`);
      q -= c * s;
    }
  }
  return parts.length ? parts.join(' + ') : '-';
}

function bottleCounts(qtyLitres) {

  let q = Math.round(qtyLitres * 1000);

  const result = {
    '1L': 0,
    '500ml': 0,
    '250ml': 0,
  };

  const sizes = [1000, 500, 250];

  for (const s of sizes) {

    const count = Math.floor(q / s);

    if (count > 0) {

      if (s === 1000) {
        result['1L'] += count;
      }

      if (s === 500) {
        result['500ml'] += count;
      }

      if (s === 250) {
        result['250ml'] += count;
      }

      q -= count * s;
    }
  }

  return result;
}

// CUTOFF: 5 PM previous day. If we are past 5 PM, "tomorrow" = day+1; before 5pm we still allow tomorrow.
function getTomorrowDate(now = new Date()) {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

async function getDeliveriesForDate(targetDate) {

  const day = new Date(targetDate);

  day.setHours(0, 0, 0, 0);

  const subs = await Subscription.find({
    status: 'active'
  }).populate(
    'userId',
    'name phone address'
  );

  const rows = [];

  let totalQty = 0;

  const totalBottleCounts = {
    '1L': 0,
    '500ml': 0,
    '250ml': 0,
  };

  for (const s of subs) {

    if (!s.userId) continue;

    if (!isDateIn(s.selectedDates, day)) continue;

    if (isDateIn(s.cancelledDates, day)) continue;

    const altered =
      alteredFor(s.alteredQuantities, day);

    const qty =
      altered != null
        ? altered
        : s.quantity;

    if (qty <= 0) continue;

    const counts = bottleCounts(qty);

    totalBottleCounts['1L'] += counts['1L'];
    totalBottleCounts['500ml'] += counts['500ml'];
    totalBottleCounts['250ml'] += counts['250ml'];

    rows.push({
      subscriptionId: s._id,
      customerName: s.userId.name,
      phone: s.userId.phone,
      address: s.userId.address,
      quantity: qty,
      bottleSplit: bottleSplit(qty),
      notes:
        altered != null
          ? 'Altered quantity'
          : '',
    });

    totalQty += qty;
  }

  return {
    date: day,
    totalCustomers: rows.length,
    totalQuantity: Number(totalQty.toFixed(2)),
    totalBottleCounts,
    deliveries: rows,
  };
}

module.exports = {
  getDeliveriesForDate,
  getTomorrowDate,
  bottleSplit,
  bottleCounts,
  sameDay,
  isDateIn,
  alteredFor,
};
