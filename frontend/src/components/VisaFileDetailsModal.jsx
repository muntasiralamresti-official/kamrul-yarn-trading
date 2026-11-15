import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { calculateFileFinances, VISA_STATUSES } from '../lib/visaStore';
import {
  X, Plane, Phone, Building, DollarSign, PlusCircle, Trash2,
  CheckCircle2, AlertCircle, ArrowDownLeft, ArrowUpRight, Edit
} from 'lucide-react';

export const VisaFileDetailsModal = ({
  file,
  payments = [],
  isOpen,
  onClose,
  onOpenPayment,
  onEditFile,
  onDeletePayment,
  onPreviewDoc,
}) => {
  if (!isOpen || !file) return null;

  const finances = calculateFileFinances(file, payments);
  const filePayments = payments.filter((p) => p.fileId === file.id);
  const statusObj = VISA_STATUSES.find((s) => s.id === file.status) || VISA_STATUSES[0];
  const docs = file.documents || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Plane size={20} className="text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {file.candidateName} <span className="font-mono text-slate-500 font-normal">({file.passportNumber})</span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Destination: <b>{file.country}</b></span>
                {file.agencyName && <span>• Agency: <b>{file.agencyName}</b></span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusObj.color}`}>
              {statusObj.icon} {statusObj.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 3-Way Financial Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Candidate Side */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                👤 ক্যান্ডিডেট / প্যাসেঞ্জার হিসাব
              </span>
              <div className="flex justify-between text-xs text-slate-600">
                <span>মোট চুক্তি (Deal):</span>
                <span className="font-mono font-semibold">{formatMoney(file.contractAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>আদায় হয়েছে (Received):</span>
                <span className="font-mono text-emerald-700 font-semibold">{formatMoney(finances.candidatePaid)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-emerald-200 pt-1 font-bold text-emerald-900">
                <span>প্যাসেঞ্জারের কাছে বাকি:</span>
                <span className="font-mono">{formatMoney(finances.candidateDue)}</span>
              </div>
            </div>

            {/* Agency Side */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                🏢 এজেন্সি হিসাব
              </span>
              <div className="flex justify-between text-xs text-slate-600">
                <span>এজেন্সির রেট (Cost):</span>
                <span className="font-mono font-semibold">{formatMoney(file.agencyCost)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>এজেন্সিকে দিয়েছি (Paid):</span>
                <span className="font-mono text-rose-700 font-semibold">{formatMoney(finances.agencyPaid)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-rose-200 pt-1 font-bold text-rose-900">
                <span>এজেন্সিকে বাকি:</span>
                <span className="font-mono">{formatMoney(finances.agencyDue)}</span>
              </div>
            </div>

            {/* Profit & Net Position */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                💰 প্রফিট ও ক্যাশ পজিশন
              </span>
              <div className="flex justify-between text-xs text-slate-600">
                <span>মোট সম্ভাব্য লাভ:</span>
                <span className="font-mono font-bold text-indigo-700">{formatMoney(finances.projectedProfit)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>হাতে ক্যাশ উদ্বৃত্ত:</span>
                <span className="font-mono font-bold text-teal-700">{formatMoney(finances.realizedCashflow)}</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-indigo-200">
                ক্যান্ডিডেট টাকা দিলে এজেন্সিকে দিয়ে প্রফিট সুরক্ষিত রাখা যাবে।
              </p>
            </div>
          </div>

          {/* Uploaded Documents */}
          {Object.keys(docs).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                সংযুক্ত কাগজপত্র (Documents)
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'passportDoc', label: 'পাসপোর্ট কপি', icon: '🛂' },
                  { key: 'visaDoc', label: 'ভিসা কপি', icon: '✈️' },
                  { key: 'photo', label: 'ছবি', icon: '👤' },
                  { key: 'nidDoc', label: 'এনআইডি', icon: '🪪' },
                ].map((item) => {
                  const doc = docs[item.key];
                  if (!doc) return null;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onPreviewDoc(doc, `${file.candidateName} - ${item.label}`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>{item.icon}</span> {item.label}
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                        {doc.sizeKb} KB
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payments & Installments Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                পেমেন্ট ও কিস্তির লেনদেন বিবরণী ({filePayments.length})
              </h4>
              <button
                type="button"
                onClick={onOpenPayment}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                <PlusCircle size={13} /> Add Payment
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">তারিখ</th>
                    <th className="px-3 py-2">পক্ষ (Party)</th>
                    <th className="px-3 py-2">মাধ্যম</th>
                    <th className="px-3 py-2 text-right">টাকা (৳)</th>
                    <th className="px-3 py-2">রিসিট নং</th>
                    <th className="px-3 py-2">নোট</th>
                    <th className="px-3 py-2 text-center">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filePayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400">
                        এখনো কোনো লেনদেন রেকর্ড করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    filePayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-600">{p.date}</td>
                        <td className="px-3 py-2 font-medium">
                          {p.party === 'candidate' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                              <ArrowDownLeft size={11} /> ক্যান্ডিডেট দিয়েছে
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-200">
                              <ArrowUpRight size={11} /> এজেন্সিকে দিয়েছি
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{p.method}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          {formatMoney(p.amount)}
                        </td>
                        <td className="px-3 py-2 text-slate-600 font-mono">{p.receiptNo || '—'}</td>
                        <td className="px-3 py-2 text-slate-500 max-w-[140px] truncate">{p.note || '—'}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this payment entry?')) onDeletePayment(p.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Delete payment"
                          >
                            <Trash2 size={13} />
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditFile(file);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium"
          >
            <Edit size={14} /> Edit File Details
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm"
            >
              <DollarSign size={14} /> Record Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
