import React from 'react';
import { formatMoney } from '../lib/accountsStore';

export const ProfitLossInvoicesTable = ({ list = [] }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <table className="w-full text-left text-xs border-collapse">
      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
        <tr>
          <th className="py-3 px-4">Invoice</th>
          <th className="py-3 px-4">Date</th>
          <th className="py-3 px-4">Customer</th>
          <th className="py-3 px-4 text-right">বিক্রয় মূল্য (৳)</th>
          <th className="py-3 px-4 text-right">ক্রয় খরচ (৳)</th>
          <th className="py-3 px-4 text-right font-bold text-slate-800">গ্রস প্রফিট (৳)</th>
          <th className="py-3 px-4 text-center">মার্জিন</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {list.map((inv) => (
          <tr key={inv.id} className="hover:bg-slate-50/70">
            <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoice}</td>
            <td className="py-3 px-4 text-slate-500">{inv.date}</td>
            <td className="py-3 px-4 font-medium text-slate-800">{inv.party}</td>
            <td className="py-3 px-4 text-right font-semibold">{formatMoney(inv.revenue)}</td>
            <td className="py-3 px-4 text-right text-slate-600">{formatMoney(inv.cost)}</td>
            <td className={`py-3 px-4 text-right font-bold ${inv.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatMoney(inv.profit)}
            </td>
            <td className="py-3 px-4 text-center">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${Number(inv.margin) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {inv.margin}%
              </span>
            </td>
          </tr>
        ))}
        {list.length === 0 && (
          <tr>
            <td colSpan="7" className="py-8 text-center text-slate-400">
              এই তারিখের মধ্যে কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const ProfitLossProductsTable = ({ list = [] }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <table className="w-full text-left text-xs border-collapse">
      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
        <tr>
          <th className="py-3 px-4">Yarn Count / Product</th>
          <th className="py-3 px-4 text-right">বিক্রি পরিমাণ</th>
          <th className="py-3 px-4 text-right">মোট বিক্রয় (৳)</th>
          <th className="py-3 px-4 text-right">মোট ক্রয় খরচ (৳)</th>
          <th className="py-3 px-4 text-right font-bold text-slate-800">মোট লাভ (৳)</th>
          <th className="py-3 px-4 text-center">মার্জিন</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {list.map((prod) => (
          <tr key={prod.id} className="hover:bg-slate-50/70">
            <td className="py-3 px-4 font-semibold text-slate-800">{prod.name}</td>
            <td className="py-3 px-4 text-right text-slate-600">{prod.quantity} {prod.unit}</td>
            <td className="py-3 px-4 text-right font-medium">{formatMoney(prod.revenue)}</td>
            <td className="py-3 px-4 text-right text-slate-600">{formatMoney(prod.cost)}</td>
            <td className={`py-3 px-4 text-right font-bold ${prod.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatMoney(prod.profit)}
            </td>
            <td className="py-3 px-4 text-center">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${Number(prod.margin) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {prod.margin}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ProfitLossExpensesTable = ({ list = [] }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <table className="w-full text-left text-xs border-collapse">
      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
        <tr>
          <th className="py-3 px-4">Date</th>
          <th className="py-3 px-4">Expense Category</th>
          <th className="py-3 px-4">Description</th>
          <th className="py-3 px-4">Method</th>
          <th className="py-3 px-4 text-right font-bold text-rose-700">খরচের পরিমাণ (৳)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {list.map((exp) => (
          <tr key={exp.id} className="hover:bg-slate-50/70">
            <td className="py-3 px-4 text-slate-500">{exp.date}</td>
            <td className="py-3 px-4 font-semibold text-slate-800">{exp.category}</td>
            <td className="py-3 px-4 text-slate-600">{exp.description || exp.note || '—'}</td>
            <td className="py-3 px-4">{exp.method || 'Cash'}</td>
            <td className="py-3 px-4 text-right font-bold text-rose-600">{formatMoney(exp.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
