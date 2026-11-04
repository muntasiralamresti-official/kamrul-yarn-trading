import React, { useMemo, useState } from 'react';
import { useAdminState, addProductDamage, deleteAdminRecord } from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';
import { stockForProduct } from '../lib/commerceStore';
import { StatusMessage, RowActions, DataTable, PrintSearch } from './AdminPages';

const blankDamage = { productId: '', quantity: '1', reason: '', date: new Date().toLocaleDateString('en-CA') };
const numberField = (value) => Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 });

export const DamageEntryPage = () => {
  const state = useAdminState();
  const [form, setForm] = useState(blankDamage);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const product = state.products.find((item) => item.id === form.productId);
  const available = product ? stockForProduct(product, { admin: state }) : 0;
  const update = (event) => setForm((curr) => ({ ...curr, [event.target.name]: event.target.value }));

  const save = (event) => {
    event.preventDefault();
    try {
      addProductDamage(form);
      setForm(blankDamage);
      setMessage('Damage record added.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };

  return (
    <AccountPage title="Damage Entry">
      <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">Record Damaged Goods</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm text-slate-700">Date<input className={`${accountInputClass} mt-1`} type="date" name="date" value={form.date} onChange={update} required /></label>
          <label className="text-sm text-slate-700">Product<select className={`${accountInputClass} mt-1`} name="productId" value={form.productId} onChange={update} required><option value="">Select product</option>{state.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm text-slate-700">Quantity<input className={`${accountInputClass} mt-1`} type="number" min="0.01" step="any" name="quantity" value={form.quantity} onChange={update} required /></label>
          <label className="text-sm text-slate-700">Reason<input className={`${accountInputClass} mt-1`} name="reason" value={form.reason} onChange={update} placeholder="e.g. Stained / Damaged cone" /></label>
        </div>
        {product && <p className="text-sm text-slate-700">Available stock: <strong>{numberField(available)} {product.unit}</strong></p>}
        <div className="flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Save Damage</button>
        </div>
      </form>
      <StatusMessage message={message} error={hasError} />
    </AccountPage>
  );
};

export const DamageListPage = () => {
  const state = useAdminState();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const damages = useMemo(() => state.damages.map((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    return { ...item, product };
  }).filter((item) => `${item.product?.name || ''} ${item.reason} ${item.date}`.toLowerCase().includes(query.toLowerCase())), [state.damages, state.products, query]);

  const remove = (damage) => {
    try {
      deleteAdminRecord('damages', damage.id);
      setMessage('Damage record deleted.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };

  return (
    <AccountPage title="Damage List">
      <StatusMessage message={message} error={hasError} />
      <PrintSearch query={query} setQuery={setQuery} placeholder="Search damages..." />
      <DataTable columns={['Date', 'Product', 'Quantity', 'Reason', 'Action']} empty="No damage records found.">
        {damages.map((item) => (
          <tr key={item.id} className="hover:bg-sky-50">
            <td className="border px-3 py-2">{item.date}</td>
            <td className="border px-3 py-2">{item.product?.name || '—'}</td>
            <td className="border px-3 py-2 text-right">{numberField(item.quantity)} {item.product?.unit}</td>
            <td className="border px-3 py-2">{item.reason || '—'}</td>
            <td className="border px-3 py-2 text-center"><RowActions label={item.product?.name || 'Damage'} onDelete={() => remove(item)} /></td>
          </tr>
        ))}
      </DataTable>
    </AccountPage>
  );
};
