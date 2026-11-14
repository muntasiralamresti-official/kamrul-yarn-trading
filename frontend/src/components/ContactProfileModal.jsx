import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { calculatePersonBalance } from '../lib/personalStore';
import {
  X, Phone, MessageCircle, MapPin, CreditCard,
  FileText, ArrowRightLeft, Edit, Printer, CheckCircle2, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

export const ContactProfileModal = ({
  person,
  records = [],
  customTypes = [],
  onClose,
  onSelectPerson,
  onEditPerson,
  onPreviewDoc,
}) => {
  if (!person) return null;

  const balance = calculatePersonBalance(person, records, customTypes);
  const personRecords = records.filter((r) => r.personId === person.id);
  const docs = person.documents || {};
  const avatar = docs.photo?.dataUrl;

  const getWhatsAppLink = () => {
    const cleanPhone = (person.phone || '').replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `88${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${person.name}, hope you are well. Regarding our personal balance: BDT ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Thank you.`
    );
    return `https://wa.me/${intlPhone}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Contact Profile & Ledger</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Profile Info Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200">
            <div className="flex items-center gap-3.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt={person.name}
                  onClick={() => onPreviewDoc(docs.photo, `${person.name}'s Photo`)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                  title="Click to view photo"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                  {person.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900">{person.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                    {person.relation || 'Personal Contact'}
                  </span>
                  {person.address && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin size={12} className="text-slate-400" /> {person.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Balance Badge */}
            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Current Net Balance
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatMoney(Math.abs(balance))}
              </p>
              {balance > 0 && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  To Receive (Receivable)
                </span>
              )}
              {balance < 0 && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  To Pay (Payable / Debt)
                </span>
              )}
              {balance === 0 && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  Settled (Cleared)
                </span>
              )}
            </div>
          </div>

          {/* Details & Identification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Contact & Communication
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mobile Phone:</span>
                {person.phone ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900">{person.phone}</span>
                    <a href={`tel:${person.phone}`} className="p-1 rounded text-slate-400 hover:text-indigo-600 bg-white border border-slate-200" title="Call">
                      <Phone size={13} />
                    </a>
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-emerald-600 hover:text-emerald-800 bg-emerald-50 border border-emerald-200" title="WhatsApp">
                      <MessageCircle size={13} />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Location / Address:</span>
                <span className="font-medium text-slate-800 truncate max-w-[180px]">{person.address || 'Not provided'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Identification Credentials
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">National ID (NID):</span>
                <span className="font-mono font-semibold text-slate-900">{person.nidNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Passport Number:</span>
                <span className="font-mono font-semibold text-slate-900">{person.passportNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Opening Balance:</span>
                <span className="font-mono text-slate-700">
                  {person.openingAmount ? `${formatMoney(person.openingAmount)} (${person.openingType})` : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🗂️</span> Verified Documents & Copies
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'photo', label: 'Photo', icon: '👤', doc: docs.photo },
                { key: 'nidDoc', label: 'NID Card', icon: '🪪', doc: docs.nidDoc },
                { key: 'passportDoc', label: 'Passport', icon: '🛂', doc: docs.passportDoc },
                { key: 'visaDoc', label: 'Visa Copy', icon: '✈️', doc: docs.visaDoc },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    item.doc ? 'bg-white border-slate-300 hover:border-indigo-400 cursor-pointer shadow-sm' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                  }`}
                  onClick={() => item.doc && onPreviewDoc(item.doc, `${person.name} - ${item.label}`)}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-800">{item.label}</span>
                  {item.doc ? (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      View ({item.doc.sizeKb} KB)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-0.5">Not uploaded</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Log Mini-Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" /> Transaction History ({personRecords.length})
              </h4>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {personRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-400">No transaction records yet.</td>
                    </tr>
                  ) : (
                    personRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-slate-600">{r.date}</td>
                        <td className="px-3 py-1.5">
                          {r.type === 'given' && <span className="text-emerald-700 font-medium">Lent</span>}
                          {r.type === 'got_back' && <span className="text-teal-700 font-medium">Recovered</span>}
                          {r.type === 'taken' && <span className="text-rose-700 font-medium">Borrowed</span>}
                          {r.type === 'returned' && <span className="text-indigo-700 font-medium">Repaid</span>}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600">{r.method}</td>
                        <td className="px-3 py-1.5 text-right font-bold font-mono text-slate-900">{formatMoney(r.amount)}</td>
                        <td className="px-3 py-1.5 text-slate-500 max-w-[140px] truncate">{r.note || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectPerson(person.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <ArrowRightLeft size={14} /> New Transaction
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditPerson(person);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <Edit size={14} /> Edit Profile
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
