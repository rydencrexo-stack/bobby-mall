const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: Array,
  total: Number,
  paymentMethod: String,
  address: String,

  // ✅ ORDER STATUS (ADDED, DEFAULT = Processing)
  status: {
    type: String,
    enum: [
      "Processing",
      "Making Your Order",
      "On the Way",
      "Delivered"
    ],
    default: "Processing"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
