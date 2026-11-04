import React from 'react';
import { Printer } from 'lucide-react';

export const accountInputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
export const AccountPage = ({ title, children }) => (
  <div className="mx-auto max-w-375 space-y-4 p-3 sm:p-4 md:p-6">
    <h1 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h1>
    {children}
  </div>
);

export const AccountReportTools = ({ query, onQueryChange, onPrint }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
    <input
      className={`${accountInputClass} w-full sm:max-w-sm`}
      placeholder="Search..."
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      aria-label="Search report"
    />
    <button type="button" onClick={onPrint} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0">
      <Printer size={16} /> Print
    </button>
  </div>
);

export const AccountTable = ({ columns, rows, emptyMessage = 'No records found.' }) => (
  <div className="overflow-x-auto border border-slate-300 bg-white">
    <table className="w-full min-w-[700px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white">
        <tr>{columns.map((column) => <th key={column} className="border border-slate-300 px-3 py-1 text-left">{column}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows : <tr><td colSpan={columns.length} className="border px-3 py-8 text-center text-slate-500">{emptyMessage}</td></tr>}
      </tbody>
    </table>
  </div>
);

export const AccountFilterPanel = ({ title, children, onSubmit }) => (
  <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-200 p-3">
    <h2 className="w-full text-base sm:text-lg font-semibold text-slate-800">{title}</h2>
    {children}
  </form>
);

export const DateRangeFields = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <>
    <label className="text-sm text-slate-700 flex-1 sm:flex-initial">From
      <input className={`${accountInputClass} mt-1`} type="date" value={startDate} onChange={(event) => onStartChange(event.target.value)} />
    </label>
    <label className="text-sm text-slate-700 flex-1 sm:flex-initial">To
      <input className={`${accountInputClass} mt-1`} type="date" value={endDate} onChange={(event) => onEndChange(event.target.value)} />
    </label>
    <button className="w-full sm:w-auto rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700">Show Report</button>
  </>
);
