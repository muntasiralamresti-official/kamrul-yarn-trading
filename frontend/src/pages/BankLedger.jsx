import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields, accountInputClass } from '../components/Accounts/AccountsUI';
import { bankBalance, formatMoney, localDate, useAccountsState } from '../lib/accountsStore';

const BankLedger = () => {
  const state = useAccountsState();
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(localDate);
  const [query, setQuery] = useState('');
  const account = state.bankAccounts.find((item) => item.id === accountId);
  const sorted = useMemo(() => state.transactions.filter((transaction) => (
    transaction.bankAccountId === accountId || transaction.toBankAccountId === accountId
  )).sort((left, right) => left.date.localeCompare(right.date)), [state.transactions, accountId]);
  const beforeRange = sorted.filter((transaction) => transaction.date < startDate);
  const periodTransactions = sorted.filter((transaction) => transaction.date >= startDate && transaction.date <= endDate);
  const rows = periodTransactions
    .map((transaction, index) => {
      const previous = account ? bankBalance(account, [...beforeRange, ...periodTransactions.slice(0, index)]) : 0;
      const balance = account ? bankBalance(account, [...beforeRange, ...periodTransactions.slice(0, index + 1)]) : 0;
      const description = transaction.type === 'bank-transfer'
        ? transaction.bankAccountId === accountId ? `Transfer to ${state.bankAccounts.find((item) => item.id === transaction.toBankAccountId)?.name || 'bank'}` : `Transfer from ${state.bankAccounts.find((item) => item.id === transaction.bankAccountId)?.name || 'bank'}`
        : transaction.party || transaction.description || transaction.category || transaction.type.replaceAll('-', ' ');
      return {
        id: transaction.id,
        date: transaction.date,
        description,
        reference: transaction.reference || '—',
        debit: Math.max(previous - balance, 0),
        credit: Math.max(balance - previous, 0),
        balance,
      };
    }).filter((row) => `${row.description} ${row.reference}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AccountPage title="Bank Ledger">
      <AccountFilterPanel title="Generate Bank Ledger" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-slate-700">Bank Account<select className={`${accountInputClass} mt-1`} value={accountId} onChange={(event) => setAccountId(event.target.value)} required><option value="">Select bank account</option>{state.bankAccounts.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.bankName}</option>)}</select></label>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      {!account && <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800">Create/select a bank account to view its ledger.</p>}
      {account && <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{account.name} · {account.bankName}</p><p className="font-semibold">Opening balance at {startDate}: {formatMoney(bankBalance(account, beforeRange))}</p></div>}
      <AccountTable columns={['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']} rows={rows.map((row) => <tr key={row.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{row.date}</td><td className="border px-3 py-2">{row.description}</td><td className="border px-3 py-2">{row.reference}</td><td className="border px-3 py-2 text-right">{row.debit ? formatMoney(row.debit) : '—'}</td><td className="border px-3 py-2 text-right">{row.credit ? formatMoney(row.credit) : '—'}</td><td className="border px-3 py-2 text-right font-medium">{formatMoney(row.balance)}</td></tr>)} emptyMessage={account ? 'No bank ledger entries for this date range.' : 'No bank account selected.'} />
    </AccountPage>
  );
};

export default BankLedger;
