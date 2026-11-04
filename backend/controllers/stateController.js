const AppState = require('../models/AppState');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

const ALLOWED_KEYS = [
  'kamrul-yarn-trading.commerce.v1',
  'kamrul-yarn-trading.accounts.v1',
  'kamrul-yarn-trading.hr.v1',
  'kamrul-yarn-trading.admin.v1',
  'kamrul-yarn-trading.personal.v1',
];

const isValidKey = (key) => ALLOWED_KEYS.includes(key);

// Sync normalized collections in background so API remains lightning fast
const syncNormalizedData = async (key, data) => {
  try {
    if (key === 'kamrul-yarn-trading.admin.v1') {
      if (Array.isArray(data.products)) {
        for (const item of data.products) {
          if (item.code) {
            await Product.findOneAndUpdate(
              { code: item.code },
              { ...item },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
      }
      if (Array.isArray(data.customers)) {
        for (const item of data.customers) {
          if (item.code) {
            await Customer.findOneAndUpdate({ code: item.code }, { ...item }, { upsert: true, new: true });
          }
        }
      }
      if (Array.isArray(data.suppliers)) {
        for (const item of data.suppliers) {
          if (item.code) {
            await Supplier.findOneAndUpdate({ code: item.code }, { ...item }, { upsert: true, new: true });
          }
        }
      }
    } else if (key === 'kamrul-yarn-trading.commerce.v1') {
      if (Array.isArray(data.sales)) {
        for (const item of data.sales) {
          if (item.invoice) {
            await Sale.findOneAndUpdate({ invoice: item.invoice }, { ...item }, { upsert: true, new: true });
          }
        }
      }
      if (Array.isArray(data.purchases)) {
        for (const item of data.purchases) {
          if (item.invoice) {
            await Purchase.findOneAndUpdate({ invoice: item.invoice }, { ...item }, { upsert: true, new: true });
          }
        }
      }
    }
  } catch (err) {
    console.error('Normalized sync error:', err.message);
  }
};

exports.getState = async (req, res) => {
  const { key } = req.params;
  if (!isValidKey(key)) return res.status(400).json({ message: 'Unknown data module.' });
  const doc = await AppState.findOne({ key }).lean();
  res.json({ key, data: doc ? doc.data : null });
};

exports.saveState = async (req, res) => {
  const { key } = req.params;
  if (!isValidKey(key)) return res.status(400).json({ message: 'Unknown data module.' });
  const { data } = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ message: 'Body must contain a data object.' });
  }

  await AppState.findOneAndUpdate({ key }, { key, data }, { upsert: true, new: true, runValidators: true });
  
  // Non-blocking background sync to normalized MongoDB tables
  syncNormalizedData(key, data);

  res.json({ key, saved: true, normalized: true });
};
