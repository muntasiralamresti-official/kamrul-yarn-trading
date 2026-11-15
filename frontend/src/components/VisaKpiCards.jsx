import React from 'react';
import { formatMoney } from '../lib/accountsStore';
import { Users, Building, TrendingUp, Plane } from 'lucide-react';

export const VisaKpiCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Candidate Due (Receivable) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Due From Candidates
          </span>
          <Users size={16} className="text-emerald-600" />
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">
          {formatMoney(stats.totalCandidateDue)}
        </p>
        <span className="text-[11px] text-emerald-600 mt-0.5 block">
          প্যাসেঞ্জারদের কাছে আপনার মোট পাওনা
        </span>
      </div>

      {/* 2. Agency Due (Payable) */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            Payable To Agencies
          </span>
          <Building size={16} className="text-rose-600" />
        </div>
        <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1 font-mono">
          {formatMoney(stats.totalAgencyDue)}
        </p>
        <span className="text-[11px] text-rose-600 mt-0.5 block">
          এজেন্সিদের আপনার মোট দেনা / বাকি
        </span>
      </div>

      {/* 3. Projected Profit */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
            Total Projected Profit
          </span>
          <TrendingUp size={16} className="text-indigo-600" />
        </div>
        <p className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1 font-mono">
          {formatMoney(stats.totalProjectedProfit)}
        </p>
        <span className="text-[11px] text-indigo-600 mt-0.5 block">
          সবগুলো ফাইল থেকে মোট নিট লাভ
        </span>
      </div>

      {/* 4. Active Files Count */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Total Passport Files
          </span>
          <Plane size={16} className="text-indigo-600" />
        </div>
        <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 font-mono">
          {stats.totalFiles} <span className="text-xs font-normal text-slate-500">files</span>
        </p>
        <span className="text-[11px] text-slate-500 mt-0.5 block">
          {stats.activeFiles} in process • {stats.deliveredFiles} delivered
        </span>
      </div>
    </div>
  );
};
