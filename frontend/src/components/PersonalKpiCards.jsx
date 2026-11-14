import React from 'react';
import { formatMoney } from '../lib/accountsStore';

export const PersonalKpiCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Receivable</span>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{stats.receivableCount} debtors</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">{formatMoney(stats.totalReceivable)}</p>
        <span className="text-[11px] text-emerald-600 mt-0.5 block">Money to be collected from contacts</span>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Total Payable (Debt)</span>
          <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{stats.payableCount} creditors</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1 font-mono">{formatMoney(stats.totalPayable)}</p>
        <span className="text-[11px] text-rose-600 mt-0.5 block">Money you borrowed and have to repay</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Net Personal Balance</span>
          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{stats.settledCount} settled</span>
        </div>
        <p className={`text-xl sm:text-2xl font-bold mt-1 font-mono ${stats.net >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
          {formatMoney(Math.abs(stats.net))}
          <span className="text-xs font-normal ml-1.5">{stats.net >= 0 ? '(Net Surplus)' : '(Net Deficit)'}</span>
        </p>
        <span className="text-[11px] text-slate-500 mt-0.5 block">Overall personal asset vs obligation</span>
      </div>
    </div>
  );
};
