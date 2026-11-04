import React, { useState } from 'react';
import { addAccountTransaction, accountCategories, formatMoney, useAccountsState } from '../lib/accountsStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const ExpenseEntry = () => {
  const state = useAccountsState();
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [bankAccountId, setBankAccountId] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const categories = accountCategories(type === 'income' ? 'Income' : 'Expense');

  const submit = (event) => {
    event.preventDefault();
    try {
      if (!categoryId) throw new Error('Select an income or expense category.');
      if (method === 'Bank' && !bankAccountId) throw new Error('Select a bank account for bank transactions.');
      const category = categories.find((item) => item.id === categoryId);
      addAccountTransaction({
        type,
        date,
        category: category?.name || '',
        description: description.trim(),
        amount,
        method,
        bankAccountId: method === 'Bank' ? bankAccountId : '',
        reference: reference.trim(),
      });
      setMessage(`${type === 'income' ? 'Income' : 'Expense'} saved.`);
      setDescription('');
      setAmount('');
      setReference('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AccountPage title="Expense & Income Entry">
      <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <div className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Transaction Information</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-700">Transaction Type<select className={`${accountInputClass} mt-1`} value={type} onChange={(event) => { setType(event.target.value); setCategoryId(''); }}><option value="expense">Expense</option><option value="income">Income</option></select></label>
          <label className="text-sm text-slate-700">Date<input className={`${accountInputClass} mt-1`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Category<select className={`${accountInputClass} mt-1`} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-sm text-slate-700">Description<input className={`${accountInputClass} mt-1`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Transaction details" required /></label>
          <label className="text-sm text-slate-700">Amount<input className={`${accountInputClass} mt-1`} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Payment Method<select className={`${accountInputClass} mt-1`} value={method} onChange={(event) => setMethod(event.target.value)}><option>Cash</option><option>Bank</option></select></label>
          {method === 'Bank' && <label className="text-sm text-slate-700">Bank Account<select className={`${accountInputClass} mt-1`} value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} required><option value="">Select bank account</option>{state.bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} - {account.bankName}</option>)}</select></label>}
          <label className="text-sm text-slate-700">Reference / Note<input className={`${accountInputClass} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Save {type === 'income' ? 'Income' : 'Expense'}</button>
        </div>
      </form>
      {message && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <p className="text-sm text-slate-500">Cash balance: {formatMoney(state.openingCash + state.transactions.reduce((balance, transaction) => {
        if (transaction.method !== 'Cash') return balance;
        if (transaction.type === 'income' || transaction.type === 'customer-payment' || transaction.type === 'bank-withdrawal') return balance + transaction.amount;
        if (transaction.type === 'expense' || transaction.type === 'supplier-payment' || transaction.type === 'bank-deposit') return balance - transaction.amount;
        return balance;
      }, 0))}</p>
    </AccountPage>
  );
};

export default ExpenseEntry;
