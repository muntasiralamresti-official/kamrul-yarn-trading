import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields, accountInputClass } from '../components/Accounts/AccountsUI';
import { cashBalance, cashTransactionDelta, formatMoney, localDate, setOpeningCash, useAccountsState } from '../lib/accountsStore';

const CashStatement = () => {
  const state = useAccountsState();
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(localDate);
  const [openingInput, setOpeningInput] = useState(String(state.openingCash));
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const ordered = useMemo(() => state.transactions.filter((item) => cashTransactionDelta(item) !== 0)
    .sort((left, right) => left.date.localeCompare(right.date)), [state.transactions]);
  const opening = cashBalance(ordered.filter((item) => item.date < startDate));
  const rows = ordered.filter((item) => item.date >= startDate && item.date <= endDate).reduce((result, item) => {
    const delta = cashTransactionDelta(item);
    const balance = result.balance + delta;
    const row = { id: item.id, date: item.date, description: item.party || item.description || item.category || item.type.replaceAll('-', ' '), reference: item.reference || '—', income: Math.max(delta, 0), expense: Math.max(-delta, 0), balance };
    return { balance, rows: `${row.description} ${row.reference}`.toLowerCase().includes(query.toLowerCase()) ? [...result.rows, row] : result.rows };
  }, { balance: opening, rows: [] }).rows;
  const periodIncome = rows.reduce((sum, row) => sum + row.income, 0);
  const periodExpense = rows.reduce((sum, row) => sum + row.expense, 0);
  const closing = cashBalance(ordered.filter((item) => item.date <= endDate));

  const updateOpening = (event) => {
    event.preventDefault();
    try {
      setOpeningCash(openingInput);
      setMessage('Opening cash balance updated.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AccountPage title="Cash Statement">
      <AccountFilterPanel title="Cash Statement Period" onSubmit={(event) => event.preventDefault()}>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <form onSubmit={updateOpening} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="text-sm text-slate-700">Opening Cash Balance<input className={`${accountInputClass} mt-1 w-56`} type="number" min="0" step="0.01" value={openingInput} onChange={(event) => setOpeningInput(event.target.value)} /></label>
        <button className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Update Opening Balance</button>
        {message && <p role="status" className="text-sm text-indigo-700">{message}</p>}
      </form>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <div className="grid gap-3 sm:grid-cols-4">
        {[['Opening Balance', opening], ['Cash In', periodIncome], ['Cash Out', periodExpense], ['Closing Balance', closing]].map(([label, amount]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-800">{formatMoney(amount)}</p></div>)}
      </div>
      <AccountTable columns={['Date', 'Description', 'Reference', 'Cash In', 'Cash Out', 'Balance']} rows={rows.map((row) => <tr key={row.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{row.date}</td><td className="border px-3 py-2">{row.description}</td><td className="border px-3 py-2">{row.reference}</td><td className="border px-3 py-2 text-right">{row.income ? formatMoney(row.income) : '—'}</td><td className="border px-3 py-2 text-right">{row.expense ? formatMoney(row.expense) : '—'}</td><td className="border px-3 py-2 text-right font-medium">{formatMoney(row.balance)}</td></tr>)} emptyMessage="No cash transactions in this period." />
    </AccountPage>
  );
};

export default CashStatement;
