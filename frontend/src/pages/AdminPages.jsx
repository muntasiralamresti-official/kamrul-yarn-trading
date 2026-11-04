import React, { useMemo, useState } from 'react';
import { Pencil, Printer, Trash2 } from 'lucide-react';
import { formatMoney } from '../lib/accountsStore';
import {
  deleteAdminRecord,
  saveAdminRecord,
  useAdminState,
} from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const numberField = (value) => Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 });

export const StatusMessage = ({ message, error = false }) => message ? (
  <p role="status" className={`rounded px-4 py-3 text-sm ${error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>
) : null;

export const PrintSearch = ({ query, setQuery, placeholder = 'Search...' }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
    <input className={`${accountInputClass} w-full sm:max-w-sm`} placeholder={placeholder} value={query} onChange={(event) => setQuery(event.target.value)} />
    <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0"><Printer size={16} /> Print</button>
  </div>
);

export const RowActions = ({ onDelete, onEdit, label }) => (
  <div className="flex justify-center gap-3">
    {onEdit && <button type="button" onClick={onEdit} className="text-sky-700 hover:text-sky-900" aria-label={`Edit ${label}`}><Pencil size={16} /></button>}
    <button type="button" onClick={onDelete} className="text-rose-600 hover:text-rose-800" aria-label={`Delete ${label}`}><Trash2 size={16} /></button>
  </div>
);

export const DataTable = ({ columns, children, empty, colSpan }) => (
  <div className="overflow-x-auto border border-slate-300 bg-white">
    <table className="w-full border-collapse text-sm" style={{ minWidth: 700 }}>
      <thead className="bg-sky-700 text-white"><tr>{columns.map((column) => <th key={column} className="border border-slate-300 px-3 py-2 text-left">{column}</th>)}</tr></thead>
      <tbody>{React.Children.count(children) ? children : <tr><td colSpan={colSpan || columns.length} className="border px-3 py-8 text-center text-slate-500">{empty || 'No records found.'}</td></tr>}</tbody>
    </table>
  </div>
);

export { default as ProductEntryPage } from './ProductEntryPage';


export const ProductListPage = () => {
  const state = useAdminState();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const filtered = useMemo(() => state.products.filter((product) =>
    `${product.name} ${product.category} ${product.unit}`.toLowerCase().includes(query.toLowerCase())
  ), [state.products, query]);
  const remove = (item) => {
    try {
      deleteAdminRecord('products', item.id);
      setMessage(`${item.name} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title="Product List">
    <PrintSearch query={query} setQuery={setQuery} placeholder="Search products..." />
    <StatusMessage message={message} error={hasError} />
    <DataTable columns={['Product Code', 'Product', 'Count & Mill', 'Category', 'Unit', 'Purchase Rate', 'Sales Rate', 'Stock', 'Action']} empty="No products added yet.">
      {filtered.map((item) => (
        <tr key={item.id} className="hover:bg-sky-50 text-xs">
          <td className="border px-3 py-2 font-mono font-bold text-sky-800">{item.code}</td>
          <td className="border px-3 py-2 font-medium">{item.name}</td>
          <td className="border px-3 py-2 text-slate-600">{item.yarnCount ? `${item.yarnCount} (${item.brand || '—'})` : '—'}</td>
          <td className="border px-3 py-2">{item.category}</td>
          <td className="border px-3 py-2">{item.unit}</td>
          <td className="border px-3 py-2 text-right">{formatMoney(item.purchasePrice)}</td>
          <td className="border px-3 py-2 text-right font-semibold">{formatMoney(item.salesPrice)}</td>
          <td className="border px-3 py-2 text-right font-bold text-slate-800">{numberField(item.openingStock)}</td>
          <td className="border px-3 py-2 text-center"><RowActions label={item.name} onDelete={() => remove(item)} /></td>
        </tr>
      ))}
    </DataTable>
  </AccountPage>;
};

export const ProductLedgerPage = () => {
  const state = useAdminState();
  const [productId, setProductId] = useState('');
  const [query, setQuery] = useState('');
  const selected = state.products.find((product) => product.id === productId);
  const rows = selected ? [
    { date: 'Opening', details: 'Opening stock', change: selected.openingStock, key: 'opening' },
    ...state.damages.filter((item) => item.productId === selected.id).map((item) => ({
      date: item.date, details: `Damage${item.reason ? ` - ${item.reason}` : ''}`, change: -item.quantity, key: item.id,
    })),
  ].sort((a, b) => a.date === 'Opening' ? -1 : b.date === 'Opening' ? 1 : a.date.localeCompare(b.date))
    .reduce((result, item) => {
      const balance = result.balance + item.change;
      return { balance, rows: [...result.rows, { ...item, balance }] };
    }, { balance: 0, rows: [] }).rows : [];
  const filtered = rows.filter((item) => `${item.date} ${item.details}`.toLowerCase().includes(query.toLowerCase()));
  return <AccountPage title="Product Ledger">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-100 p-4">
      <label className="min-w-64 text-sm text-slate-700">Product<select className={`${accountInputClass} mt-1`} value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Select product</option>{state.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {selected && <p className="text-sm text-slate-700">Current balance: <strong>{numberField(rows.at(-1)?.balance)} {selected.unit}</strong></p>}
    </div>
    {selected && <PrintSearch query={query} setQuery={setQuery} placeholder="Search ledger..." />}
    <DataTable columns={['Date', 'Details', 'In', 'Out', 'Balance']} empty={selected ? 'No ledger entries found.' : 'Select a product to view its ledger.'}>
      {filtered.map((item) => <tr key={item.key} className="hover:bg-sky-50"><td className="border px-3 py-2">{item.date}</td><td className="border px-3 py-2">{item.details}</td><td className="border px-3 py-2 text-right">{item.change > 0 ? numberField(item.change) : '—'}</td><td className="border px-3 py-2 text-right">{item.change < 0 ? numberField(-item.change) : '—'}</td><td className="border px-3 py-2 text-right font-semibold">{numberField(item.balance)} {selected?.unit}</td></tr>)}
    </DataTable>
  </AccountPage>;
};

export { DamageEntryPage, DamageListPage } from './DamagePages';


const contactFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'owner', label: 'Owner / Contact Person' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address' },
];

const ContactEntryPage = ({ collection, title, label }) => {
  const state = useAdminState();
  const [form, setForm] = useState({ name: '', owner: '', phone: '', email: '', address: '', area: '', openingBalance: '0' });
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [editingId, setEditingId] = useState('');
  const rows = state[collection].filter((item) => `${item.name} ${item.owner} ${item.phone} ${item.address} ${item.area}`.toLowerCase().includes(query.toLowerCase()));
  const save = (event) => {
    event.preventDefault();
    try {
      saveAdminRecord(collection, form, editingId || null);
      setForm({ name: '', owner: '', phone: '', email: '', address: '', area: '', openingBalance: '0' });
      setEditingId('');
      setMessage(editingId ? `${label} updated.` : `${label} added.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const edit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(Object.keys(form).map((key) => [key, item[key] ?? (key === 'openingBalance' ? '0' : '')])));
  };
  const remove = (item) => {
    try {
      deleteAdminRecord(collection, item.id);
      setMessage(`${label} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title={title}>
    <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">{editingId ? `Edit ${label}` : `Add ${label}`}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contactFields.map((field) => <label key={field.name} className="text-sm text-slate-700">{field.label}<input className={`${accountInputClass} mt-1`} type={field.type || 'text'} name={field.name} value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} required={field.required} /></label>)}
        <label className="text-sm text-slate-700">Area<select className={`${accountInputClass} mt-1`} value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })}><option value="">Select area (optional)</option>{state.areas.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <label className="text-sm text-slate-700">Opening Balance (পূর্বের বকেয়া)<input className={`${accountInputClass} mt-1`} type="number" min="0" step="0.01" name="openingBalance" value={form.openingBalance || '0'} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} placeholder="0.00" /></label>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        {editingId && <button type="button" onClick={() => { setEditingId(''); setForm({ name: '', owner: '', phone: '', email: '', address: '', area: '', openingBalance: '0' }); }} className="w-full sm:w-auto rounded border border-slate-300 px-5 py-2 text-sm">Cancel</button>}
        <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">{editingId ? 'Save Changes' : `Save ${label}`}</button>
      </div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <PrintSearch query={query} setQuery={setQuery} placeholder={`Search ${label.toLowerCase()}s...`} />
    <DataTable columns={['Code', label, 'Contact Person', 'Phone', 'Area', 'Opening Due', 'Action']} empty={`No ${label.toLowerCase()}s added yet.`}>
      {rows.map((item) => <tr key={item.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{item.code}</td><td className="border px-3 py-2">{item.name}</td><td className="border px-3 py-2">{item.owner || '—'}</td><td className="border px-3 py-2">{item.phone || '—'}</td><td className="border px-3 py-2">{item.area || '—'}</td><td className="border px-3 py-2 text-right font-medium">{formatMoney(item.openingBalance || 0)}</td><td className="border px-3 py-2"><RowActions label={item.name} onEdit={() => edit(item)} onDelete={() => remove(item)} /></td></tr>)}
    </DataTable>
  </AccountPage>;
};

export const CustomerEntryPage = () => <ContactEntryPage collection="customers" title="Customer Entry" label="Customer" />;
export const SupplierEntryPage = () => <ContactEntryPage collection="suppliers" title="Supplier Entry" label="Supplier" />;

const masterConfigs = {
  'category-entry': { collection: 'categories', title: 'Category Entry', label: 'Category', plural: 'categories', placeholder: 'e.g. Cotton Yarn' },
  'unit-entry': { collection: 'units', title: 'Unit Entry', label: 'Unit', plural: 'units', placeholder: 'e.g. Kg, Cone, Yard' },
  'area-entry': { collection: 'areas', title: 'Area Entry', label: 'Area', plural: 'areas', placeholder: 'e.g. Narayanganj' },
};

export const MasterEntryPage = ({ type }) => {
  const config = masterConfigs[type];
  const state = useAdminState();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const items = state[config.collection].filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const submit = (event) => {
    event.preventDefault();
    try {
      saveAdminRecord(config.collection, { name });
      setName('');
      setMessage(`${config.label} added.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const remove = (item) => {
    try {
      deleteAdminRecord(config.collection, item.id);
      setMessage(`${config.label} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title={config.title}>
    <form onSubmit={submit} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="mb-4 rounded bg-sky-700 px-3 py-2 font-semibold text-white">Add {config.label}</h2>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <label className="text-sm text-slate-700">{config.label} Name<input className={`${accountInputClass} mt-1`} value={name} onChange={(event) => setName(event.target.value)} required placeholder={config.placeholder} /></label>
        <button className="rounded bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">Save {config.label}</button>
      </div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <PrintSearch query={query} setQuery={setQuery} placeholder={`Search ${config.plural}...`} />
    <DataTable columns={['SL', `${config.label} Name`, 'Action']} empty={`No ${config.label.toLowerCase()}s added yet.`}>
      {items.map((item, index) => <tr key={item.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{index + 1}</td><td className="border px-3 py-2">{item.name}</td><td className="border px-3 py-2"><RowActions label={item.name} onDelete={() => remove(item)} /></td></tr>)}
    </DataTable>
  </AccountPage>;
};

export const CreateUserPage = () => {
  const state = useAdminState();
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff' });
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const users = state.users.filter((item) => `${item.name} ${item.email} ${item.role} ${item.status}`.toLowerCase().includes(query.toLowerCase()));
  const submit = (event) => {
    event.preventDefault();
    try {
      if (state.users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) throw new Error('A user with this email already exists.');
      saveAdminRecord('users', { ...form, status: 'Active' });
      setForm({ name: '', email: '', role: 'Staff' });
      setMessage('User profile created.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const toggleStatus = (user) => {
    try {
      saveAdminRecord('users', { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }, user.id);
      setMessage(`${user.name} is now ${user.status === 'Active' ? 'inactive' : 'active'}.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const remove = (user) => {
    try {
      deleteAdminRecord('users', user.id);
      setMessage('User profile deleted.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title="Create User">
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">Create User Profile</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-slate-700">Full Name<input className={`${accountInputClass} mt-1`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label className="text-sm text-slate-700">Email<input className={`${accountInputClass} mt-1`} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label className="text-sm text-slate-700">Role<select className={`${accountInputClass} mt-1`} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Staff</option><option>Manager</option><option>Administrator</option></select></label>
      </div>
      <div className="flex justify-end"><button className="rounded bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">Create Profile</button></div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <p className="text-sm text-amber-800">These profiles are stored locally for administration only; login, passwords, and access control require a secured backend.</p>
    <PrintSearch query={query} setQuery={setQuery} placeholder="Search user profiles..." />
    <DataTable columns={['Name', 'Email', 'Role', 'Status', 'Action']} empty="No user profiles created yet.">
      {users.map((user) => <tr key={user.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{user.name}</td><td className="border px-3 py-2">{user.email}</td><td className="border px-3 py-2">{user.role}</td><td className="border px-3 py-2">{user.status}</td><td className="border px-3 py-2"><div className="flex items-center justify-center gap-3"><button type="button" onClick={() => toggleStatus(user)} className="text-sm text-sky-700 underline">{user.status === 'Active' ? 'Deactivate' : 'Activate'}</button><RowActions label={user.name} onDelete={() => remove(user)} /></div></td></tr>)}
    </DataTable>
  </AccountPage>;
};

export { default as CompanyProfilePage } from './CompanyProfilePage';

