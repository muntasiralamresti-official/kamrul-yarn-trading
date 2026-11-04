import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { calculatePersonBalance } from '../lib/personalStore';

export const PersonalSummaryTable = ({ persons, records, search, onSelectPerson }) => {
  const filtered = persons.filter((p) =>
    `${p.name} ${p.phone} ${p.relation}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs sm:text-sm text-left">
        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">ব্যক্তির নাম ও সম্পর্ক</th>
            <th className="px-4 py-3">মোবাইল</th>
            <th className="px-4 py-3 text-right">বর্তমান স্থিতি</th>
            <th className="px-4 py-3 text-center">হিসাবের অবস্থা</th>
            <th className="px-4 py-3 text-center">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-slate-400">কোনো ব্যক্তি পাওয়া যায়নি।</td>
            </tr>
          ) : (
            filtered.map((p) => {
              const balance = calculatePersonBalance(p, records);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <span className="text-[11px] text-slate-500">{p.relation} {p.address ? `· ${p.address}` : ''}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold font-mono">
                    {formatMoney(Math.abs(balance))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {balance > 0 && <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">আমি পাবো</span>}
                    {balance < 0 && <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">সে পাবে</span>}
                    {balance === 0 && <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">পরিশোধিত</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onSelectPerson(p.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100"
                    >
                      লেনদেন করুন
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
