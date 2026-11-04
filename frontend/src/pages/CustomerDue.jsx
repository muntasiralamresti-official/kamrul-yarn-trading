import React, { useMemo, useState } from 'react';
import { Printer, MessageCircle, Copy, Check } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { useAccountsState, formatMoney } from '../lib/accountsStore';
import { saleDueByCustomer, useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const CustomerDue = () => {
  const admin = useAdminState();
  const { transactions } = useAccountsState();
  const commerce = useCommerceState();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All');
  const [copiedId, setCopiedId] = useState('');

  const customers = useMemo(() => admin.customers.map((customer) => ({
    ...customer, due: saleDueByCustomer(customer, transactions),
  })).filter((customer) => customer.due > 0), [admin, transactions, commerce]);

  const areas = [...new Set(customers.map((customer) => customer.area).filter(Boolean))];
  const filtered = customers.filter((customer) =>
    (area === 'All' || customer.area === area) &&
    `${customer.code} ${customer.name} ${customer.owner} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())
  );
  const total = filtered.reduce((sum, customer) => sum + customer.due, 0);

  const getDueMessage = (customer) => {
    return `আসসালামু আলাইকুম, জনাব ${customer.name}।\nকামরুল ইয়ার্ন ট্রেডিং (তানবাজার, নারায়ণগঞ্জ) থেকে বিনীতভাবে জানাচ্ছি যে, আপনার হিসাবের মোট বকেয়ার পরিমাণ ৳${Number(customer.due).toLocaleString('en-BD', { minimumFractionDigits: 2 })}।\nঅনুগ্রহ করে বকেয়া পরিশোধের জন্য অনুরোধ জানানো হলো।\nযোগাযোগ: ${admin.company?.phone || '+880 1711-000000'}\nধন্যবাদ,\n${admin.company?.name || 'কামরুল ইয়ার্ন ট্রেডিং'}`;
  };

  const openWhatsApp = (customer) => {
    let phone = String(customer.phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = `88${phone}`;
    } else if (!phone.startsWith('880') && phone.length === 10) {
      phone = `880${phone}`;
    }
    const message = getDueMessage(customer);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const copySms = (customer) => {
    const text = getDueMessage(customer);
    navigator.clipboard?.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(''), 2500);
  };

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Customer Due List & WhatsApp Alert (কাস্টমার বকেয়া ও তাগাদা)</h1>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">Area
        <select className={`${inputClass} mt-1 w-full`} value={area} onChange={(event) => setArea(event.target.value)}>
          <option>All</option>{areas.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <input className={`${inputClass} w-full sm:w-auto sm:min-w-52 sm:flex-1`} placeholder="Search customers..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search customer dues" />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[950px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white">
        <tr>{['Code', 'Customer', 'Owner / Contact', 'Area', 'Phone', 'Due Amount', 'WhatsApp / SMS Alert'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr>
      </thead>
      <tbody>{filtered.map((customer) => (
        <tr key={customer.id} className="text-center hover:bg-sky-50">
          <td className="border px-2 py-2 font-mono text-xs">{customer.code}</td>
          <td className="border px-2 py-2 text-left font-medium text-slate-900">{customer.name}</td>
          <td className="border px-2 py-2">{customer.owner || '—'}</td>
          <td className="border px-2 py-2">{customer.area || '—'}</td>
          <td className="border px-2 py-2">{customer.phone || '—'}</td>
          <td className="border px-2 py-2 text-right font-bold text-rose-700 font-mono">{formatMoney(customer.due)}</td>
          <td className="border px-2 py-2">
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => openWhatsApp(customer)}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors"
                title="Send WhatsApp Due Reminder"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => copySms(customer)}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors"
                title="Copy SMS Message to Clipboard"
              >
                {copiedId === customer.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedId === customer.id ? 'Copied' : 'SMS'}
              </button>
            </div>
          </td>
        </tr>
      ))}
        {!filtered.length && <tr><td colSpan="7" className="border px-3 py-8 text-center text-slate-500">No outstanding customer balances found.</td></tr>}
        {filtered.length > 0 && <tr className="font-bold bg-slate-50"><td colSpan="5" className="border px-3 py-2 text-right">Total Due</td><td className="border px-2 py-2 text-right font-mono text-rose-700">{formatMoney(total)}</td><td className="border"></td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default CustomerDue;
