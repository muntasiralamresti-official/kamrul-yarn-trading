import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { formatMoney, localDate } from '../lib/accountsStore';
import { useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const PurchaseRecord = () => {
  const { purchases } = useCommerceState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => localDate());
  const [details, setDetails] = useState(false);
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => purchases.filter((purchase) => (
    purchase.date >= startDate && purchase.date <= endDate &&
    `${purchase.invoice} ${purchase.party} ${purchase.note}`.toLowerCase().includes(query.toLowerCase())
  )), [purchases, query, startDate, endDate]);
  const sums = filtered.reduce((acc, purchase) => {
    ['subtotal', 'vat', 'discount', 'transport', 'total', 'cash', 'bank', 'paid', 'due'].forEach((key) => { acc[key] += purchase[key]; });
    return acc;
  }, { subtotal: 0, vat: 0, discount: 0, transport: 0, total: 0, cash: 0, bank: 0, paid: 0, due: 0 });

  return (
    <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
        <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Purchase Record</h1>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Record Type
          <select className={`${inputClass} mt-1 w-full`} value={details ? 'With Details' : 'Without Details'} onChange={(event) => setDetails(event.target.value === 'With Details')}>
            <option>Without Details</option>
            <option>With Details</option>
          </select>
        </label>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">From
          <input className={`${inputClass} mt-1 w-full`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">To
          <input className={`${inputClass} mt-1 w-full`} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
        <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} placeholder="Search invoice, supplier, note" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search purchase records" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
        </div>
      </form>
      <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg">
        <table className="w-full min-w-[1100px] border-collapse text-xs">
          <thead className="bg-sky-700 text-white"><tr>{['Invoice', 'Date', 'Supplier', 'Subtotal', 'VAT', 'Discount', 'Transport', 'Total', 'Cash', 'Bank', 'Paid', 'Due', 'Note', 'Action'].map((title) => <th key={title} className="border px-2 py-2">{title}</th>)}</tr></thead>
          <tbody>
            {filtered.map((purchase) => <React.Fragment key={purchase.id}>
              <tr className="text-center hover:bg-sky-50">
                <td className="border px-2 py-2 font-mono font-semibold">
                  <Link to={`/purchase/invoice-print?id=${purchase.id}`} className="text-emerald-700 hover:underline">
                    {purchase.invoice}
                  </Link>
                </td>
                <td className="border px-2 py-2">{purchase.date}</td>
                <td className="border px-2 py-2 text-left">{purchase.party}</td>
                {[purchase.subtotal, purchase.vat, purchase.discount, purchase.transport, purchase.total, purchase.cash, purchase.bank, purchase.paid, purchase.due].map((value, index) => <td key={index} className="border px-2 py-2 text-right">{formatMoney(value)}</td>)}
                <td className="border px-2 py-2">{purchase.note || '—'}</td>
                <td className="border px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <Link
                      to={`/purchase/invoice-print?id=${purchase.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold"
                    >
                      <Printer size={12} /> Invoice
                    </Link>
                    <button
                      type="button"
                      className="text-slate-500 hover:text-slate-800 text-xs px-1"
                      onClick={() => setSelected(selected?.id === purchase.id ? null : purchase)}
                    >
                      {selected?.id === purchase.id ? 'Hide' : 'Items'}
                    </button>
                  </div>
                </td>
              </tr>
              {selected?.id === purchase.id && details && <tr><td colSpan="14" className="border bg-slate-50 p-3"><table className="w-full text-left"><thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th className="text-right">Amount</th></tr></thead><tbody>{purchase.items.map((item, index) => <tr key={`${item.productId}-${index}`}><td>{item.name}</td><td>{item.quantity} {item.unit}</td><td>{formatMoney(item.rate)}</td><td className="text-right">{formatMoney(item.total)}</td></tr>)}</tbody></table></td></tr>}
            </React.Fragment>)}
            {!filtered.length && <tr><td colSpan="14" className="border px-3 py-8 text-center text-slate-500">No saved purchases match these filters.</td></tr>}
            {filtered.length > 0 && <tr className="font-bold"><td colSpan="3" className="border px-2 py-2 text-right">Totals</td>{['subtotal', 'vat', 'discount', 'transport', 'total', 'cash', 'bank', 'paid', 'due'].map((key) => <td key={key} className="border px-2 py-2 text-right">{formatMoney(sums[key])}</td>)}<td colSpan="2" className="border" /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseRecord;
