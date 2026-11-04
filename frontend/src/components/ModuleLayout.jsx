import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ModuleLayout = ({ title, items, description }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">
          {description || `Manage your ${title.toLowerCase()} operations, records, and settings here.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <Link
            to={item.path}
            key={i}
            className="group flex flex-col items-start p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-transform">
               {React.cloneElement(item.icon, { size: 22, strokeWidth: 2 })}
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-sm text-slate-700 group-hover:text-indigo-700 transition-colors">
                {item.name}
              </span>
              <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 transition-all transform -translate-x-2 group-hover:translate-x-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModuleLayout;
