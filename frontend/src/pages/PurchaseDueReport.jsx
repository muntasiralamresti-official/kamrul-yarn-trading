import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { useAccountsState, formatMoney } from '../lib/accountsStore';
import { purchaseDueBySupplier, useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const PurchaseDueReport = () => {
  const admin = useAdminState();
  const { transactions } = useAccountsState();
  const commerce = useCommerceState();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All');
  const [includeZero, setIncludeZero] = useState(false);
  const suppliers = useMemo(() => admin.suppliers.map((supplier) => ({
    ...supplier, due: purchaseDueBySupplier(supplier, transactions),
  })).filter((supplier) => includeZero || supplier.due > 0), [admin, transactions, commerce, includeZero]);
  const areas = [...new Set(suppliers.map((supplier) => supplier.area).filter(Boolean))];
  const filtered = suppliers.filter((supplier) => (area === 'All' || supplier.area === area) &&
    `${supplier.code} ${supplier.name} ${supplier.owner} ${supplier.phone}`.toLowerCase().includes(query.toLowerCase()));
  const total = filtered.reduce((sum, supplier) => sum + supplier.due, 0);

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Supplier Due Report</h1>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Area
        <select className={`${inputClass} mt-1 w-full`} value={area} onChange={(event) => setArea(event.target.value)}>
          <option>All</option>{areas.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} placeholder="Search suppliers" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search supplier due report" />
      <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"><input type="checkbox" checked={includeZero} onChange={(event) => setIncludeZero(event.target.checked)} />With Zero Due</label>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[800px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Code', 'Supplier', 'Owner / Contact', 'Area', 'Phone', 'Due Amount'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>{filtered.map((supplier) => <tr key={supplier.id} className="text-center hover:bg-sky-50"><td className="border px-2 py-2">{supplier.code}</td><td className="border px-2 py-2 text-left">{supplier.name}</td><td className="border px-2 py-2">{supplier.owner || '—'}</td><td className="border px-2 py-2">{supplier.area || '—'}</td><td className="border px-2 py-2">{supplier.phone || '—'}</td><td className="border px-2 py-2 text-right">{formatMoney(supplier.due)}</td></tr>)}
        {!filtered.length && <tr><td colSpan="6" className="border px-3 py-8 text-center text-slate-500">No outstanding balances from saved purchases.</td></tr>}
        {filtered.length > 0 && <tr className="font-bold"><td colSpan="5" className="border px-3 py-2 text-right">Total Due</td><td className="border px-3 py-2 text-right">{formatMoney(total)}</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default PurchaseDueReport;
