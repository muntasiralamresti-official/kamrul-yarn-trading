const express = require('express');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

const router = express.Router();

// Direct normalized REST endpoints
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.json(products);
});

router.get('/customers', async (req, res) => {
  const customers = await Customer.find().sort({ name: 1 }).lean();
  res.json(customers);
});

router.get('/suppliers', async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  res.json(suppliers);
});

router.get('/sales', async (req, res) => {
  const sales = await Sale.find().sort({ date: -1 }).lean();
  res.json(sales);
});

router.get('/purchases', async (req, res) => {
  const purchases = await Purchase.find().sort({ date: -1 }).lean();
  res.json(purchases);
});

module.exports = router;
