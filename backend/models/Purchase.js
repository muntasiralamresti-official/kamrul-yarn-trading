const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    invoice: { type: String, required: true, unique: true, trim: true },
    date: { type: String, required: true },
    party: { type: String, required: true, trim: true },
    items: [
      {
        productId: { type: String },
        code: { type: String },
        name: { type: String },
        category: { type: String },
        unit: { type: String },
        yarnCount: { type: String, default: '' },
        yarnType: { type: String, default: '' },
        brand: { type: String, default: '' },
        lotNo: { type: String, default: '' },
        conesPerBag: { type: Number, default: 0 },
        lbsPerBag: { type: Number, default: 0 },
        rateType: { type: String, default: 'per_lb' },
        totalWeight: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    employee: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
