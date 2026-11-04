import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields } from '../components/Accounts/AccountsUI';
import { cashBalance, cashTransactionDelta, formatMoney, localDate, useAccountsState } from '../lib/accountsStore';

const CashView = () => {
  const state = useAccountsState();
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(localDate);
  const [query, setQuery] = useState('');
  const transactions = useMemo(() => state.transactions
    .filter((item) => cashTransactionDelta(item) !== 0 && item.date <= endDate)
    .sort((left, right) => left.date.localeCompare(right.date)), [state.transactions, endDate]);
  const balanceBefore = cashBalance(transactions.filter((item) => item.date < startDate));
  const rows = transactions.filter((item) => item.date >= startDate).reduce((result, item) => {
    const delta = cashTransactionDelta(item);
    const balance = result.balance + delta;
    const row = {
      id: item.id,
      date: item.date,
      description: item.party || item.description || item.category || item.type.replaceAll('-', ' '),
      reference: item.reference || '—',
      in: delta > 0 ? delta : 0,
      out: delta < 0 ? -delta : 0,
      balance,
    };
    return { balance, rows: `${row.description} ${row.reference}`.toLowerCase().includes(query.toLowerCase()) ? [...result.rows, row] : result.rows };
  }, { balance: balanceBefore, rows: [] }).rows;

  return (
    <AccountPage title="Cash View">
      <AccountFilterPanel title="Cash Position" onSubmit={(event) => event.preventDefault()}>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Opening Cash', state.openingCash], ['Cash In', rows.reduce((sum, row) => sum + row.in, 0)], ['Current Cash', cashBalance(state.transactions.filter((item) => item.date <= endDate))]].map(([label, amount]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-800">{formatMoney(amount)}</p></div>)}
      </div>
      <AccountTable columns={['Date', 'Description', 'Reference', 'Cash In', 'Cash Out', 'Balance']} rows={rows.map((row) => <tr key={row.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{row.date}</td><td className="border px-3 py-2">{row.description}</td><td className="border px-3 py-2">{row.reference}</td><td className="border px-3 py-2 text-right">{row.in ? formatMoney(row.in) : '—'}</td><td className="border px-3 py-2 text-right">{row.out ? formatMoney(row.out) : '—'}</td><td className="border px-3 py-2 text-right font-medium">{formatMoney(row.balance)}</td></tr>)} emptyMessage="No cash transactions in this period." />
    </AccountPage>
  );
};

export default CashView;
