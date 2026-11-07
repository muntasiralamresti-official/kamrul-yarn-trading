import React, { useState } from 'react';
import { formatMoney } from '../lib/accountsStore';
import { calculatePersonBalance, deletePerson } from '../lib/personalStore';
import { MessageCircle, Phone, ArrowRightLeft, Trash2, CheckCircle2 } from 'lucide-react';

export const PersonalSummaryTable = ({ persons, records, search, onSelectPerson }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = persons.filter((p) => {
    const matchSearch = `${p.name} ${p.phone} ${p.relation} ${p.address || ''}`.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    const bal = calculatePersonBalance(p, records);
    if (statusFilter === 'receivable') return bal > 0;
    if (statusFilter === 'payable') return bal < 0;
    if (statusFilter === 'settled') return bal === 0;
    return true;
  });

  const getWhatsAppLink = (person, balance) => {
    const cleanPhone = (person.phone || '').replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `88${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${person.name}, hope you are well. This is a gentle reminder regarding our personal outstanding balance of BDT ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Thank you.`
    );
    return `https://wa.me/${intlPhone}?text=${msg}`;
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        deletePerson(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 mr-1">Status:</span>
        {[
          { id: 'all', label: 'All Contacts' },
          { id: 'receivable', label: 'To Receive (Receivable)' },
          { id: 'payable', label: 'To Pay (Payable)' },
          { id: 'settled', label: 'Settled (Cleared)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Contact & Relation</th>
              <th className="px-4 py-3">Mobile / Contact</th>
              <th className="px-4 py-3 text-right">Current Balance</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  No contacts found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const balance = calculatePersonBalance(p, records);
                const hasHistory = records.some((r) => r.personId === p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <span className="text-[11px] text-slate-500">
                        {p.relation || 'Personal'} {p.address ? `· ${p.address}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.phone ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{p.phone}</span>
                          <a
                            href={`tel:${p.phone}`}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                            title="Call Phone"
                          >
                            <Phone size={13} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold font-mono">
                      {formatMoney(Math.abs(balance))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {balance > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          To Receive
                        </span>
                      )}
                      {balance < 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          To Pay
                        </span>
                      )}
                      {balance === 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Settled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectPerson(p.id)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          title="Record transaction or view history"
                        >
                          <ArrowRightLeft size={13} /> Transact
                        </button>
                        {p.phone && balance > 0 && (
                          <a
                            href={getWhatsAppLink(p, balance)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-800 font-medium p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            title="Send WhatsApp payment reminder"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                        {!hasHistory && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
