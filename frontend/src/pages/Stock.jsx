import React, { useMemo, useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { formatMoney } from '../lib/accountsStore';
import { stockForProduct, useCommerceState } from '../lib/commerceStore';
import { exportToExcel } from '../lib/excelExport';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const Stock = () => {
  const admin = useAdminState();
  const commerce = useCommerceState();
  const [query, setQuery] = useState('');
  const [includeZero, setIncludeZero] = useState(false);
  const products = useMemo(() => admin.products.map((product) => ({
    ...product,
    quantity: stockForProduct(product, { commerce, admin }),
    rate: product.purchasePrice,
  })).filter((product) => includeZero || product.quantity !== 0), [admin, commerce, includeZero]);
  const filtered = products.filter((product) => `${product.code} ${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const value = filtered.reduce((sum, product) => {
    const lbs = Number(product.lbsPerBag) || 0;
    const itemValue = lbs > 0 ? (product.quantity * lbs * product.rate) : (product.quantity * product.rate);
    return sum + itemValue;
  }, 0);

  const handleExportStock = () => {
    const exportData = filtered.map((p) => {
      const lbs = Number(p.lbsPerBag) || 0;
      const totalWeight = lbs > 0 ? p.quantity * lbs : 0;
      return {
        'Product Code': p.code,
        'Product Name': p.name,
        Category: p.category,
        Unit: p.unit,
        'Stock Quantity': p.quantity,
        'Total Weight (Lbs)': totalWeight || '—',
        'Purchase Rate': p.purchasePrice,
        'Sales Rate': p.salesPrice,
        'Total Stock Value': lbs > 0 ? (totalWeight * p.rate) : (p.quantity * p.rate),
      };
    });
    exportToExcel(exportData, 'stock_report', 'Current_Stock');
  };

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Stock Report (মজুদ প্রতিবেদন)</h1>
      <p className="w-full text-xs sm:text-sm text-slate-600">Opening stock + purchases + sales returns − sales − purchase returns − recorded damage.</p>
      <input className={`${inputClass} w-full sm:flex-1 sm:min-w-52`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search stock" />
      <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"><input type="checkbox" checked={includeZero} onChange={(event) => setIncludeZero(event.target.checked)} />With zero stock</label>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={handleExportStock} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-xs sm:text-sm text-emerald-700 hover:bg-emerald-100 font-medium"><FileSpreadsheet size={16} />Excel</button>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[850px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Product Id', 'Product Details', 'Category', 'Current Quantity & Weight', 'Purchase Rate', 'Stock Value'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>{filtered.map((product) => {
        const lbs = Number(product.lbsPerBag) || 0;
        const totalWeight = lbs > 0 ? product.quantity * lbs : 0;
        const lineVal = lbs > 0 ? (totalWeight * product.rate) : (product.quantity * product.rate);
        return (
          <tr key={product.id} className="text-center hover:bg-sky-50">
            <td className="border px-2 py-2">{product.code}</td>
            <td className="border px-2 py-2 text-left">
              <div className="font-semibold text-slate-900">{product.name}</div>
              {(product.yarnCount || product.brand || product.lotNo) && (
                <div className="text-xs text-slate-500">
                  {[product.yarnCount && `Count: ${product.yarnCount}`, product.brand && `Mill: ${product.brand}`, product.lotNo && `Lot: ${product.lotNo}`].filter(Boolean).join(' | ')}
                </div>
              )}
            </td>
            <td className="border px-2 py-2">{product.category}</td>
            <td className="border px-2 py-2 text-right">
              {product.quantity} {product.unit || 'Bags'}
              {totalWeight > 0 && <span className="text-xs text-slate-500 block">({totalWeight.toLocaleString()} Lbs)</span>}
            </td>
            <td className="border px-2 py-2 text-right">
              {formatMoney(product.rate)}
              <span className="text-xs text-slate-500 block">{lbs > 0 ? '/ Lb' : `/${product.unit || 'Bag'}`}</span>
            </td>
            <td className="border px-2 py-2 text-right font-medium">{formatMoney(lineVal)}</td>
          </tr>
        );
      })}
        {!filtered.length && <tr><td colSpan="6" className="border px-3 py-8 text-center text-slate-500">No saved products match this stock report.</td></tr>}
        {filtered.length > 0 && <tr className="font-bold bg-slate-50"><td colSpan="5" className="border px-3 py-2 text-right">Total Stock Value (মোট মজুদ মূল্য)</td><td className="border px-2 py-2 text-right text-sky-900">{formatMoney(value)}</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default Stock;
