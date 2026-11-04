import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminState, saveAdminProduct, deleteAdminRecord } from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';
import { formatMoney } from '../lib/accountsStore';
import { StatusMessage, RowActions, DataTable } from './AdminPages';

const blankProduct = {
  name: '',
  category: '',
  unit: '',
  yarnCount: '',
  yarnType: 'Carded',
  brand: '',
  lotNo: '',
  conesPerBag: '24',
  lbsPerBag: '100',
  purchasePrice: '0',
  salesPrice: '0',
  openingStock: '0',
  reorderLevel: '0',
  description: '',
};

const numberField = (value) => Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 });

const YARN_COUNTS = ['10/1', '16/1', '20/1', '24/1', '26/1', '30/1', '34/1', '40/1', '50/1', '60/1', '80/1'];
const YARN_TYPES = ['Carded', 'Combed', 'Slub', 'Melange', 'Lycra / Spandex', 'CVC', 'PC', 'Polyester'];
const POPULAR_MILLS = ['Square Textiles', 'Noman Group', 'Envoy Textiles', 'Badsha Textiles', 'Beximco', 'Pahartali', 'Maksons'];

const ProductEntryPage = () => {
  const state = useAdminState();
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const update = (event) => setForm((curr) => ({ ...curr, [event.target.name]: event.target.value }));

  // Auto-generate a descriptive product name if user selects count and brand
  const handleCountOrBrandChange = (field, val) => {
    setForm((curr) => {
      const next = { ...curr, [field]: val };
      if (!curr.name || curr.name.includes('/')) {
        const parts = [next.yarnCount, next.yarnType, next.brand].filter(Boolean);
        if (parts.length) next.name = parts.join(' - ');
      }
      return next;
    });
  };

  const save = (event) => {
    event.preventDefault();
    try {
      saveAdminProduct(form, editingId || null);
      setForm(blankProduct);
      setEditingId('');
      setMessage(editingId ? 'Product updated.' : 'Yarn product added successfully.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      ...blankProduct,
      ...Object.fromEntries(Object.entries(product).map(([k, v]) => [k, v ?? ''])),
    });
    setMessage('');
  };

  const remove = (product) => {
    try {
      deleteAdminRecord('products', product.id);
      setMessage(`${product.name} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };

  return (
    <AccountPage title="Yarn Product Entry">
      <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">
          {editingId ? 'Edit Yarn Product' : 'Add New Yarn Product'}
        </h2>

        {/* Yarn Specific Section */}
        <div className="bg-white p-3 rounded-lg border border-sky-200">
          <p className="text-xs font-bold text-sky-800 uppercase tracking-wide mb-2">
            🧵 Yarn Specifications (সুতার বিবরণ)
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs text-slate-700">
              Yarn Count (কাউন্ট)
              <input
                className={`${accountInputClass} mt-1`}
                name="yarnCount"
                list="yarn-count-list"
                value={form.yarnCount}
                onChange={(e) => handleCountOrBrandChange('yarnCount', e.target.value)}
                placeholder="e.g. 30/1"
              />
              <datalist id="yarn-count-list">
                {YARN_COUNTS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>

            <label className="text-xs text-slate-700">
              Yarn Type (টাইপ)
              <select
                className={`${accountInputClass} mt-1`}
                name="yarnType"
                value={form.yarnType}
                onChange={(e) => handleCountOrBrandChange('yarnType', e.target.value)}
              >
                {YARN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label className="text-xs text-slate-700">
              Spinning Mill / Brand (মিল / ব্র্যান্ড)
              <input
                className={`${accountInputClass} mt-1`}
                name="brand"
                list="mill-brand-list"
                value={form.brand}
                onChange={(e) => handleCountOrBrandChange('brand', e.target.value)}
                placeholder="e.g. Square Textiles"
              />
              <datalist id="mill-brand-list">
                {POPULAR_MILLS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </label>

            <label className="text-xs text-slate-700">
              Lot Number (লট নং)
              <input
                className={`${accountInputClass} mt-1`}
                name="lotNo"
                value={form.lotNo}
                onChange={update}
                placeholder="e.g. LT-9021"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            <label className="text-xs text-slate-700">
              Cones / Bag (প্রতি ব্যাগে কোণ)
              <input
                className={`${accountInputClass} mt-1`}
                name="conesPerBag"
                type="number"
                value={form.conesPerBag}
                onChange={update}
                placeholder="e.g. 24"
              />
            </label>
            <label className="text-xs text-slate-700">
              Bag Weight in Lbs / Kg (ওজন)
              <input
                className={`${accountInputClass} mt-1`}
                name="lbsPerBag"
                type="number"
                value={form.lbsPerBag}
                onChange={update}
                placeholder="e.g. 100"
              />
            </label>
          </div>
        </div>

        {/* Commercial & Pricing Section */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-slate-700 sm:col-span-2">
            Display Product Name<input className={`${accountInputClass} mt-1`} name="name" value={form.name} onChange={update} required />
          </label>
          <label className="text-xs text-slate-700">
            Category<select className={`${accountInputClass} mt-1`} name="category" value={form.category} onChange={update} required>
              <option value="">Select category</option>
              {state.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-700">
            Unit<select className={`${accountInputClass} mt-1`} name="unit" value={form.unit} onChange={update} required>
              <option value="">Select unit</option>
              {state.units.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-700">
            Purchase Rate (ক্রয়মূল্য)<input className={`${accountInputClass} mt-1`} name="purchasePrice" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={update} required />
          </label>
          <label className="text-xs text-slate-700">
            Sales Rate (বিক্রয়মূল্য)<input className={`${accountInputClass} mt-1`} name="salesPrice" type="number" min="0" step="0.01" value={form.salesPrice} onChange={update} required />
          </label>
          <label className="text-xs text-slate-700">
            Opening Stock (Bags/Units)<input className={`${accountInputClass} mt-1`} name="openingStock" type="number" min="0" step="0.01" value={form.openingStock} onChange={update} required />
          </label>
          <label className="text-xs text-slate-700">
            Reorder Level (সতর্কতা স্তর)<input className={`${accountInputClass} mt-1`} name="reorderLevel" type="number" min="0" step="0.01" value={form.reorderLevel} onChange={update} required />
          </label>
          <label className="text-xs text-slate-700 sm:col-span-2">
            Description / Note<input className={`${accountInputClass} mt-1`} name="description" value={form.description} onChange={update} placeholder="Optional warehouse or quality remarks" />
          </label>
        </div>

        {(!state.categories.length || !state.units.length) && (
          <p className="text-xs text-amber-800">
            Add at least one <Link className="underline" to="/admin/category-entry">category</Link> and <Link className="underline" to="/admin/unit-entry">unit</Link> before saving products.
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          {editingId && (
            <button type="button" onClick={() => { setEditingId(''); setForm(blankProduct); }} className="w-full sm:w-auto rounded border border-slate-300 px-5 py-2 text-xs">
              Cancel
            </button>
          )}
          <button
            disabled={!state.categories.length || !state.units.length}
            className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 text-xs shadow-sm"
          >
            {editingId ? 'Save Changes' : 'Save Yarn Product'}
          </button>
        </div>
      </form>

      <StatusMessage message={message} error={hasError} />

      {/* Product List Table with Yarn Attributes */}
      <DataTable
        columns={['Code', 'Yarn Product', 'Count & Type', 'Mill/Brand', 'Lot No', 'Purchase Rate', 'Sales Rate', 'Stock', 'Action']}
        empty="No yarn products added yet."
      >
        {state.products.map((item) => {
          const damaged = (state.damages || []).filter((d) => d.productId === item.id).reduce((sum, d) => sum + d.quantity, 0);
          const stock = item.openingStock - damaged;
          return (
            <tr key={item.id} className="hover:bg-sky-50 text-xs">
              <td className="border px-3 py-2 font-mono font-bold text-sky-800">{item.code}</td>
              <td className="border px-3 py-2 font-medium">{item.name}</td>
              <td className="border px-3 py-2 text-slate-600">
                {item.yarnCount ? `${item.yarnCount} (${item.yarnType || 'Carded'})` : '—'}
              </td>
              <td className="border px-3 py-2 text-slate-600">{item.brand || '—'}</td>
              <td className="border px-3 py-2 font-mono">{item.lotNo || '—'}</td>
              <td className="border px-3 py-2 text-right">{formatMoney(item.purchasePrice)}</td>
              <td className="border px-3 py-2 text-right font-semibold">{formatMoney(item.salesPrice)}</td>
              <td className={`border px-3 py-2 text-right ${stock <= item.reorderLevel ? 'font-bold text-rose-700' : ''}`}>
                {numberField(stock)} {item.unit}
              </td>
              <td className="border px-3 py-2 text-center">
                <RowActions label={item.name} onEdit={() => edit(item)} onDelete={() => remove(item)} />
              </td>
            </tr>
          );
        })}
      </DataTable>
    </AccountPage>
  );
};

export default ProductEntryPage;
