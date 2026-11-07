import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { Trash2, Calendar, FileText, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';

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
    const matchSearch = `${r.personName} ${r.note || ''} ${r.method || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchPerson && matchSearch;
  });

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <div className="space-y-6">
      {/* Transaction Entry Form */}
      <form onSubmit={onSaveTxn} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <FileText size={18} className="text-indigo-600" /> Record New Personal Transaction
          </h3>
          <span className="text-xs text-slate-500">Non-business personal ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person *</label>
            <select
              value={txnForm.personId}
              onChange={(e) => setTxnForm({ ...txnForm, personId: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose Contact Person --</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relation || 'Personal'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Date *</label>
            <input
              type="date"
              value={txnForm.date}
              onChange={(e) => setTxnForm({ ...txnForm, date: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Type *</label>
            <select
              value={txnForm.type}
              onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-semibold text-slate-800"
            >
              <option value="given">➡️ Lent Money (I gave loan / advance)</option>
              <option value="got_back">⬅️ Recovered Money (They returned my money)</option>
              <option value="taken">⬇️ Borrowed Money (I took loan / credit)</option>
              <option value="returned">⬆️ Repaid Debt (I paid back my loan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount (BDT) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={txnForm.amount}
              onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={txnForm.method}
              onChange={(e) => setTxnForm({ ...txnForm, method: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="bKash / Nagad">Mobile Banking (bKash / Nagad / Rocket)</option>
              <option value="Bank">Bank Transfer / Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Promised Return Date (Optional)</label>
            <input
              type="date"
              value={txnForm.dueDate || ''}
              onChange={(e) => setTxnForm({ ...txnForm, dueDate: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Purpose / Note / Cheque No.</label>
            <input
              type="text"
              value={txnForm.note}
              onChange={(e) => setTxnForm({ ...txnForm, note: e.target.value })}
              placeholder="e.g. Emergency medical assistance, Cheque #49281..."
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm px-6 py-2 rounded-lg transition-colors shadow-sm"
          >
            Save Transaction
          </button>
        </div>
      </form>

      {/* History Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Calendar size={16} className="text-slate-500" /> Transaction History & Statement
          </h4>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Filter Contact:</label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="rounded border border-slate-300 p-1.5 text-xs bg-white font-medium"
            >
              <option value="all">All Contacts</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Contact Name</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Method</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="px-3 py-2.5">Due Date</th>
                <th className="px-3 py-2.5">Notes</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No transaction records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const overdue = isOverdue(r.dueDate);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 font-mono text-slate-600">{r.date}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{r.personName}</td>
                      <td className="px-3 py-2">
                        {r.type === 'given' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                            <ArrowUpRight size={12} /> Lent (Given)
                          </span>
                        )}
                        {r.type === 'got_back' && (
                          <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px] font-medium border border-teal-200">
                            <CheckCircle size={12} /> Recovered
                          </span>
                        )}
                        {r.type === 'taken' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-medium border border-rose-200">
                            <ArrowDownLeft size={12} /> Borrowed (Taken)
                          </span>
                        )}
                        {r.type === 'returned' && (
                          <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-200">
                            <CheckCircle size={12} /> Repaid
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600 font-medium">{r.method}</td>
                      <td className="px-3 py-2 text-right font-bold font-mono text-slate-900">
                        {formatMoney(r.amount)}
                      </td>
                      <td className="px-3 py-2">
                        {r.dueDate ? (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-mono ${
                              overdue
                                ? 'bg-rose-100 text-rose-800 font-semibold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {overdue ? '⚠️ ' : ''}{r.dueDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate">{r.note || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this transaction record?')) {
                              onDeleteRecord(r.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
