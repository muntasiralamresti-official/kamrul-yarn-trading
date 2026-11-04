import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const SupplierList = () => {
  const admin = useAdminState();
  const suppliers = useMemo(() => admin.suppliers.map((supplier) => ({
      ...supplier,
      owner: supplier.owner || '',
      address: supplier.address || '',
      phone: supplier.phone || '',
    })), [admin.suppliers]);
  const [searchType, setSearchType] = useState('All');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(true);
  const filtered = useMemo(() => suppliers.filter((supplier) => {
    const haystack = searchType === 'All'
      ? `${supplier.code} ${supplier.name} ${supplier.owner} ${supplier.address} ${supplier.phone}`
      : supplier[searchType];
    return haystack.toLowerCase().includes(query.toLowerCase());
  }), [query, searchType, suppliers]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
      <form onSubmit={(event) => { event.preventDefault(); setShown(true); }} className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-200 p-3 sm:p-4">
        <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Supplier List</h1>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Search Type
          <select className={`${inputClass} mt-1 w-full`} value={searchType} onChange={(event) => setSearchType(event.target.value)}>
            <option value="All">All</option>
            <option value="code">Supplier Code</option>
            <option value="name">Supplier Name</option>
          </select>
        </label>
        <button className="w-full sm:w-auto rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700">Show Report</button>
      </form>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input className={`${inputClass} w-full sm:max-w-sm`} placeholder="Search suppliers..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search suppliers" />
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0"><Printer size={16} /> Print</button>
      </div>
      {shown && <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full min-w-187.5 border-collapse text-sm">
          <thead className="bg-sky-700 text-white"><tr>{['Sl', 'Supplier Code', 'Supplier Name', 'Owner Name', 'Address', 'Phone'].map((title) => <th key={title} className="border border-slate-300 px-3 py-1">{title}</th>)}</tr></thead>
          <tbody>{filtered.map((supplier, index) => <tr key={supplier.code} className="text-center hover:bg-sky-50"><td className="border px-2 py-1">{index + 1}</td><td className="border px-2 py-1">{supplier.code}</td><td className="border px-2 py-1">{supplier.name}</td><td className="border px-2 py-1">{supplier.owner}</td><td className="border px-2 py-1">{supplier.address}</td><td className="border px-2 py-1">{supplier.phone}</td></tr>)}
            {!filtered.length && <tr><td colSpan="6" className="border px-3 py-8 text-center text-slate-500">No saved suppliers found.</td></tr>}
          </tbody>
        </table>
      </div>}
    </div>
  );
};

export default SupplierList;
