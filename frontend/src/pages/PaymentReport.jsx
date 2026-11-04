import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields, accountInputClass } from '../components/Accounts/AccountsUI';
import { formatMoney, useAccountsState } from '../lib/accountsStore';

const PaymentReport = () => {
  const { transactions } = useAccountsState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('All');
  const filtered = useMemo(() => transactions.filter((payment) => payment.type === 'supplier-payment' && (
    payment.date >= startDate && payment.date <= endDate &&
    (method === 'All' || payment.method === method) &&
    `${payment.id} ${payment.party} ${payment.reference}`.toLowerCase().includes(query.toLowerCase())
  )), [transactions, query, startDate, endDate, method]);
  const rows = filtered.map((payment, index) => <tr key={payment.id} className="text-center hover:bg-sky-50">
    <td className="border px-2 py-1">{index + 1}</td><td className="border px-2 py-1">{payment.reference || payment.id}</td><td className="border px-2 py-1">{payment.date}</td>
    <td className="border px-2 py-1 text-left">{payment.party}</td><td className="border px-2 py-1">{payment.method}</td><td className="border px-2 py-1">{payment.reference || '—'}</td>
    <td className="border px-2 py-1 text-right">{formatMoney(payment.amount)}</td><td className="border px-2 py-1">{payment.description || '—'}</td>
  </tr>);

  return (
    <AccountPage title="Supplier Payment Report">
      <AccountFilterPanel title="Search Supplier Payments" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-slate-700">Payment Type<select className={`${accountInputClass} mt-1`} value={method} onChange={(event) => setMethod(event.target.value)}><option>All</option><option>Cash</option><option>Bank</option></select></label>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold">Total paid: {formatMoney(filtered.reduce((sum, payment) => sum + payment.amount, 0))}</p>
      <AccountTable columns={['Sl.', 'Receipt No.', 'Date', 'Supplier', 'Method', 'Reference', 'Amount', 'Note']} rows={rows} emptyMessage="No supplier payments recorded for this period. Record payments in Accounts → Supplier Payment." />
    </AccountPage>
  );
};

export default PaymentReport;
