const express = require("express");
const router = express.Router();
const Order = require("../models/order");

// ================= PLACE ORDER =================
router.post("/", async (req, res) => {
  try {
    const order = new Order({
      products: req.body.products,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod,
      address: req.body.address,
      userEmail: req.body.userEmail
    });

    await order.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ALL ORDERS (ADMIN) =================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE ORDER STATUS =================
router.put("/:id/status", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: req.body.status
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
