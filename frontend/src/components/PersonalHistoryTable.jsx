import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { BUILTIN_TXN_TYPES } from '../lib/personalStore';
import { Trash2, Edit, Calendar, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';

export const PersonalHistoryTable = ({
  persons,
  records,
  customTypes = [],
  selectedPersonId,
  setSelectedPersonId,
  search,
  onEditTxn,
  onDeleteRecord,
}) => {
  const filtered = records.filter((r) => {
    const matchPerson = selectedPersonId === 'all' || r.personId === selectedPersonId;
    const matchSearch = `${r.personName} ${r.note || ''} ${r.method || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchPerson && matchSearch;
  });

  const allTypes = [...BUILTIN_TXN_TYPES, ...customTypes];
  const getTypeLabel = (typeId) => {
    const found = allTypes.find((t) => t.id === typeId);
    return found ? found.label : typeId;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
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
                          <ArrowUpRight size={12} /> Lent
                        </span>
                      )}
                      {r.type === 'got_back' && (
                        <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px] font-medium border border-teal-200">
                          <CheckCircle size={12} /> Recovered
                        </span>
                      )}
                      {r.type === 'taken' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-medium border border-rose-200">
                          <ArrowDownLeft size={12} /> Borrowed
                        </span>
                      )}
                      {r.type === 'returned' && (
                        <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-200">
                          <CheckCircle size={12} /> Repaid
                        </span>
                      )}
                      {!['given', 'got_back', 'taken', 'returned'].includes(r.type) && (
                        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-medium border border-purple-200">
                          ✨ {getTypeLabel(r.type)}
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
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTxn(r)}
                          className="text-slate-400 hover:text-amber-600 p-1 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit size={13} />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
