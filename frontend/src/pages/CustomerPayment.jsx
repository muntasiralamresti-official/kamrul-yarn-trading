import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, CheckCircle2 } from 'lucide-react';
import { addAccountTransaction, formatMoney, useAccountsState } from '../lib/accountsStore';
import { useAdminState } from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const CustomerPayment = () => {
  const state = useAccountsState();
  const { customers } = useAdminState();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [bankAccountId, setBankAccountId] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [lastPayment, setLastPayment] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    try {
      if (!customer.trim()) throw new Error('Enter the customer name.');
      if (method === 'Bank' && !bankAccountId) throw new Error('Select the receiving bank account.');
      const txn = addAccountTransaction({
        type: 'customer-payment',
        date,
        party: customer.trim(),
        amount,
        method,
        bankAccountId: method === 'Bank' ? bankAccountId : '',
        reference: reference.trim(),
      });
      setLastPayment(txn);
      setMessage(`Customer payment of ${formatMoney(amount)} recorded for ${customer.trim()}.`);
      setCustomer('');
      setAmount('');
      setReference('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AccountPage title="Customer Payment (কাস্টমার জমা)">
      <div className="flex justify-end mb-2">
        <Link
          to="/accounts/money-receipt"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer size={15} /> All Money Receipts (মানি রিসিট সমূহ)
        </Link>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Receive Payment (টাকা গ্রহণ)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-700">Payment Date<input className={`${accountInputClass} mt-1`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Customer<input className={`${accountInputClass} mt-1`} list="customer-list" value={customer} onChange={(event) => setCustomer(event.target.value)} required placeholder="Customer name" />
            <datalist id="customer-list">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <label className="text-sm text-slate-700">Amount<input className={`${accountInputClass} mt-1`} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label className="text-sm text-slate-700">Payment Method<select className={`${accountInputClass} mt-1`} value={method} onChange={(event) => setMethod(event.target.value)}><option>Cash</option><option>Bank</option></select></label>
          {method === 'Bank' && <label className="text-sm text-slate-700">Deposit To<select className={`${accountInputClass} mt-1`} value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} required><option value="">Select bank account</option>{state.bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} - {account.bankName}</option>)}</select></label>}
          <label className="text-sm text-slate-700">Receipt / Note<input className={`${accountInputClass} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Cheque no / reference" /></label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Receive Payment</button>
        </div>
      </form>

      {lastPayment && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            <div>
              <p className="font-semibold">Payment of {formatMoney(lastPayment.amount)} received from {lastPayment.party}!</p>
              <p className="text-xs text-emerald-700">Method: {lastPayment.method} · Date: {lastPayment.date}</p>
            </div>
          </div>
          <Link
            to={`/accounts/money-receipt?id=${lastPayment.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Printer size={15} /> Print Money Receipt (মানি রিসিট প্রিন্ট)
          </Link>
        </div>
      )}

      {message && !lastPayment && <p role="status" className="rounded bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <p className="text-sm text-slate-500">Total customer receipts: {formatMoney(state.transactions.filter((transaction) => transaction.type === 'customer-payment').reduce((sum, transaction) => sum + transaction.amount, 0))}</p>
    </AccountPage>
  );
};

export default CustomerPayment;
