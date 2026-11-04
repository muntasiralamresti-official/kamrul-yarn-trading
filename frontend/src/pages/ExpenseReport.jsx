import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields, accountInputClass } from '../components/Accounts/AccountsUI';
import { formatMoney, localDate, removeAccountTransaction, useAccountsState } from '../lib/accountsStore';

const ExpenseReport = () => {
  const state = useAccountsState();
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(localDate);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => state.transactions.filter((transaction) => (
    ['income', 'expense', 'salary-payment'].includes(transaction.type) &&
    transaction.date >= startDate && transaction.date <= endDate &&
    (type === 'All' || (type === 'Expense' && ['expense', 'salary-payment'].includes(transaction.type)) || transaction.type === type.toLowerCase()) &&
    `${transaction.category} ${transaction.description} ${transaction.reference}`.toLowerCase().includes(query.toLowerCase())
  )), [state.transactions, startDate, endDate, type, query]);
  const income = filtered.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = filtered.filter((item) => ['expense', 'salary-payment'].includes(item.type)).reduce((sum, item) => sum + item.amount, 0);

  return (
    <AccountPage title="Expense & Income Report">
      <AccountFilterPanel title="Search Income & Expense" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-slate-700">Type<select className={`${accountInputClass} mt-1`} value={type} onChange={(event) => setType(event.target.value)}><option>All</option><option>Income</option><option>Expense</option></select></label>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Income', income, 'text-emerald-700'], ['Expenses', expenses, 'text-rose-700'], ['Net', income - expenses, 'text-slate-800']].map(([label, amount, color]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className={`mt-1 font-bold ${color}`}>{formatMoney(amount)}</p></div>)}
      </div>
      <AccountTable columns={['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount', 'Action']} rows={filtered.map((transaction) => <tr key={transaction.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{transaction.date}</td><td className="border px-3 py-2">{transaction.type === 'income' ? 'Income' : transaction.type === 'salary-payment' ? 'Salary' : 'Expense'}</td><td className="border px-3 py-2">{transaction.category}</td><td className="border px-3 py-2">{transaction.description || transaction.note || transaction.party}</td><td className="border px-3 py-2">{transaction.method}</td><td className="border px-3 py-2 text-right">{formatMoney(transaction.amount)}</td><td className="border px-3 py-2 text-center">{transaction.type === 'salary-payment' ? <span className="text-xs text-slate-500">Manage in HR</span> : <button type="button" onClick={() => removeAccountTransaction(transaction.id)} className="text-rose-600 hover:underline">Delete</button>}</td></tr>)} emptyMessage="No income or expense transactions for this filter." />
    </AccountPage>
  );
};

export default ExpenseReport;
