const mongoose = require('mongoose');

// One document per business module (commerce, accounts, hr, admin).
const appStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('AppState', appStateSchema);
