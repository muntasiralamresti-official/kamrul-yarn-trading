import React, { useMemo, useState } from 'react';
import { AccountFilterPanel, AccountPage, AccountReportTools, AccountTable, DateRangeFields, accountInputClass } from '../components/Accounts/AccountsUI';
import { formatMoney, localDate, useAccountsState } from '../lib/accountsStore';

const BankTransactionReport = () => {
  const state = useAccountsState();
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(localDate);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => state.transactions.filter((transaction) => (
    transaction.date >= startDate && transaction.date <= endDate &&
    (transaction.method === 'Bank' || transaction.type.startsWith('bank-')) &&
    (type === 'All' || transaction.type === type) &&
    `${transaction.party || ''} ${transaction.description || ''} ${transaction.reference || ''}`.toLowerCase().includes(query.toLowerCase())
  )), [state.transactions, startDate, endDate, type, query]);
  const accountName = (id) => state.bankAccounts.find((account) => account.id === id)?.name || '—';

  return (
    <AccountPage title="Bank Transaction Report">
      <AccountFilterPanel title="Search Bank Transactions" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-slate-700">Transaction Type<select className={`${accountInputClass} mt-1`} value={type} onChange={(event) => setType(event.target.value)}><option value="All">All</option><option value="bank-deposit">Cash Deposit</option><option value="bank-withdrawal">Cash Withdrawal</option><option value="bank-transfer">Bank Transfer</option><option value="expense">Bank Expense</option><option value="income">Bank Income</option><option value="customer-payment">Customer Receipt</option><option value="supplier-payment">Supplier Payment</option><option value="salary-payment">Salary Payment</option></select></label>
        <DateRangeFields startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </AccountFilterPanel>
      <AccountReportTools query={query} onQueryChange={setQuery} onPrint={() => window.print()} />
      <AccountTable columns={['Date', 'Type', 'Account', 'Destination', 'Party / Description', 'Reference', 'Amount']} rows={filtered.map((transaction) => <tr key={transaction.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{transaction.date}</td><td className="border px-3 py-2">{transaction.type.replaceAll('-', ' ')}</td><td className="border px-3 py-2">{accountName(transaction.bankAccountId)}</td><td className="border px-3 py-2">{accountName(transaction.toBankAccountId)}</td><td className="border px-3 py-2">{transaction.party || transaction.description || transaction.category || '—'}</td><td className="border px-3 py-2">{transaction.reference || '—'}</td><td className="border px-3 py-2 text-right">{formatMoney(transaction.amount)}</td></tr>)} emptyMessage="No bank transactions for this filter." />
    </AccountPage>
  );
};

export default BankTransactionReport;
