import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DollarSign, ShoppingCart, TrendingUp, Menu } from 'lucide-react';

const MobileBottomNav = ({ onOpenMenu }) => {
  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 flex items-center justify-around h-15">
      <NavLink to="/" end className={navLinkClass}>
        <LayoutDashboard size={20} />
        <span className="text-[10px] mt-0.5">Overview</span>
      </NavLink>

      <NavLink to="/sales" className={navLinkClass}>
        <DollarSign size={20} />
        <span className="text-[10px] mt-0.5">Sales</span>
      </NavLink>

      <NavLink to="/purchase" className={navLinkClass}>
        <ShoppingCart size={20} />
        <span className="text-[10px] mt-0.5">Purchase</span>
      </NavLink>

      <NavLink to="/reports/profit-loss" className={navLinkClass}>
        <TrendingUp size={20} />
        <span className="text-[10px] mt-0.5">P & L</span>
      </NavLink>

      <button
        onClick={onOpenMenu}
        type="button"
        className="flex flex-col items-center justify-center flex-1 py-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Open Full Navigation Menu"
      >
        <Menu size={20} />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
