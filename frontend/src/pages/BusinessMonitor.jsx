import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft, Banknote, Boxes, CircleDollarSign, Landmark, Package,
  ShoppingCart, TrendingUp, Wallet,
} from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { bankBalance, cashBalance, formatMoney, localDate, useAccountsState } from '../lib/accountsStore';
import { purchaseDueBySupplier, saleDueByCustomer, stockForProduct, useCommerceState } from '../lib/commerceStore';

const metrics = [
  { label: "Today's Sales", icon: CircleDollarSign, color: 'bg-blue-500' },
  { label: 'Today’s Collection', icon: Banknote, color: 'bg-amber-600' },
  { label: 'Sales This Year', icon: TrendingUp, color: 'bg-emerald-600' },
  { label: 'Customer Due', icon: ArrowDownLeft, color: 'bg-orange-500' },
  { label: 'Cash Balance', icon: Wallet, color: 'bg-rose-600' },
  { label: 'Bank Balance', icon: Landmark, color: 'bg-yellow-700' },
  { label: 'Stock Value', icon: Package, color: 'bg-blue-500' },
  { label: 'Asset Value', icon: Boxes, color: 'bg-amber-600' },
  { label: 'Supplier Due', icon: ShoppingCart, color: 'bg-emerald-600' },
];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BusinessMonitor = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const admin = useAdminState();
  const accounts = useAccountsState();
  const commerce = useCommerceState();
  const today = localDate();
  const yearSales = commerce.sales.filter((sale) => sale.date.startsWith(`${year}-`));
  const monthlySales = useMemo(() => months.map((label, month) => ({
    label,
    value: yearSales.filter((sale) => Number(sale.date.slice(5, 7)) === month + 1).reduce((sum, sale) => sum + sale.total, 0),
  })), [yearSales]);
  const maxSales = Math.max(1, ...monthlySales.map((item) => item.value));
  const customerDue = admin.customers.reduce((sum, item) => sum + saleDueByCustomer(item, accounts.transactions), 0);
  const supplierDue = admin.suppliers.reduce((sum, item) => sum + purchaseDueBySupplier(item, accounts.transactions), 0);
  const stockValue = admin.products.reduce((sum, product) => {
    const qty = stockForProduct(product, { commerce, admin });
    const lbs = Number(product.lbsPerBag) || 0;
    return sum + (lbs > 0 ? (qty * lbs * product.purchasePrice) : (qty * product.purchasePrice));
  }, 0);
  const metricsValues = [
    commerce.sales.filter((sale) => sale.date === today).reduce((sum, sale) => sum + sale.total, 0),
    accounts.transactions.filter((item) => item.type === 'customer-payment' && item.date === today).reduce((sum, item) => sum + item.amount, 0),
    yearSales.reduce((sum, sale) => sum + sale.total, 0),
    customerDue,
    cashBalance(accounts.transactions),
    accounts.bankAccounts.reduce((sum, account) => sum + bankBalance(account, accounts.transactions), 0),
    stockValue,
    commerce.assets.reduce((sum, asset) => sum + asset.amount, 0),
    supplierDue,
  ];

  return <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
    <section aria-label="Business summary" className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map(({ label, icon: Icon, color }, index) => <article key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${color}`}><Icon size={22} /></div>
        <div><p className="text-sm text-slate-500">{label}</p><p className="font-semibold text-slate-800">{formatMoney(metricsValues[index])}</p></div>
      </article>)}
    </section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div><h1 className="text-lg sm:text-xl font-bold text-slate-800">Business Monitor</h1><p className="mt-1 text-xs sm:text-sm text-slate-500">Saved sales by month for {year} · browser-local records</p></div>
        <label className="text-sm font-medium text-slate-700 flex items-center justify-between sm:justify-start">Year<input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="ml-2 w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm" /></label>
      </div>
      <div className="p-4 sm:p-5">
        {yearSales.length ? <div className="overflow-x-auto custom-scrollbar"><div className="grid h-64 min-w-[550px] grid-cols-12 items-end gap-2 border-b border-l border-slate-200 px-2 pb-2 pt-5">
          {monthlySales.map((item) => <div key={item.label} className="flex h-full min-w-0 flex-col justify-end text-center">
            <div className="mb-1 truncate text-[10px] text-slate-500" title={formatMoney(item.value)}>{item.value ? formatMoney(item.value) : ''}</div>
            <div className="mx-auto w-3/5 rounded-t bg-indigo-500" style={{ height: `${Math.max(item.value ? 4 : 0, (item.value / maxSales) * 75)}%` }} />
            <span className="mt-2 text-xs text-slate-500">{item.label}</span>
          </div>)}
        </div></div> : <p className="rounded-lg bg-slate-50 p-10 text-center text-sm text-slate-500">No saved sales were found for {year}.</p>}
      </div>
    </section>
  </div>;
};

export default BusinessMonitor;
