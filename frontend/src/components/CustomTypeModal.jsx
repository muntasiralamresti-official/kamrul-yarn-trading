import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

export const CustomTypeModal = ({ isOpen, onClose, onAddCustomType }) => {
  const [label, setLabel] = useState('');
  const [impact, setImpact] = useState('receivable_plus');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please provide a type name.');
      return;
    }
    try {
      onAddCustomType({ label: label.trim(), impact });
      setLabel('');
      setImpact('receivable_plus');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <PlusCircle size={18} className="text-indigo-600" /> Add Custom Transaction Type
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type Label / Name *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gift / Donation, Shared Utility Bill, Investment"
              className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Financial Effect on Balance *</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            >
              <option value="receivable_plus">➕ Increases Receivable (They owe me more)</option>
              <option value="receivable_minus">➖ Decreases Receivable (They paid me back)</option>
              <option value="payable_plus">🔻 Increases Debt (I borrowed more / I owe)</option>
              <option value="payable_minus">🔺 Decreases Debt (I repaid my debt)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Specifies whether this transaction increases or decreases your personal net asset.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm"
            >
              Add Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
