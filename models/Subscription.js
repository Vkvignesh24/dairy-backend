const mongoose = require('mongoose');

const alteredQuantitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.5,
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // fixed quantity for this month
    quantity: {
      type: Number,
      required: true,
      min: 0.5,
    },

    pricePerLitre: {
      type: Number,
      default: 65,
    },

    // month this subscription belongs to
    effectiveMonth: {
      type: String,
      required: true,
    },

    selectedDates: [
      {
        type: Date,
      },
    ],

    cancelledDates: [
      {
        type: Date,
      },
    ],

    alteredQuantities: [alteredQuantitySchema],

    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);