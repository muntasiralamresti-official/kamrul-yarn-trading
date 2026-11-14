import React, { useState } from 'react';
import { formatMoney } from '../lib/accountsStore';
import { calculatePersonBalance, deletePerson } from '../lib/personalStore';
import { MessageCircle, Phone, ArrowRightLeft, Trash2, CheckCircle2, Edit } from 'lucide-react';

export const PersonalSummaryTable = ({
  persons,
  records,
  customTypes = [],
  search,
  onSelectPerson,
  onEditPerson,
  onPreviewDoc,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = persons.filter((p) => {
    const term = `${p.name} ${p.phone || ''} ${p.relation || ''} ${p.address || ''} ${p.nidNumber || ''} ${p.passportNumber || ''}`.toLowerCase();
    if (!term.includes(search.toLowerCase())) return false;
    const bal = calculatePersonBalance(p, records, customTypes);
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
              <th className="px-4 py-3">Contact & Identification</th>
              <th className="px-4 py-3">Documents</th>
              <th className="px-4 py-3">Mobile / Contact</th>
              <th className="px-4 py-3 text-right">Current Balance</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  No contacts found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const balance = calculatePersonBalance(p, records, customTypes);
                const hasHistory = records.some((r) => r.personId === p.id);
                const docs = p.documents || {};
                const avatar = docs.photo?.dataUrl;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={p.name}
                            onClick={() => onPreviewDoc(docs.photo, `${p.name}'s Photo`)}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-400 shrink-0"
                            title="Click to view full photo"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
                          <span className="text-[11px] text-slate-500 block">
                            {p.relation || 'Personal'} {p.address ? `· ${p.address}` : ''}
                          </span>
                          {(p.nidNumber || p.passportNumber) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {p.nidNumber && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                                  NID: {p.nidNumber}
                                </span>
                              )}
                              {p.passportNumber && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                                  Pass: {p.passportNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Attached Documents Badges */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {docs.passportDoc && (
                          <button
                            type="button"
                            onClick={() => onPreviewDoc(docs.passportDoc, `${p.name} - Passport`)}
                            className="text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            title="View Passport Copy"
                          >
                            <span>🛂</span> Passport
                          </button>
                        )}
                        {docs.visaDoc && (
                          <button
                            type="button"
                            onClick={() => onPreviewDoc(docs.visaDoc, `${p.name} - Visa Copy`)}
                            className="text-[10px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            title="View Visa Copy"
                          >
                            <span>✈️</span> Visa
                          </button>
                        )}
                        {docs.nidDoc && (
                          <button
                            type="button"
                            onClick={() => onPreviewDoc(docs.nidDoc, `${p.name} - NID Card`)}
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            title="View NID Card"
                          >
                            <span>🪪</span> NID
                          </button>
                        )}
                        {!docs.passportDoc && !docs.visaDoc && !docs.nidDoc && !docs.photo && (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </div>
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
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          title="Record transaction or view history"
                        >
                          <ArrowRightLeft size={13} /> Transact
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditPerson(p)}
                          className="text-slate-400 hover:text-amber-600 p-1 rounded transition-colors"
                          title="Edit Contact Details"
                        >
                          <Edit size={14} />
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
