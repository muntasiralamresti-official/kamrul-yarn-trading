import React, { useState } from 'react';
import { localDate } from '../lib/accountsStore';
import { X, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const VisaPaymentModal = ({ file, defaultParty = 'candidate', isOpen, onClose, onSavePayment }) => {
  if (!isOpen || !file) return null;

  const [party, setParty] = useState(defaultParty);
  const [date, setDate] = useState(localDate());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      onSavePayment({
        fileId: file.id,
        party,
        type: party === 'candidate' ? 'received' : 'paid_to_agency',
        date,
        amount: Number(amount),
        method,
        receiptNo,
        note,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Record Payment / Transaction</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {file.candidateName} • Pass: {file.passportNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && <p className="px-5 pt-3 text-xs text-rose-600 font-semibold">{error}</p>}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Party Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              লেনদেনের পক্ষ (Party) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParty('candidate')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  party === 'candidate'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft size={14} className="text-emerald-600" />
                প্যাসেঞ্জার দিয়েছে (Received)
              </button>

              <button
                type="button"
                onClick={() => setParty('agency')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  party === 'agency'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm ring-1 ring-rose-500'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight size={14} className="text-rose-600" />
                এজেন্সিকে দিয়েছি (Paid)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">তারিখ (Date) *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">টাকার পরিমাণ (Amount ৳) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">পেমেন্ট মাধ্যম (Method)</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white"
              >
                <option value="Cash">নগদ (Cash)</option>
                <option value="Bank">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                <option value="bKash / Nagad">বিকাশ / নগদ (Mobile Wallet)</option>
                <option value="Cheque">চেক (Cheque)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">মানি রিসিট / ভাউচার নং</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="e.g. MR-1049"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">বিবরণ / নোট (Notes)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. পাসপোর্ট জমার অ্যাডভান্স, মেডিকেল ফি, ভিসা ডেলিভারি..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-white text-xs font-medium shadow-sm transition-colors ${
                party === 'candidate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {party === 'candidate' ? 'Save Received Payment' : 'Save Agency Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
