import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { formatMoney, localDate } from '../lib/accountsStore';
import { useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const QuotationRecord = () => {
  const { quotations } = useCommerceState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => localDate());
  const filtered = useMemo(() => quotations.filter((item) =>
    item.date >= startDate && item.date <= endDate &&
    `${item.invoice} ${item.customer} ${item.note}`.toLowerCase().includes(query.toLowerCase())
  ), [quotations, query, startDate, endDate]);

  return <div className="mx-auto max-w-[1200px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Quotation Record</h1>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">From
        <input className={`${inputClass} mt-1 w-full`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">To
        <input className={`${inputClass} mt-1 w-full`} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </label>
      <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quotation or customer" aria-label="Search quotations" />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[750px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Quotation No.', 'Date', 'Customer', 'Items', 'Total', 'Note', 'Action'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id} className="text-center hover:bg-sky-50">
        <td className="border px-3 py-2 font-mono font-semibold">
          <Link to={`/sales/quotation-invoice?id=${item.id}`} className="text-sky-700 hover:underline">
            {item.invoice}
          </Link>
        </td>
        <td className="border px-3 py-2">{item.date}</td>
        <td className="border px-3 py-2 text-left">{item.customer}</td>
        <td className="border px-3 py-2">{item.items.length}</td>
        <td className="border px-3 py-2 text-right">{formatMoney(item.total)}</td>
        <td className="border px-3 py-2 text-left">{item.note || '—'}</td>
        <td className="border px-3 py-2">
          <Link
            to={`/sales/quotation-invoice?id=${item.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold"
          >
            <Printer size={12} /> View / Print
          </Link>
        </td>
      </tr>)}
        {!filtered.length && <tr><td colSpan="7" className="border px-3 py-8 text-center text-slate-500">No saved quotations match these filters.</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default QuotationRecord;
