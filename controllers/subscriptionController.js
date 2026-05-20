const Subscription = require('../models/Subscription');

function normalizeDate(date) {

  const d = new Date(date);

  return `${d.getFullYear()}-${
    String(d.getMonth() + 1).padStart(2, '0')
  }-${
    String(d.getDate()).padStart(2, '0')
  }`;
}

function isValidMonth(month) {

  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

  return monthRegex.test(month);
}


exports.createSubscription = async (req, res) => {

  try {

    const {
      quantity,
      selectedDates = [],
      cancelledDates = [],
      alteredQuantities = [],
      pricePerLitre,
      effectiveMonth,
    } = req.body;

    if (!quantity || quantity < 0.5) {
      return res.status(400).json({
        message: 'Invalid quantity',
      });
    }

    if (!effectiveMonth || !isValidMonth(effectiveMonth)) {
      return res.status(400).json({
        message: 'Invalid effectiveMonth',
      });
    }

    // normalize selected dates
    const normalizedSelected = [
      ...new Set(
        selectedDates.map((d) => normalizeDate(d))
      ),
    ];

    // cancelled must exist inside selected
    const normalizedCancelled = cancelledDates
      .map((d) => normalizeDate(d))
      .filter((d) => normalizedSelected.includes(d));

    // altered must exist inside selected
    const normalizedAltered = alteredQuantities
      .map((item) => ({
        date: normalizeDate(item.date),
        quantity: item.quantity,
      }))
      .filter((item) => normalizedSelected.includes(item.date));

    let sub = await Subscription.findOne({
      userId: req.user._id,
      effectiveMonth,
    });

    if (sub) {

      sub.selectedDates =
        normalizedSelected.map((d) => new Date(d));

      sub.cancelledDates =
        normalizedCancelled.map((d) => new Date(d));

      sub.alteredQuantities =
        normalizedAltered.map((item) => ({
          date: new Date(item.date),
          quantity: item.quantity,
        }));

      await sub.save();

      return res.json({
        subscription: sub,
        message: 'Subscription updated',
      });
    }

    sub = await Subscription.create({
      userId: req.user._id,
      quantity,
      pricePerLitre: pricePerLitre || 65,
      effectiveMonth,

      selectedDates:
        normalizedSelected.map((d) => new Date(d)),

      cancelledDates:
        normalizedCancelled.map((d) => new Date(d)),

      alteredQuantities:
        normalizedAltered.map((item) => ({
          date: new Date(item.date),
          quantity: item.quantity,
        })),
    });

    res.status(201).json({
      subscription: sub,
      message: 'Subscription created',
    });

  } catch (err) {

    res.status(400).json({
      message: err.message,
    });
  }
};

// GET /api/subscriptions/my
exports.mySubscriptions = async (req, res) => {
  const subs = await Subscription.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ subscriptions: subs });
};

// PUT /api/subscriptions/:id
// body: any subset of { quantity, selectedDates, cancelledDates, alteredQuantities, status }
// exports.updateSubscription = async (req, res) => {
//   try {
//     const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user._id });
//     if (!sub) return res.status(404).json({ message: 'Subscription not found' });

//     const fields = ['quantity', 'selectedDates', 'cancelledDates', 'alteredQuantities', 'status', 'pricePerLitre'];
//     fields.forEach((f) => {
//       if (req.body[f] !== undefined) sub[f] = req.body[f];
//     });
//     await sub.save();
//     res.json({ subscription: sub });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

exports.getCurrentSubscription = async (req, res) => {
  const now = new Date();

  const month =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const sub = await Subscription.findOne({
    userId: req.user._id,
    effectiveMonth: month,
  });

  res.json({
    subscription: sub,
  });
};

exports.getSubscriptionByMonth = async (req, res) => {

  try {

    const { month } = req.params;

    if (!isValidMonth(month)) {
      return res.status(400).json({
        message: 'Invalid month format',
      });
    }

    const sub = await Subscription.findOne({
      userId: req.user._id,
      effectiveMonth: month,
    });

    res.json({
      subscription: sub,
    });

  } catch (e) {

    res.status(500).json({
      message: 'Failed to fetch subscription',
    });
  }
};
