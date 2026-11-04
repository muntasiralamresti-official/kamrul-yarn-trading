const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, trim: true },
    yarnCount: { type: String, trim: true, default: '' },
    yarnType: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    lotNo: { type: String, trim: true, default: '' },
    conesPerBag: { type: Number, default: 0 },
    lbsPerBag: { type: Number, default: 0 },
    purchasePrice: { type: Number, required: true, default: 0 },
    salesPrice: { type: Number, required: true, default: 0 },
    openingStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
