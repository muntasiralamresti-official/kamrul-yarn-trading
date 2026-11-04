import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatMoney } from '../lib/accountsStore';

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const DashboardCharts = ({ sales = [], purchases = [] }) => {
  // Generate last 6 months list and compare data
  const monthlyData = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      list.push({ key: mStr, label });
    }

    return list.map((m) => {
      const sTotal = sales
        .filter((s) => s.date?.startsWith(m.key))
        .reduce((sum, s) => sum + (Number(s.total) || 0), 0);
      const pTotal = purchases
        .filter((p) => p.date?.startsWith(m.key))
        .reduce((sum, p) => sum + (Number(p.total) || 0), 0);
      return {
        month: m.label,
        Sales: sTotal,
        Purchase: pTotal,
      };
    });
  }, [sales, purchases]);

  // Top Products by Quantity or Sales Value
  const productMap = {};
  sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const name = item.name || item.code || 'Other';
      productMap[name] = (productMap[name] || 0) + (Number(item.total) || 0);
    });
  });

  const topProducts = Object.entries(productMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const hasSalesData = topProducts.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Sales vs Purchase Chart (2 Cols) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Sales vs Purchase Overview</h3>
            <p className="text-xs text-slate-500">6-Month financial comparison</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                formatter={(val) => [formatMoney(val), '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Purchase" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Selling Products Donut Chart (1 Col) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Top Selling Products</h3>
          <p className="text-xs text-slate-500 mb-2">Revenue contribution by yarn count</p>
        </div>

        {hasSalesData ? (
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [formatMoney(val), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-60 flex items-center justify-center text-xs text-slate-400">
            No product sales recorded yet.
          </div>
        )}

        <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto">
          {topProducts.map((prod, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{prod.name}</span>
              </div>
              <span className="font-semibold text-slate-700 shrink-0">{formatMoney(prod.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
