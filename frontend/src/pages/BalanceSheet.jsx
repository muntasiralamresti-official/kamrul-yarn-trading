import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, accountInputClass } from '../components/Accounts/AccountsUI';
import { bankBalance, cashBalance, formatMoney, localDate, useAccountsState } from '../lib/accountsStore';

const BalanceSheet = () => {
  const state = useAccountsState();
  const [asOfDate, setAsOfDate] = useState(localDate);
  const [query, setQuery] = useState('');
  const asOfTransactions = useMemo(() => state.transactions.filter((transaction) => transaction.date <= asOfDate), [state.transactions, asOfDate]);
  const cash = cashBalance(asOfTransactions);
  const balances = state.bankAccounts.map((account) => ({ ...account, balance: bankBalance(account, asOfTransactions) }));
  const totalBank = balances.reduce((sum, account) => sum + account.balance, 0);
  const totalAssets = cash + totalBank;
  const income = asOfTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = asOfTransactions.filter((transaction) => ['expense', 'salary-payment'].includes(transaction.type)).reduce((sum, transaction) => sum + transaction.amount, 0);
  const filteredAccounts = balances.filter((account) => `${account.name} ${account.bankName} ${account.branch}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AccountPage title="Balance Sheet">
      <AccountFilterPanel title="Statement Date" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-slate-700">As of Date<input className={`${accountInputClass} mt-1`} type="date" value={asOfDate} onChange={(event) => setAsOfDate(event.target.value)} /></label>
        <button className="w-full sm:w-auto rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700">Show Statement</button>
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        This statement calculates recorded cash and bank assets. Liabilities, inventory, fixed assets and owner capital are not yet tracked in Accounts, so this is an asset and operating summary rather than a complete statutory balance sheet.
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[['Cash on Hand', cash], ['Bank Balances', totalBank], ['Total Recorded Assets', totalAssets], ['Net Income (to date)', income - expenses]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-800">{formatMoney(value)}</p></div>)}
      </div>
      <AccountTable columns={['Asset Account', 'Institution', 'Account Number', 'Opening Balance', 'Balance at Date']} rows={filteredAccounts.map((account) => <tr key={account.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{account.name}</td><td className="border px-3 py-2">{account.bankName}</td><td className="border px-3 py-2">{account.accountNumber || '—'}</td><td className="border px-3 py-2 text-right">{formatMoney(account.openingBalance)}</td><td className="border px-3 py-2 text-right font-semibold">{formatMoney(account.balance)}</td></tr>)} emptyMessage="No bank accounts have been recorded." />
    </AccountPage>
  );
};

export default BalanceSheet;
