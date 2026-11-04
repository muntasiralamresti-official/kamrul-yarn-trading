import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { formatMoney, localDate } from '../lib/accountsStore';
import { useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const ReturnRecordPage = ({ type }) => {
  const commerce = useCommerceState();
  const isSale = type === 'sales';
  const records = isSale ? commerce.salesReturns : commerce.purchaseReturns;
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => localDate());
  const [details, setDetails] = useState(true);
  const filtered = useMemo(() => records.filter((item) =>
    item.date >= startDate && item.date <= endDate &&
    `${item.number} ${item.invoice} ${item.party} ${item.product}`.toLowerCase().includes(query.toLowerCase())
  ), [records, query, startDate, endDate]);

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">{isSale ? 'Sales Return Record' : 'Purchase Return Record'}</h1>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Record Type
        <select className={`${inputClass} mt-1 w-full`} value={details ? 'With Details' : 'Without Details'} onChange={(event) => setDetails(event.target.value === 'With Details')}>
          <option>With Details</option>
          <option>Without Details</option>
        </select>
      </label>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">From
        <input className={`${inputClass} mt-1 w-full`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">To
        <input className={`${inputClass} mt-1 w-full`} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </label>
      <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} placeholder="Search return, invoice, partner" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search returns" />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[700px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Return No.', 'Date', 'Invoice', isSale ? 'Customer' : 'Supplier', ...(details ? ['Product', 'Quantity', 'Reason'] : []), 'Amount'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id} className="text-center hover:bg-sky-50"><td className="border px-2 py-2">{item.number}</td><td className="border px-2 py-2">{item.date}</td><td className="border px-2 py-2">{item.invoice}</td><td className="border px-2 py-2 text-left">{item.party}</td>{details && <><td className="border px-2 py-2">{item.product}</td><td className="border px-2 py-2">{item.quantity} {item.unit}</td><td className="border px-2 py-2">{item.reason || '—'}</td></>}<td className="border px-2 py-2 text-right">{formatMoney(item.amount)}</td></tr>)}
        {!filtered.length && <tr><td colSpan={details ? 8 : 5} className="border px-3 py-8 text-center text-slate-500">No saved returns match these filters.</td></tr>}
        {filtered.length > 0 && <tr className="font-bold"><td colSpan={details ? 7 : 4} className="border px-3 py-2 text-right">Total</td><td className="border px-3 py-2 text-right">{formatMoney(filtered.reduce((sum, item) => sum + item.amount, 0))}</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default ReturnRecordPage;
