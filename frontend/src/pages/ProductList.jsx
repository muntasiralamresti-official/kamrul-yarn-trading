import React, { useMemo, useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { stockForProduct, useCommerceState } from '../lib/commerceStore';
import { exportToExcel } from '../lib/excelExport';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const ProductList = () => {
  const admin = useAdminState();
  const commerce = useCommerceState();
  const products = useMemo(() => admin.products.length
    ? admin.products.map((product) => ({
      id: product.code,
      name: product.name,
      yarnCount: product.yarnCount || '—',
      yarnType: product.yarnType || 'Carded',
      brand: product.brand || '—',
      lotNo: product.lotNo || '—',
      category: product.category,
      purchase: product.purchasePrice,
      sales: product.salesPrice,
      stock: stockForProduct(product, { commerce, admin }),
      unit: product.unit,
    }))
    : [], [admin, commerce]);
  const [searchType, setSearchType] = useState('All');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showReport, setShowReport] = useState(true);
  const categories = [...new Set(products.map((item) => item.category))];
  const filtered = useMemo(() => products.filter((item) => (
    (category === 'All' || item.category === category) &&
    (searchType === 'All'
      ? `${item.id} ${item.name} ${item.yarnCount} ${item.brand} ${item.lotNo} ${item.category}`
      : searchType === 'Product Name' ? item.name : item.id
    ).toLowerCase().includes(query.toLowerCase())
  )), [query, category, searchType, products]);

  const handleExportExcel = () => {
    const data = filtered.map((p) => ({
      'Product Code': p.id,
      'Product Name': p.name,
      'Yarn Count': p.yarnCount,
      'Yarn Type': p.yarnType,
      'Mill / Brand': p.brand,
      'Lot No': p.lotNo,
      Category: p.category,
      'Purchase Rate': p.purchase,
      'Sales Rate': p.sales,
      'Current Stock': `${p.stock} ${p.unit}`,
    }));
    exportToExcel(data, 'yarn_product_list', 'Products');
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
      <form onSubmit={(event) => { event.preventDefault(); setShowReport(true); }} className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-100 p-3 sm:p-4">
        <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Yarn Product Directory</h1>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Search Type
          <select className={`${inputClass} mt-1 w-full`} value={searchType} onChange={(event) => setSearchType(event.target.value)}>
            <option>All</option><option>Product Name</option><option>Product Id</option>
          </select>
        </label>
        <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Category
          <select className={`${inputClass} mt-1 w-full`} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>{categories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <button className="w-full sm:w-auto rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700">Filter</button>
      </form>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input className={`${inputClass} w-full sm:max-w-sm`} placeholder="Search by name, count, mill, lot..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products" />
        <div className="flex items-center gap-2 justify-end">
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-xs sm:text-sm text-emerald-700 hover:bg-emerald-100 font-medium"><FileSpreadsheet size={16} /> Excel</button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} /> Print</button>
        </div>
      </div>
      {showReport && <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-xs">
          <thead className="bg-sky-700 text-white"><tr>{['SL', 'Code', 'Yarn Name', 'Count & Type', 'Mill / Brand', 'Lot No', 'Category', 'Purchase Rate', 'Sales Rate', 'Current Stock'].map((title) => <th key={title} className="border border-slate-300 px-3 py-2">{title}</th>)}</tr></thead>
          <tbody>{filtered.map((item, index) => <tr key={item.id} className="text-center hover:bg-sky-50">
            <td className="border px-2 py-2">{index + 1}</td>
            <td className="border px-2 py-2 font-mono font-bold text-sky-800">{item.id}</td>
            <td className="border px-2 py-2 text-left font-medium">{item.name}</td>
            <td className="border px-2 py-2">{item.yarnCount !== '—' ? `${item.yarnCount} (${item.yarnType})` : '—'}</td>
            <td className="border px-2 py-2">{item.brand}</td>
            <td className="border px-2 py-2 font-mono">{item.lotNo}</td>
            <td className="border px-2 py-2">{item.category}</td>
            <td className="border px-2 py-2 text-right">{item.purchase.toFixed(2)}</td>
            <td className="border px-2 py-2 text-right font-semibold">{item.sales.toFixed(2)}</td>
            <td className="border px-2 py-2 text-right font-bold text-slate-800">{item.stock} {item.unit}</td>
          </tr>)}
            {!filtered.length && <tr><td colSpan="10" className="border px-3 py-8 text-center text-slate-500">No saved yarn products found.</td></tr>}
          </tbody>
        </table>
      </div>}
    </div>
  );
};

export default ProductList;
