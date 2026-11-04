import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { localDate, formatMoney } from '../lib/accountsStore';
import { useCommerceState } from '../lib/commerceStore';
import { exportToExcel } from '../lib/excelExport';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const SalesRecord = () => {
  const { sales } = useCommerceState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => localDate());
  const [recordType, setRecordType] = useState('Without Details');
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => sales.filter((sale) => (
    sale.date >= startDate && sale.date <= endDate &&
    `${sale.invoice} ${sale.party} ${sale.note}`.toLowerCase().includes(query.toLowerCase())
  )), [sales, query, startDate, endDate]);
  const sums = filtered.reduce((acc, sale) => {
    ['subtotal', 'vat', 'discount', 'transport', 'total', 'cash', 'bank', 'paid', 'due'].forEach((key) => { acc[key] += sale[key]; });
    return acc;
  }, { subtotal: 0, vat: 0, discount: 0, transport: 0, total: 0, cash: 0, bank: 0, paid: 0, due: 0 });

  const handleExportSales = () => {
    const exportData = filtered.map((s) => ({
      Invoice: s.invoice,
      Date: s.date,
      Customer: s.party,
      Subtotal: s.subtotal,
      VAT: s.vat,
      Discount: s.discount,
      Transport: s.transport,
      Total: s.total,
      Cash: s.cash,
      Bank: s.bank,
      Paid: s.paid,
      Due: s.due,
      Note: s.note || '',
    }));
    exportToExcel(exportData, 'sales_records', 'Sales');
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
        <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Sales Record</h1>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Record Type
          <select className={`${inputClass} mt-1 w-full`} value={recordType} onChange={(event) => setRecordType(event.target.value)}>
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
        <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} placeholder="Search invoice, customer, note" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search sales records" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button type="button" onClick={handleExportSales} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-xs sm:text-sm text-emerald-700 hover:bg-emerald-100 font-medium"><FileSpreadsheet size={16} />Excel</button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
        </div>
      </form>
      <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg">
        <table className="w-full min-w-[1100px] border-collapse text-xs">
          <thead className="bg-sky-700 text-white"><tr>{['Invoice', 'Date', 'Customer', 'Subtotal', 'VAT', 'Discount', 'Transport', 'Total', 'Cash', 'Bank', 'Paid', 'Due', 'Note', 'Action'].map((title) => <th key={title} className="border px-2 py-2">{title}</th>)}</tr></thead>
          <tbody>
            {filtered.map((sale) => <React.Fragment key={sale.id}>
              <tr className="text-center hover:bg-sky-50">
                <td className="border px-2 py-2 font-mono font-semibold">
                  <Link to={`/sales/invoice?id=${sale.id}`} className="text-indigo-600 hover:underline">
                    {sale.invoice}
                  </Link>
                </td>
                <td className="border px-2 py-2">{sale.date}</td>
                <td className="border px-2 py-2 text-left">{sale.party}</td>
                {[sale.subtotal, sale.vat, sale.discount, sale.transport, sale.total, sale.cash, sale.bank, sale.paid, sale.due].map((value, index) => <td key={index} className="border px-2 py-2 text-right">{formatMoney(value)}</td>)}
                <td className="border px-2 py-2">{sale.note || '—'}</td>
                <td className="border px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <Link
                      to={`/sales/invoice?id=${sale.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold"
                    >
                      <Printer size={12} /> Invoice
                    </Link>
                    <button
                      type="button"
                      className="text-slate-500 hover:text-slate-800 text-xs px-1"
                      onClick={() => setSelected(selected?.id === sale.id ? null : sale)}
                    >
                      {selected?.id === sale.id ? 'Hide' : 'Items'}
                    </button>
                  </div>
                </td>
              </tr>
              {selected?.id === sale.id && recordType === 'With Details' && <tr><td colSpan="14" className="border bg-slate-50 p-3"><table className="w-full text-left"><thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th className="text-right">Amount</th></tr></thead><tbody>{sale.items.map((item, index) => <tr key={`${item.productId}-${index}`}><td>{item.name}</td><td>{item.quantity} {item.unit}</td><td>{formatMoney(item.rate)}</td><td className="text-right">{formatMoney(item.total)}</td></tr>)}</tbody></table></td></tr>}
            </React.Fragment>)}
            {!filtered.length && <tr><td colSpan="14" className="border px-3 py-8 text-center text-slate-500">No saved sales match these filters.</td></tr>}
            {filtered.length > 0 && <tr className="font-bold"><td colSpan="3" className="border px-2 py-2 text-right">Totals</td>{['subtotal', 'vat', 'discount', 'transport', 'total', 'cash', 'bank', 'paid', 'due'].map((key) => <td key={key} className="border px-2 py-2 text-right">{formatMoney(sums[key])}</td>)}<td colSpan="2" className="border" /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRecord;
