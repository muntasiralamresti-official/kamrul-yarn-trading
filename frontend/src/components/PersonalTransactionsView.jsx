import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { Trash2 } from 'lucide-react';

export const PersonalTransactionsView = ({
  persons,
  records,
  selectedPersonId,
  setSelectedPersonId,
  search,
  txnForm,
  setTxnForm,
  onSaveTxn,
  onDeleteRecord,
}) => {
  const filtered = records.filter((r) => {
    const matchPerson = selectedPersonId === 'all' || r.personId === selectedPersonId;
    const matchSearch = `${r.personName} ${r.note} ${r.method}`.toLowerCase().includes(search.toLowerCase());
    return matchPerson && matchSearch;
  });

  return (
    <div className="space-y-6">
      <form onSubmit={onSaveTxn} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base">নতুন ব্যক্তিগত লেনদেন রেকর্ড করুন</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ব্যক্তি নির্বাচন করুন *</label>
            <select
              value={txnForm.personId}
              onChange={(e) => setTxnForm({ ...txnForm, personId: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
              required
            >
              <option value="">-- ব্যক্তি নির্বাচন করুন --</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.relation})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">তারিখ *</label>
            <input
              type="date"
              value={txnForm.date}
              onChange={(e) => setTxnForm({ ...txnForm, date: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">লেনদেনের ধরন *</label>
            <select
              value={txnForm.type}
              onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-semibold"
            >
              <option value="given">➡️ আমি টাকা দিলাম (ধার / ঋণ প্রদান)</option>
              <option value="got_back">⬅️ সে ফেরত দিলো (পাওনা টাকা গ্রহণ)</option>
              <option value="taken">⬇️ আমি টাকা নিলাম (ধার / ঋণ গ্রহণ)</option>
              <option value="returned">⬆️ আমি ফেরত দিলাম (দেনা পরিশোধ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">টাকার পরিমাণ (৳) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={txnForm.amount}
              onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
              placeholder="যেমন: 50000"
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">প্রদানের মাধ্যম</label>
            <select
              value={txnForm.method}
              onChange={(e) => setTxnForm({ ...txnForm, method: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            >
              <option value="Cash">নগদ (Cash)</option>
              <option value="bKash / Nagad">বিকাশ / নগদ (Mobile Wallet)</option>
              <option value="Bank">ব্যাংক ট্রান্সফার / চেক (Bank)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">বিবরণ / নোট / রেফারেন্স</label>
            <input
              type="text"
              value={txnForm.note}
              onChange={(e) => setTxnForm({ ...txnForm, note: e.target.value })}
              placeholder="যেমন: পারিবারিক প্রয়োজনে ধার নেওয়া"
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-lg transition-colors">
            লেনদেন সংরক্ষণ করুন
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h4 className="font-bold text-slate-800 text-sm">সকল ব্যক্তিগত লেনদেনের বিবরণী</h4>
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="rounded border border-slate-300 p-1.5 text-xs bg-white"
          >
            <option value="all">সকল ব্যক্তি</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">তারিখ</th>
                <th className="px-3 py-2.5">ব্যক্তির নাম</th>
                <th className="px-3 py-2.5">লেনদেনের ধরন</th>
                <th className="px-3 py-2.5">মাধ্যম</th>
                <th className="px-3 py-2.5 text-right">টাকা (৳)</th>
                <th className="px-3 py-2.5">নোট</th>
                <th className="px-3 py-2.5 text-center">ডিলিট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{r.date}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{r.personName}</td>
                    <td className="px-3 py-2">
                      {r.type === 'given' && <span className="text-emerald-700 font-medium">আমি দিয়েছি (ধার)</span>}
                      {r.type === 'got_back' && <span className="text-emerald-600 font-medium">ফেরত পেয়েছি</span>}
                      {r.type === 'taken' && <span className="text-rose-700 font-medium">আমি নিয়েছি (ধার)</span>}
                      {r.type === 'returned' && <span className="text-blue-700 font-medium">ফেরত দিয়েছি</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.method}</td>
                    <td className="px-3 py-2 text-right font-bold font-mono">{formatMoney(r.amount)}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{r.note || '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => onDeleteRecord(r.id)} className="text-rose-500 hover:text-rose-700 p-1" title="মুছুন">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
