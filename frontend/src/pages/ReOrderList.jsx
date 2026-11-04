import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { stockForProduct, useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const ReOrderList = () => {
  const admin = useAdminState();
  const commerce = useCommerceState();
  const [query, setQuery] = useState('');
  const products = useMemo(() => admin.products.map((product) => ({
    ...product, stock: stockForProduct(product, { commerce, admin }),
  })).filter((product) => product.stock <= product.reorderLevel), [admin, commerce]);
  const filtered = products.filter((item) => `${item.code} ${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Re-Order List</h1>
      <p className="w-full sm:flex-1 text-xs sm:text-sm text-slate-600">Products at or below their saved reorder level.</p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <input className={`${inputClass} w-full sm:w-auto sm:min-w-52`} placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search reorder list" />
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[750px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Product Id', 'Product Name', 'Category', 'Current Stock', 'Minimum Stock', 'Reorder Quantity', 'Status'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id} className="text-center hover:bg-sky-50"><td className="border px-2 py-2">{item.code}</td><td className="border px-2 py-2 text-left">{item.name}</td><td className="border px-2 py-2">{item.category}</td><td className="border px-2 py-2">{item.stock} {item.unit}</td><td className="border px-2 py-2">{item.reorderLevel} {item.unit}</td><td className="border px-2 py-2">{Math.max(item.reorderLevel - item.stock, 0)} {item.unit}</td><td className="border px-2 py-2"><span className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Reorder</span></td></tr>)}
        {!filtered.length && <tr><td colSpan="7" className="border px-3 py-8 text-center text-slate-500">No saved products are below their reorder level.</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default ReOrderList;
