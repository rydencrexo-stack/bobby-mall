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

      // user email (for My Orders)
      userEmail: req.body.userEmail
    });

    await order.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
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

// ================= GET ORDERS BY USER =================
router.get("/my-orders/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const orders = await Order.find({ userEmail: email })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE ORDER STATUS (ADMIN) =================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
