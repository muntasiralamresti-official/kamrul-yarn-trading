import React, { useState } from 'react';
import { addAccountTransaction, formatMoney, useAccountsState } from '../lib/accountsStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const SupplierPayment = () => {
  const state = useAccountsState();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [bankAccountId, setBankAccountId] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    try {
      if (!supplier.trim()) throw new Error('Enter the supplier name.');
      if (method === 'Bank' && !bankAccountId) throw new Error('Select the paying bank account.');
      addAccountTransaction({ type: 'supplier-payment', date, party: supplier.trim(), amount, method, bankAccountId: method === 'Bank' ? bankAccountId : '', reference: reference.trim() });
      setMessage('Supplier payment recorded.');
      setSupplier('');
      setAmount('');
      setReference('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AccountPage title="Supplier Payment">
      <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Make Payment</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-700">Payment Date<input className={`${accountInputClass} mt-1`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Supplier<input className={`${accountInputClass} mt-1`} value={supplier} onChange={(event) => setSupplier(event.target.value)} required placeholder="Supplier name" /></label>
          <label className="text-sm text-slate-700">Amount<input className={`${accountInputClass} mt-1`} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Payment Method<select className={`${accountInputClass} mt-1`} value={method} onChange={(event) => setMethod(event.target.value)}><option>Cash</option><option>Bank</option></select></label>
          {method === 'Bank' && <label className="text-sm text-slate-700">Pay From<select className={`${accountInputClass} mt-1`} value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} required><option value="">Select bank account</option>{state.bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} - {account.bankName}</option>)}</select></label>}
          <label className="text-sm text-slate-700">Payment Ref / Note<input className={`${accountInputClass} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Pay Supplier</button>
        </div>
      </form>
      {message && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <p className="text-sm text-slate-500">Total supplier payments: {formatMoney(state.transactions.filter((transaction) => transaction.type === 'supplier-payment').reduce((sum, transaction) => sum + transaction.amount, 0))}</p>
    </AccountPage>
  );
};

export default SupplierPayment;
