import React, { useState } from 'react';
import { addTransactionCategory, useAccountsState } from '../lib/accountsStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const TransactionAccounts = () => {
  const state = useAccountsState();
  const [name, setName] = useState('');
  const [type, setType] = useState('Expense');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    try {
      addTransactionCategory({ name, type });
      setName('');
      setMessage('Transaction category created.');
    } catch (error) {
      setMessage(error.message);
    }
  };
  const categories = state.categories.filter((category) =>
    `${category.name} ${category.type}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AccountPage title="Transaction Accounts">
      <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Create Transaction Category</h2>
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm text-slate-700">Category Name<input className={`${accountInputClass} mt-1`} value={name} onChange={(event) => setName(event.target.value)} required placeholder="e.g. Office Rent" /></label>
          <label className="text-sm text-slate-700">Account Type<select className={`${accountInputClass} mt-1`} value={type} onChange={(event) => setType(event.target.value)}><option>Expense</option><option>Income</option></select></label>
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Add Category</button>
        </div>
      </form>
      {message && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <input className={`${accountInputClass} w-full sm:max-w-sm`} placeholder="Search categories..." value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full min-w-[500px] border-collapse text-sm">
          <thead className="bg-sky-700 text-white"><tr>{['SL', 'Category Name', 'Account Type'].map((item) => <th key={item} className="border border-slate-300 px-3 py-1 text-left">{item}</th>)}</tr></thead>
          <tbody>{categories.length ? categories.map((category, index) => <tr key={category.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{index + 1}</td><td className="border px-3 py-2">{category.name}</td><td className="border px-3 py-2">{category.type}</td></tr>) : <tr><td colSpan="3" className="border px-3 py-8 text-center text-slate-500">No categories found.</td></tr>}</tbody>
        </table>
      </div>
    </AccountPage>
  );
};

export default TransactionAccounts;
