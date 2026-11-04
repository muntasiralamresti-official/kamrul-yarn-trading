import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { addBankAccount, bankBalance, formatMoney, removeBankAccount, useAccountsState } from '../lib/accountsStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const emptyForm = { name: '', bankName: '', accountNumber: '', branch: '', openingBalance: '0' };

const BankAccounts = () => {
  const state = useAccountsState();
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = (event) => {
    event.preventDefault();
    try {
      addBankAccount(form);
      setForm(emptyForm);
      setMessage('Bank account added.');
    } catch (error) {
      setMessage(error.message);
    }
  };
  const remove = (id) => {
    try {
      removeBankAccount(id);
      setMessage('Bank account deleted.');
    } catch (error) {
      setMessage(error.message);
    }
  };
  const accounts = state.bankAccounts.filter((account) =>
    `${account.name} ${account.bankName} ${account.accountNumber} ${account.branch}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AccountPage title="Bank Accounts">
      <form onSubmit={save} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Add Bank Account</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-700">Account Name<input className={`${accountInputClass} mt-1`} name="name" value={form.name} onChange={update} required placeholder="Business Current Account" /></label>
          <label className="text-sm text-slate-700">Bank Name<input className={`${accountInputClass} mt-1`} name="bankName" value={form.bankName} onChange={update} required /></label>
          <label className="text-sm text-slate-700">Account Number<input className={`${accountInputClass} mt-1`} name="accountNumber" value={form.accountNumber} onChange={update} /></label>
          <label className="text-sm text-slate-700">Branch<input className={`${accountInputClass} mt-1`} name="branch" value={form.branch} onChange={update} /></label>
          <label className="text-sm text-slate-700">Opening Balance<input className={`${accountInputClass} mt-1`} type="number" min="0" step="0.01" name="openingBalance" value={form.openingBalance} onChange={update} /></label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Add Account</button>
        </div>
      </form>
      {message && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <input className={`${accountInputClass} w-full sm:max-w-sm`} placeholder="Search bank accounts..." value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full min-w-[750px] border-collapse text-sm">
          <thead className="bg-sky-700 text-white"><tr>{['Account Name', 'Bank', 'Account Number', 'Branch', 'Opening Balance', 'Current Balance', 'Action'].map((item) => <th key={item} className="border border-slate-300 px-3 py-1 text-left">{item}</th>)}</tr></thead>
          <tbody>{accounts.length ? accounts.map((account) => <tr key={account.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{account.name}</td><td className="border px-3 py-2">{account.bankName}</td><td className="border px-3 py-2">{account.accountNumber || '—'}</td><td className="border px-3 py-2">{account.branch || '—'}</td><td className="border px-3 py-2 text-right">{formatMoney(account.openingBalance)}</td><td className="border px-3 py-2 text-right font-semibold">{formatMoney(bankBalance(account))}</td><td className="border px-3 py-2 text-center"><button type="button" onClick={() => remove(account.id)} className="text-rose-600 hover:text-rose-800" aria-label={`Delete ${account.name}`}><Trash2 size={16} /></button></td></tr>) : <tr><td colSpan="7" className="border px-3 py-8 text-center text-slate-500">No bank accounts created yet.</td></tr>}</tbody>
        </table>
      </div>
    </AccountPage>
  );
};

export default BankAccounts;
