const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error("Only image files allowed"));
  }
});

/* ================= GET PRODUCTS ================= */
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* ================= ADD PRODUCT ================= */
router.post("/", upload.single("image"), async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    image: req.file ? `/uploads/${req.file.filename}` : ""
  });

  await product.save();
  res.json(product);
});

/* ================= UPDATE PRODUCT ================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  if (req.file && product.image) {
    const oldPath = path.join("public", product.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  product.name = req.body.name;
  product.price = req.body.price;
  product.category = req.body.category;
  product.description = req.body.description;
  if (req.file) product.image = `/uploads/${req.file.filename}`;

  await product.save();
  res.json({ success: true });
});

/* ================= DELETE PRODUCT ================= */
router.delete("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  if (product.image) {
    const imgPath = path.join("public", product.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await product.deleteOne();
  res.json({ success: true });
});

module.exports = router;
