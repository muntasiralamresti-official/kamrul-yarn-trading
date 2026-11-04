import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { localDate } from '../lib/accountsStore';
import { saveAsset } from '../lib/commerceStore';

const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
const labelClass = 'mb-1 block text-sm text-slate-700';

const AssetEntry = () => {
  const [asset, setAsset] = useState(() => ({ date: localDate(), invoice: '', name: '', category: '', supplier: '', quantity: '1', rate: '', note: '' }));
  const [message, setMessage] = useState('');
  const total = Number(asset.quantity || 0) * Number(asset.rate || 0);
  const update = (event) => setAsset((current) => ({ ...current, [event.target.name]: event.target.value }));
  const reset = () => {
    setAsset({ date: localDate(), invoice: '', name: '', category: '', supplier: '', quantity: '1', rate: '', note: '' });
    setMessage('');
  };
  const submit = (event) => {
    event.preventDefault();
    try {
      const saved = saveAsset({ ...asset, quantity: Number(asset.quantity), rate: Number(asset.rate), amount: total });
      setMessage(`Asset ${saved.name} saved (${saved.invoice || 'no invoice'}).`);
      setAsset({ date: localDate(), invoice: '', name: '', category: '', supplier: '', quantity: '1', rate: '', note: '' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the asset.');
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-4 p-3 sm:p-4 md:p-6">
      <div className="grid gap-3 rounded-lg border border-orange-200 bg-orange-100 p-3 sm:grid-cols-3">
        <label className={labelClass}>Invoice No<input className={inputClass} name="invoice" value={asset.invoice} onChange={update} /></label>
        <label className={labelClass}>Entry Date<input className={inputClass} type="date" name="date" value={asset.date} onChange={update} /></label>
        <label className={labelClass}>Supplier<input className={inputClass} name="supplier" value={asset.supplier} onChange={update} placeholder="Supplier / vendor" /></label>
      </div>
      <section className="rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h1 className="mb-4 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Asset Information</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>Asset Name<input className={inputClass} name="name" value={asset.name} onChange={update} required placeholder="e.g. Office Computer" /></label>
          <label className={labelClass}>Category<select className={inputClass} name="category" value={asset.category} onChange={update} required><option value="">Select category</option><option>Machinery</option><option>Furniture</option><option>Vehicle</option><option>Office Equipment</option><option>Other</option></select></label>
          <label className={labelClass}>Quantity<input className={inputClass} type="number" name="quantity" min="1" value={asset.quantity} onChange={update} required /></label>
          <label className={labelClass}>Unit Cost<input className={inputClass} type="number" name="rate" min="0" step="0.01" value={asset.rate} onChange={update} required /></label>
          <label className={labelClass}>Total Cost<input className={inputClass} value={`BDT ${total.toFixed(2)}`} readOnly /></label>
          <label className={labelClass}>Note<input className={inputClass} name="note" value={asset.note} onChange={update} /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 w-full sm:w-auto"><RotateCcw size={16} /> Reset</button>
          <button type="submit" className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">Save Asset</button>
        </div>
      </section>
      {message && <p role="status" className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
    </form>
  );
};

export default AssetEntry;
