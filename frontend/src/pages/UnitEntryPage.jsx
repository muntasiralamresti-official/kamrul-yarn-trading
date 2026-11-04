import React, { useState } from 'react';
import { deleteAdminRecord, saveAdminRecord, unitUsage, useAdminState } from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';
import { DataTable, PrintSearch, RowActions, StatusMessage } from './AdminPages';

const emptyForm = { name: '', fullName: '', baseUnit: '', factor: '' };

const conversionText = (unit) => (unit.baseUnit ? `1 ${unit.name} = ${unit.factor} ${unit.baseUnit}` : '—');

const UnitEntryPage = () => {
  const state = useAdminState();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const baseOptions = state.units.filter((item) => item.id !== editingId && !item.baseUnit);
  const rows = state.units.filter((item) => `${item.name} ${item.fullName || ''}`.toLowerCase().includes(query.toLowerCase()));
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const notify = (text, error = false) => { setMessage(text); setHasError(error); };
  const reset = () => { setForm(emptyForm); setEditingId(''); };

  const submit = (event) => {
    event.preventDefault();
    try {
      saveAdminRecord('units', form, editingId || null);
      notify(editingId ? 'Unit updated.' : 'Unit added.');
      reset();
    } catch (error) {
      notify(error.message, true);
    }
  };

  const edit = (unit) => {
    setEditingId(unit.id);
    setForm({ name: unit.name, fullName: unit.fullName || '', baseUnit: unit.baseUnit || '', factor: unit.baseUnit ? String(unit.factor) : '' });
    setMessage('');
  };

  const remove = (unit) => {
    try {
      deleteAdminRecord('units', unit.id);
      if (editingId === unit.id) reset();
      notify('Unit deleted.');
    } catch (error) {
      notify(error.message, true);
    }
  };

  return <AccountPage title="Unit Entry">
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">{editingId ? 'Edit Unit' : 'Add Unit'}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-slate-700">Short Name<input className={`${accountInputClass} mt-1`} name="name" value={form.name} onChange={update} required placeholder="e.g. Kg, Bag, Cone" /></label>
        <label className="text-sm text-slate-700">Full Name<input className={`${accountInputClass} mt-1`} name="fullName" value={form.fullName} onChange={update} placeholder="e.g. Kilogram" /></label>
        <label className="text-sm text-slate-700">Converts To (optional)
          <select className={`${accountInputClass} mt-1`} name="baseUnit" value={form.baseUnit} onChange={update}>
            <option value="">No conversion</option>
            {baseOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">{form.name ? `1 ${form.name} =` : 'Quantity'} {form.baseUnit && `(${form.baseUnit})`}
          <input className={`${accountInputClass} mt-1`} type="number" min="0" step="any" name="factor" value={form.factor} onChange={update} disabled={!form.baseUnit} required={Boolean(form.baseUnit)} placeholder="e.g. 50" />
        </label>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        {editingId && <button type="button" onClick={reset} className="w-full sm:w-auto rounded border border-slate-300 px-5 py-2 text-sm">Cancel</button>}
        <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">{editingId ? 'Save Changes' : 'Save Unit'}</button>
      </div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <PrintSearch query={query} setQuery={setQuery} placeholder="Search units..." />
    <DataTable columns={['SL', 'Short Name', 'Full Name', 'Conversion', 'Products Using', 'Action']} empty="No units added yet.">
      {rows.map((item, index) => <tr key={item.id} className="hover:bg-sky-50">
        <td className="border px-3 py-2">{index + 1}</td>
        <td className="border px-3 py-2">{item.name}</td>
        <td className="border px-3 py-2">{item.fullName || '—'}</td>
        <td className="border px-3 py-2">{conversionText(item)}</td>
        <td className="border px-3 py-2">{unitUsage(item).products}</td>
        <td className="border px-3 py-2"><RowActions label={item.name} onEdit={() => edit(item)} onDelete={() => remove(item)} /></td>
      </tr>)}
    </DataTable>
  </AccountPage>;
};

export default UnitEntryPage;
