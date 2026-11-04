import React, { useState } from 'react';
import { addAccountTransaction, useAccountsState } from '../lib/accountsStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const BankTransactions = () => {
  const state = useAccountsState();
  const [type, setType] = useState('bank-deposit');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bankAccountId, setBankAccountId] = useState('');
  const [toBankAccountId, setToBankAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    try {
      if (state.bankAccounts.length === 0) throw new Error('Create a bank account before recording bank transactions.');
      if (!bankAccountId) throw new Error('Select a bank account.');
      if (type === 'bank-transfer' && (!toBankAccountId || toBankAccountId === bankAccountId)) {
        throw new Error('Choose a different destination bank account.');
      }
      addAccountTransaction({
        type,
        date,
        amount,
        method: 'Cash',
        bankAccountId,
        toBankAccountId: type === 'bank-transfer' ? toBankAccountId : '',
        reference: reference.trim(),
        description: type === 'bank-deposit' ? 'Cash deposited to bank' : type === 'bank-withdrawal' ? 'Cash withdrawn from bank' : 'Bank transfer',
      });
      setAmount('');
      setReference('');
      setMessage('Bank transaction recorded.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AccountPage title="Bank Transactions">
      <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Record Bank Transaction</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-700">Transaction Type<select className={`${accountInputClass} mt-1`} value={type} onChange={(event) => setType(event.target.value)}><option value="bank-deposit">Cash Deposit</option><option value="bank-withdrawal">Cash Withdrawal</option><option value="bank-transfer">Bank Transfer</option></select></label>
          <label className="text-sm text-slate-700">Date<input className={`${accountInputClass} mt-1`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">{type === 'bank-withdrawal' ? 'Withdraw From' : type === 'bank-transfer' ? 'Transfer From' : 'Deposit To'}<select className={`${accountInputClass} mt-1`} value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} required><option value="">Select bank account</option>{state.bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} - {account.bankName}</option>)}</select></label>
          {type === 'bank-transfer' && <label className="text-sm text-slate-700">Transfer To<select className={`${accountInputClass} mt-1`} value={toBankAccountId} onChange={(event) => setToBankAccountId(event.target.value)} required><option value="">Select destination</option>{state.bankAccounts.filter((account) => account.id !== bankAccountId).map((account) => <option key={account.id} value={account.id}>{account.name} - {account.bankName}</option>)}</select></label>}
          <label className="text-sm text-slate-700">Amount<input className={`${accountInputClass} mt-1`} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Reference / Note<input className={`${accountInputClass} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Save Transaction</button>
        </div>
      </form>
      {message && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
    </AccountPage>
  );
};

export default BankTransactions;
