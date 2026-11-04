import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';

const Header = ({ onToggleSidebar }) => {
  const { company } = useAdminState();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-BD', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0 truncate text-xs sm:text-sm font-semibold text-slate-700">
          {company.name || 'Kamrul Yarn Trading'}
        </div>
      </div>
      <div className="rounded-full border border-slate-100 bg-slate-50 px-2.5 sm:px-4 py-1 text-xs sm:text-sm font-medium text-slate-500 shrink-0">
        {formattedDate}
      </div>
    </header>
  );
};

export default Header;

