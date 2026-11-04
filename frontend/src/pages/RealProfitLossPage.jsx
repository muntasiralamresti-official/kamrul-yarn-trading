import React, { useMemo, useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { AccountPage } from '../components/Accounts/AccountsUI';
import { useCommerceState } from '../lib/commerceStore';
import { useAdminState } from '../lib/adminStore';
import { useAccountsState, formatMoney, localDate } from '../lib/accountsStore';
import { exportToExcel } from '../lib/excelExport';
import {
  ProfitLossInvoicesTable,
  ProfitLossProductsTable,
  ProfitLossExpensesTable,
} from '../components/ProfitLossTables';

const RealProfitLossPage = () => {
  const commerce = useCommerceState();
  const admin = useAdminState();
  const accounts = useAccountsState();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => localDate());
  const [activeTab, setActiveTab] = useState('invoices');

  const productCostMap = useMemo(() => {
    const map = {};
    admin.products.forEach((p) => {
      map[p.id] = Number(p.purchasePrice) || 0;
      map[p.code] = Number(p.purchasePrice) || 0;
    });
    return map;
  }, [admin.products]);

  const filteredSales = useMemo(() => {
    return commerce.sales.filter((s) => s.date >= startDate && s.date <= endDate);
  }, [commerce.sales, startDate, endDate]);

  const invoiceProfitList = useMemo(() => {
    return filteredSales.map((sale) => {
      let cost = 0;
      (sale.items || []).forEach((item) => {
        const itemCost = productCostMap[item.productId] ?? productCostMap[item.code] ?? (Number(item.rate) * 0.9);
        const qty = Number(item.quantity) || 0;
        const lbsPerBag = Number(item.lbsPerBag) || 0;
        const totalWeight = Number(item.totalWeight) || (lbsPerBag > 0 ? qty * lbsPerBag : 0);
        const lineCost = (item.rateType === 'per_lb' && totalWeight > 0) ? totalWeight * itemCost : qty * itemCost;
        cost += lineCost;
      });
      const revenue = Number(sale.total) || 0;
      const profit = revenue - cost;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
      return { ...sale, revenue, cost, profit, margin };
    });
  }, [filteredSales, productCostMap]);

  const productProfitList = useMemo(() => {
    const map = {};
    filteredSales.forEach((sale) => {
      const saleSubtotal = Number(sale.subtotal) || (sale.items || []).reduce((s, it) => s + (Number(it.total) || 0), 0);
      const discountRatio = saleSubtotal > 0 ? (Number(sale.discount) || 0) / saleSubtotal : 0;

      (sale.items || []).forEach((item) => {
        const key = item.productId || item.name || 'Unknown';
        if (!map[key]) {
          map[key] = { id: key, name: item.name || 'Unnamed', unit: item.unit || 'Bags', quantity: 0, revenue: 0, cost: 0 };
        }
        const qty = Number(item.quantity) || 0;
        const lbsPerBag = Number(item.lbsPerBag) || 0;
        const totalWeight = Number(item.totalWeight) || (lbsPerBag > 0 ? qty * lbsPerBag : 0);
        const grossLine = Number(item.total) || (item.rateType === 'per_lb' && totalWeight > 0 ? totalWeight * Number(item.rate) : qty * Number(item.rate));
        const netLineRevenue = grossLine * (1 - discountRatio);

        const unitCost = productCostMap[item.productId] ?? productCostMap[item.code] ?? 0;
        const lineCost = (item.rateType === 'per_lb' && totalWeight > 0) ? totalWeight * unitCost : qty * unitCost;

        map[key].quantity += qty;
        map[key].revenue += netLineRevenue;
        map[key].cost += lineCost;
      });
    });

    return Object.values(map).map((p) => {
      const profit = p.revenue - p.cost;
      const margin = p.revenue > 0 ? ((profit / p.revenue) * 100).toFixed(1) : 0;
      return { ...p, profit, margin };
    }).sort((a, b) => b.profit - a.profit);
  }, [filteredSales, productCostMap]);

  const filteredExpenses = useMemo(() => {
    return accounts.transactions.filter(
      (t) => ['expense', 'salary-payment'].includes(t.type) && t.date >= startDate && t.date <= endDate
    );
  }, [accounts.transactions, startDate, endDate]);

  const otherIncome = useMemo(() => {
    return accounts.transactions
      .filter((t) => t.type === 'income' && t.date >= startDate && t.date <= endDate)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [accounts.transactions, startDate, endDate]);

  const totalRevenue = invoiceProfitList.reduce((sum, inv) => sum + inv.revenue, 0);
  const totalCogs = invoiceProfitList.reduce((sum, inv) => sum + inv.cost, 0);
  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = grossProfit + otherIncome - totalOperatingExpenses;
  const isNetProfitPositive = netProfit >= 0;

  const handleExportExcel = () => {
    const data = invoiceProfitList.map((inv) => ({
      'Invoice No': inv.invoice,
      Date: inv.date,
      Customer: inv.party,
      'Sales Revenue': inv.revenue,
      'Cost of Goods (COGS)': inv.cost,
      'Gross Profit': inv.profit,
      'Margin %': `${inv.margin}%`,
    }));
    exportToExcel(data, 'profit_and_loss_report', 'Invoices_Profit');
  };

  return (
    <AccountPage title="Real Profit & Loss Statement (প্রকৃত লাভ-ক্ষতি হিসাব)">
      <div className="space-y-6">
        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-end justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">From Date (শুরুর তারিখ)</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs bg-slate-50 border border-slate-300 rounded px-3 py-1.5 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">To Date (শেষের তারিখ)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs bg-slate-50 border border-slate-300 rounded px-3 py-1.5 outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-medium transition-colors">
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors">
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* High Level KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">বিক্রয় রাজস্ব (Revenue)</span>
            <p className="text-lg font-bold text-slate-800 mt-1">{formatMoney(totalRevenue)}</p>
            <span className="text-[11px] text-slate-400">{invoiceProfitList.length} Invoices</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">ক্রয়মূল্য (COGS)</span>
            <p className="text-lg font-bold text-slate-700 mt-1">{formatMoney(totalCogs)}</p>
            <span className="text-[11px] text-slate-400">Total Purchase Cost</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">গ্রস প্রফিট (Gross Profit)</span>
            <p className={`text-lg font-bold mt-1 ${grossProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
              {formatMoney(grossProfit)}
            </p>
            <span className="text-[11px] font-semibold text-indigo-500">{grossMargin}% Margin</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">পরিচালন খরচ (Expenses)</span>
            <p className="text-lg font-bold text-rose-600 mt-1">{formatMoney(totalOperatingExpenses)}</p>
            <span className="text-[11px] text-slate-400">Office + Salaries</span>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isNetProfitPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${isNetProfitPositive ? 'text-emerald-800' : 'text-red-800'}`}>
              নিট লাভ / ক্ষতি (Net Profit)
            </span>
            <p className={`text-xl font-black mt-1 ${isNetProfitPositive ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatMoney(netProfit)}
            </p>
            <span className={`text-[11px] font-medium ${isNetProfitPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isNetProfitPositive ? 'Net In-Pocket Profit' : 'Net Business Loss'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 print:hidden text-xs font-semibold gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap pb-1">
          <button onClick={() => setActiveTab('invoices')} className={`pb-2 shrink-0 transition-colors ${activeTab === 'invoices' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            ইয়ার্ন ইনভয়েস ভিত্তিক লাভ ({invoiceProfitList.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`pb-2 shrink-0 transition-colors ${activeTab === 'products' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            সুতা কাউন্ট ও আইটেম ভিত্তিক লাভ ({productProfitList.length})
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`pb-2 shrink-0 transition-colors ${activeTab === 'expenses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            দোকান ও পরিচালন খরচ তালিকা ({filteredExpenses.length})
          </button>
        </div>

        {/* Tab 1: Invoices Breakdown Table */}
        {activeTab === 'invoices' && <ProfitLossInvoicesTable list={invoiceProfitList} />}

        {/* Tab 2: Product / Yarn Count Breakdown */}
        {activeTab === 'products' && <ProfitLossProductsTable list={productProfitList} />}

        {/* Tab 3: Operating Expenses List */}
        {activeTab === 'expenses' && <ProfitLossExpensesTable list={filteredExpenses} />}
      </div>
    </AccountPage>
  );
};

export default RealProfitLossPage;
