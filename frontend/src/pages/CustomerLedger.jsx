import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { formatMoney, localDate, useAccountsState } from '../lib/accountsStore';
import { useCommerceState } from '../lib/commerceStore';

const inputClass = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const CustomerLedger = () => {
  const admin = useAdminState();
  const { transactions } = useAccountsState();
  const { sales, salesReturns } = useCommerceState();
  const [customer, setCustomer] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => localDate());

  const selectedCustomer = admin.customers.find((item) => item.name === customer);
  const openingBalance = Number(selectedCustomer?.openingBalance) || 0;

  const events = useMemo(() => [
    ...sales.filter((sale) => sale.party === customer).map((sale) => ({
      id: sale.id, date: sale.date, description: `Sales invoice ${sale.invoice}`,
      bill: sale.total, paid: sale.paid, due: sale.due, returned: 0, received: 0,
    })),
    ...salesReturns.filter((item) => item.party === customer).map((item) => ({
      id: item.id, date: item.date, description: `Sales return ${item.number} · ${item.invoice}`,
      bill: 0, paid: 0, due: 0, returned: item.amount, received: 0,
    })),
    ...transactions.filter((item) => item.type === 'customer-payment' && item.party === customer && !item.invoicePayment).map((item) => ({
      id: item.id, date: item.date, description: `Customer receipt (${item.method}) ${item.reference || ''}`,
      bill: 0, paid: 0, due: 0, returned: 0, received: item.amount,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)), [sales, salesReturns, transactions, customer]);

  const priorBalance = useMemo(() => {
    if (!customer) return 0;
    const priorNet = events.filter((e) => e.date < startDate).reduce(
      (sum, item) => sum + item.bill - item.paid - item.returned - item.received, 0
    );
    return openingBalance + priorNet;
  }, [customer, events, startDate, openingBalance]);

  const rows = useMemo(() => {
    let running = priorBalance;
    return events.filter((item) => item.date >= startDate && item.date <= endDate).map((item) => {
      running = running + item.bill - item.paid - item.returned - item.received;
      return { ...item, balance: running };
    });
  }, [events, startDate, endDate, priorBalance]);

  const closingBalance = rows.length ? rows[rows.length - 1].balance : priorBalance;

  return <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4 md:p-6">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-200 bg-white p-3 sm:p-4">
      <h1 className="w-full text-base sm:text-lg font-semibold text-slate-800">Customer Ledger (কাস্টমার লেজার)</h1>
      <label className="text-xs sm:text-sm text-slate-700 w-full sm:w-auto">Customer
        <select className={`${inputClass} mt-1 w-full sm:min-w-60`} value={customer} onChange={(event) => setCustomer(event.target.value)}>
          <option value="">Select customer</option>
          {admin.customers.map((item) => <option key={item.id} value={item.name}>{item.name} - {item.code}</option>)}
        </select>
      </label>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">From
        <input className={`${inputClass} mt-1 w-full`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label className="text-xs sm:text-sm text-slate-700 flex-1 sm:flex-initial">To
        <input className={`${inputClass} mt-1 w-full`} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </label>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600 hover:text-slate-800"><Printer size={16} />Print</button>
      </div>
      {selectedCustomer && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div><span className="font-semibold text-slate-700">Phone:</span> {selectedCustomer.phone || '-'}</div>
          <div><span className="font-semibold text-slate-700">Address:</span> {selectedCustomer.address || '-'}</div>
          <div><span className="font-semibold text-slate-700">Opening Due:</span> {formatMoney(openingBalance)}</div>
          <div><span className="font-semibold text-slate-700">Closing Balance:</span> <span className="font-bold text-sky-800">{formatMoney(closingBalance)}</span></div>
        </div>
      )}
    </div>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[950px] border-collapse text-sm">
      <thead className="bg-sky-700 text-white"><tr>{['Date', 'Description', 'Bill', 'Paid', 'Invoice Due', 'Returned', 'Received Later', 'Balance'].map((title) => <th key={title} className="border px-3 py-2">{title}</th>)}</tr></thead>
      <tbody>
        {customer && (priorBalance !== 0 || (openingBalance > 0 && startDate <= '2000-01-01')) && (
          <tr className="bg-amber-50/70 font-semibold text-slate-800">
            <td className="border px-2 py-2 text-center">{startDate > '2000-01-01' ? startDate : 'Initial'}</td>
            <td className="border px-2 py-2 text-left">Opening Balance (পূর্বের জের)</td>
            <td className="border px-2 py-2 text-right">-</td>
            <td className="border px-2 py-2 text-right">-</td>
            <td className="border px-2 py-2 text-right">-</td>
            <td className="border px-2 py-2 text-right">-</td>
            <td className="border px-2 py-2 text-right">-</td>
            <td className="border px-2 py-2 text-right font-bold text-amber-900">{formatMoney(priorBalance)}</td>
          </tr>
        )}
        {rows.map((item) => <tr key={item.id} className="text-center hover:bg-sky-50"><td className="border px-2 py-2">{item.date}</td><td className="border px-2 py-2 text-left">{item.description}</td>{[item.bill, item.paid, item.due, item.returned, item.received, item.balance].map((amount, index) => <td key={index} className="border px-2 py-2 text-right">{formatMoney(amount)}</td>)}</tr>)}
        {!customer && <tr><td colSpan="8" className="border px-3 py-8 text-center text-slate-500">Select a customer to view saved sales, returns, and receipts.</td></tr>}
        {customer && !rows.length && priorBalance === 0 && <tr><td colSpan="8" className="border px-3 py-8 text-center text-slate-500">No ledger activity for this customer and date range.</td></tr>}
        {(rows.length > 0 || priorBalance !== 0) && customer && <tr className="font-bold bg-slate-50"><td colSpan="2" className="border px-3 py-2 text-right">Period Totals</td>{['bill', 'paid', 'due', 'returned', 'received'].map((key) => <td key={key} className="border px-2 py-2 text-right">{formatMoney(rows.reduce((sum, item) => sum + item[key], 0))}</td>)}<td className="border px-2 py-2 text-right text-sky-800">{formatMoney(closingBalance)}</td></tr>}
      </tbody>
    </table></div>
  </div>;
};

export default CustomerLedger;
