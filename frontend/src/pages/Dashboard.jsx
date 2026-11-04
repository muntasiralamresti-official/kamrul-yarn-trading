import React from 'react';
import { DollarSign, ShoppingCart, BookOpen, Users, FileText, Settings, BarChart2, Package, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminState } from '../lib/adminStore';
import { formatMoney, localDate, useAccountsState } from '../lib/accountsStore';
import { saleDueByCustomer, stockForProduct, useCommerceState } from '../lib/commerceStore';
import DashboardCharts from '../components/DashboardCharts';

const quickActions = [
  { name: 'New Sale', path: '/sales/entry', bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
  { name: 'New Purchase', path: '/purchase/entry', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  { name: 'Collect Payment', path: '/accounts/customer-payment', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
  { name: 'Check Stock', path: '/sales/stock', bg: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200' },
];

const modules = [
  { name: 'Sales & Invoicing', path: '/sales', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Procurement', path: '/purchase', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Accounting', path: '/accounts', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'HR & Payroll', path: '/hr', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Reports & Analytics', path: '/reports', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'Administration', path: '/admin', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
  { name: 'Business Monitor', path: '/monitor', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const Dashboard = () => {
  const admin = useAdminState();
  const commerce = useCommerceState();
  const { transactions } = useAccountsState();
  const month = localDate().slice(0, 7);
  const monthSales = commerce.sales.filter((sale) => sale.date.startsWith(month)).reduce((sum, sale) => sum + sale.total, 0);
  const monthPurchases = commerce.purchases.filter((purchase) => purchase.date.startsWith(month)).reduce((sum, purchase) => sum + purchase.total, 0);
  const customerDue = admin.customers.reduce((sum, customer) => sum + saleDueByCustomer(customer, transactions), 0);
  const productsBelowReorder = admin.products.filter((product) => stockForProduct(product, { commerce, admin }) <= product.reorderLevel).length;
  const stats = [
    { title: 'Sales this month', amount: formatMoney(monthSales), icon: DollarSign, color: 'bg-blue-500' },
    { title: 'Customer outstanding', amount: formatMoney(customerDue), icon: Activity, color: 'bg-red-500' },
    { title: 'Purchases this month', amount: formatMoney(monthPurchases), icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Products at reorder level', amount: String(productsBelowReorder), icon: Package, color: 'bg-purple-500' },
  ];
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Business overview</h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm">Current-month activity from records saved in this browser.</p>
         </div>
         <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.path} className={`px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-all shadow-sm whitespace-nowrap ${action.bg}`}>
                 {action.name}
              </Link>
            ))}
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1">{stat.title}</p>
                   <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{stat.amount}</h3>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${stat.color}`}>
                   <stat.icon size={22} />
                </div>
             </div>
             <div className="mt-3 sm:mt-4 flex items-center text-xs text-slate-500">
                <span>Based on saved records</span>
             </div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
         <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4">Business Modules</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {modules.map((mod, i) => (
              <Link to={mod.path} key={i} className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
                 <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${mod.bg} ${mod.color}`}>
                    <mod.icon size={24} />
                 </div>
                 <span className="font-semibold text-slate-700 text-xs sm:text-sm">{mod.name}</span>
              </Link>
            ))}
         </div>
      </div>

      {/* Visual Analytics */}
      <DashboardCharts sales={commerce.sales} purchases={commerce.purchases} />

    </div>
  );
};

export default Dashboard;
