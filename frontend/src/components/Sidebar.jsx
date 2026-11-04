import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DollarSign, ShoppingCart, BookOpen, Users, FileText, Settings, BarChart2, UserCheck, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: DollarSign },
  { name: 'Purchase', path: '/purchase', icon: ShoppingCart },
  { name: 'Accounts', path: '/accounts', icon: BookOpen },
  { name: 'ব্যক্তিগত দেনা-পাওনা', path: '/accounts/personal-ledger', icon: UserCheck },
  { name: 'HR & Payroll', path: '/hr', icon: Users },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Administration', path: '/admin', icon: Settings },
  { name: 'Business Monitor', path: '/monitor', icon: BarChart2 },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/30 shrink-0">
            KY
          </div>
          <span className="ml-3 font-semibold text-white tracking-wide truncate text-sm">
            Kamrul Yarn Trading
          </span>
        </div>
        <button
          onClick={onClose}
          type="button"
          aria-label="Close sidebar"
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Main Menu
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} className="mr-3 shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

