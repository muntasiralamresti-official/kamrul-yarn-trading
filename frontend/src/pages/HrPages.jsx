import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Printer, Trash2 } from 'lucide-react';
import { formatMoney, localDate } from '../lib/accountsStore';
import { addAccountTransaction, useAccountsState } from '../lib/accountsStore';
import {
  addHrPayment,
  deleteHrEmployee,
  deleteHrMaster,
  saveHrEmployee,
  saveHrMaster,
  setHrEmployeeStatus,
  seedHrMasterData,
  useHrState,
} from '../lib/hrStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';

const today = () => localDate();
const thisPeriod = () => today().slice(0, 7);
const StatusMessage = ({ message, error = false }) => message ? (
  <p role="status" className={`rounded px-4 py-3 text-sm ${error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>
) : null;
const PrintSearch = ({ query, setQuery, placeholder }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
    <input className={`${accountInputClass} w-full sm:max-w-sm`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
    <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0"><Printer size={16} /> Print</button>
  </div>
);
const ActionButtons = ({ label, onEdit, onDelete }) => (
  <div className="flex justify-center gap-3">
    {onEdit && <button type="button" onClick={onEdit} className="text-sky-700" aria-label={`Edit ${label}`}><Pencil size={16} /></button>}
    {onDelete && <button type="button" onClick={onDelete} className="text-rose-600" aria-label={`Delete ${label}`}><Trash2 size={16} /></button>}
  </div>
);
const Table = ({ columns, children, empty }) => (
  <div className="overflow-x-auto border border-slate-300 bg-white">
    <table className="w-full border-collapse text-sm" style={{ minWidth: 720 }}>
      <thead className="bg-sky-700 text-white"><tr>{columns.map((column) => <th key={column} className="border border-slate-300 px-3 py-2 text-left">{column}</th>)}</tr></thead>
      <tbody>{React.Children.count(children) ? children : <tr><td colSpan={columns.length} className="border px-3 py-8 text-center text-slate-500">{empty || 'No records found.'}</td></tr>}</tbody>
    </table>
  </div>
);

export const EmployeeEntryPage = () => {
  const state = useHrState();
  React.useEffect(() => {
    seedHrMasterData('designations', ['Manager', 'Sales Executive', 'Accounts Officer', 'Storekeeper', 'Accountant']);
    seedHrMasterData('departments', ['Administration', 'Sales', 'Accounts', 'Purchase', 'Warehouse']);
  }, []);
  const blank = { name: '', phone: '', email: '', address: '', designation: '', department: '', joinDate: today(), salary: '' };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = (event) => {
    event.preventDefault();
    try {
      saveHrEmployee(form, editingId || null);
      setForm(blank);
      setEditingId('');
      setMessage(editingId ? 'Employee updated.' : 'Employee added.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const edit = (employee) => {
    setEditingId(employee.id);
    setForm(Object.fromEntries(Object.keys(blank).map((key) => [key, employee[key] ?? ''])));
  };
  const remove = (employee) => {
    try {
      deleteHrEmployee(employee.id);
      setMessage(`${employee.name} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const activeRows = state.employees.filter((employee) => employee.status === 'Active');
  return <AccountPage title="Add Employee">
    <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">{editingId ? 'Edit Employee' : 'Employee Details'}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm text-slate-700">Full Name<input className={`${accountInputClass} mt-1`} name="name" value={form.name} onChange={update} required /></label>
        <label className="text-sm text-slate-700">Phone<input className={`${accountInputClass} mt-1`} name="phone" type="tel" value={form.phone} onChange={update} required /></label>
        <label className="text-sm text-slate-700">Email<input className={`${accountInputClass} mt-1`} name="email" type="email" value={form.email} onChange={update} /></label>
        <label className="text-sm text-slate-700">Designation<select className={`${accountInputClass} mt-1`} name="designation" value={form.designation} onChange={update} required><option value="">Select designation</option>{state.designations.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm text-slate-700">Department<select className={`${accountInputClass} mt-1`} name="department" value={form.department} onChange={update} required><option value="">Select department</option>{state.departments.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm text-slate-700">Joining Date<input className={`${accountInputClass} mt-1`} name="joinDate" type="date" value={form.joinDate} onChange={update} required /></label>
        <label className="text-sm text-slate-700">Monthly Salary (BDT)<input className={`${accountInputClass} mt-1`} name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={update} required /></label>
        <label className="text-sm text-slate-700 sm:col-span-2">Address<input className={`${accountInputClass} mt-1`} name="address" value={form.address} onChange={update} /></label>
      </div>
      {(!state.designations.length || !state.departments.length) && <p className="text-sm text-amber-800">Create a <Link className="underline" to="/hr/add-designation">designation</Link> and <Link className="underline" to="/hr/add-department">department</Link> before adding employees.</p>}
      <div className="flex justify-end gap-2">
        {editingId && <button type="button" onClick={() => { setEditingId(''); setForm(blank); }} className="rounded border border-slate-300 px-5 py-2">Cancel</button>}
        <button disabled={!state.designations.length || !state.departments.length} className="rounded bg-emerald-600 px-6 py-2 font-medium text-white disabled:opacity-50">{editingId ? 'Save Changes' : 'Save Employee'}</button>
      </div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <Table columns={['Employee Code', 'Name', 'Designation', 'Department', 'Phone', 'Monthly Salary', 'Action']} empty="No active employees added yet.">
      {activeRows.map((employee) => <tr key={employee.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{employee.code}</td><td className="border px-3 py-2">{employee.name}</td><td className="border px-3 py-2">{employee.designation}</td><td className="border px-3 py-2">{employee.department}</td><td className="border px-3 py-2">{employee.phone}</td><td className="border px-3 py-2 text-right">{formatMoney(employee.salary)}</td><td className="border px-3 py-2"><ActionButtons label={employee.name} onEdit={() => edit(employee)} onDelete={() => remove(employee)} /></td></tr>)}
    </Table>
  </AccountPage>;
};

export const EmployeeListPage = ({ inactiveOnly = false }) => {
  const { employees } = useHrState();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const status = inactiveOnly ? 'Inactive' : 'Active';
  const rows = useMemo(() => employees.filter((employee) =>
    employee.status === status &&
    `${employee.code} ${employee.name} ${employee.designation} ${employee.department} ${employee.phone} ${employee.email}`.toLowerCase().includes(query.toLowerCase())
  ), [employees, status, query]);
  const changeStatus = (employee, nextStatus) => {
    try {
      setHrEmployeeStatus(employee.id, nextStatus);
      setMessage(`${employee.name} is now ${nextStatus.toLowerCase()}.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title={inactiveOnly ? 'Inactive Employee List' : 'Employee List'}>
    <PrintSearch query={query} setQuery={setQuery} placeholder="Search employees..." />
    <StatusMessage message={message} error={hasError} />
    <Table columns={['Employee Code', 'Name', 'Designation', 'Department', 'Phone', 'Email', 'Monthly Salary', 'Status', 'Action']} empty={`No ${status.toLowerCase()} employees found.`}>
      {rows.map((employee) => <tr key={employee.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{employee.code}</td><td className="border px-3 py-2">{employee.name}</td><td className="border px-3 py-2">{employee.designation}</td><td className="border px-3 py-2">{employee.department}</td><td className="border px-3 py-2">{employee.phone}</td><td className="border px-3 py-2">{employee.email || '—'}</td><td className="border px-3 py-2 text-right">{formatMoney(employee.salary)}</td><td className="border px-3 py-2">{employee.status}</td><td className="border px-3 py-2"><button type="button" onClick={() => changeStatus(employee, inactiveOnly ? 'Active' : 'Inactive')} className="text-sm text-sky-700 underline">{inactiveOnly ? 'Reactivate' : 'Deactivate'}</button></td></tr>)}
    </Table>
  </AccountPage>;
};

export const HrMasterEntryPage = ({ collection, title, label }) => {
  const state = useHrState();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const rows = state[collection].filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const save = (event) => {
    event.preventDefault();
    try {
      saveHrMaster(collection, name, editingId || null);
      setName('');
      setEditingId('');
      setMessage(`${label} ${editingId ? 'updated' : 'added'}.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const remove = (item) => {
    try {
      deleteHrMaster(collection, item.id);
      setMessage(`${label} deleted.`);
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  return <AccountPage title={title}>
    <form onSubmit={save} className="rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="mb-4 rounded bg-sky-700 px-3 py-2 font-semibold text-white">{editingId ? `Edit ${label}` : `Add ${label}`}</h2>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <label className="text-sm text-slate-700">{label} Name<input className={`${accountInputClass} mt-1`} value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <button className="rounded bg-emerald-600 px-6 py-2 font-medium text-white">{editingId ? 'Save Changes' : `Save ${label}`}</button>
      </div>
      {editingId && <button type="button" onClick={() => { setEditingId(''); setName(''); }} className="mt-2 text-sm text-slate-600 underline">Cancel edit</button>}
    </form>
    <StatusMessage message={message} error={hasError} />
    <PrintSearch query={query} setQuery={setQuery} placeholder={`Search ${label.toLowerCase()}s...`} />
    <Table columns={['SL', `${label} Name`, 'Action']} empty={`No ${label.toLowerCase()}s created yet.`}>
      {rows.map((item, index) => <tr key={item.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{index + 1}</td><td className="border px-3 py-2">{item.name}</td><td className="border px-3 py-2"><ActionButtons label={item.name} onEdit={() => { setEditingId(item.id); setName(item.name); }} onDelete={() => remove(item)} /></td></tr>)}
    </Table>
  </AccountPage>;
};

export const SalaryPaymentPage = () => {
  const { employees, payments } = useHrState();
  const { bankAccounts } = useAccountsState();
  const activeEmployees = employees.filter((employee) => employee.status === 'Active');
  const [form, setForm] = useState({ employeeId: '', date: today(), period: thisPeriod(), amount: '', method: 'Cash', bankAccountId: '' });
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const employee = activeEmployees.find((item) => item.id === form.employeeId);
  const monthPayments = payments.filter((item) => item.employeeId === form.employeeId && item.period === form.period);
  const setField = (event) => {
    const { name, value } = event.target;
    const selectedEmployee = name === 'employeeId' ? activeEmployees.find((item) => item.id === value) : null;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'employeeId' ? { amount: selectedEmployee ? String(selectedEmployee.salary) : '' } : {}),
      ...(name === 'method' ? { bankAccountId: '' } : {}),
    }));
  };
  const save = (event) => {
    event.preventDefault();
    try {
      const payment = {
        employeeId: form.employeeId, date: form.date, period: form.period,
        method: form.method, amount: form.amount, bankAccountId: form.method === 'Bank' ? form.bankAccountId : '',
      };
      if (payment.method === 'Bank' && !payment.bankAccountId) throw new Error('Select the bank account used for payment.');
      const accountTransaction = addAccountTransaction({
        date: payment.date,
        type: 'salary-payment',
        category: 'Salary Payment',
        party: employee?.name || '',
        period: payment.period,
        method: payment.method,
        bankAccountId: payment.bankAccountId,
        amount: payment.amount,
        reference: `SAL-${payment.period.replace('-', '')}-${String(payments.length + 1).padStart(4, '0')}`,
        note: `Salary paid to ${employee?.name || ''} for ${payment.period}`,
      });
      try {
        addHrPayment({ ...payment, accountTransactionId: accountTransaction.id });
      } catch (error) {
        try {
          removeAccountTransaction(accountTransaction.id);
        } catch (rollbackError) {
          throw new Error(`${error.message} Additionally, the Accounts entry could not be rolled back: ${rollbackError.message}`);
        }
        throw error;
      }
      setForm((current) => ({ ...current, employeeId: '', amount: '', bankAccountId: '' }));
      setMessage('Salary payment saved and Accounts balance updated.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };
  const filteredPayments = payments.filter((payment) =>
    `${payment.receipt} ${payment.employee} ${payment.period} ${payment.method}`.toLowerCase().includes(query.toLowerCase())
  );
  return <AccountPage title="Salary Payment">
    <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
      <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">Pay Employee Salary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm text-slate-700">Employee<select className={`${accountInputClass} mt-1`} name="employeeId" value={form.employeeId} onChange={setField} required><option value="">Select active employee</option>{activeEmployees.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label>
        <label className="text-sm text-slate-700">Payment Date<input className={`${accountInputClass} mt-1`} name="date" type="date" value={form.date} onChange={setField} required /></label>
        <label className="text-sm text-slate-700">Salary Period<input className={`${accountInputClass} mt-1`} name="period" type="month" value={form.period} onChange={setField} required /></label>
        <label className="text-sm text-slate-700">Amount (BDT)<input className={`${accountInputClass} mt-1`} name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={setField} required /></label>
        <label className="text-sm text-slate-700">Payment Method<select className={`${accountInputClass} mt-1`} name="method" value={form.method} onChange={setField}><option>Cash</option><option>Bank</option></select></label>
        {form.method === 'Bank' && <label className="text-sm text-slate-700">Bank Account<select className={`${accountInputClass} mt-1`} name="bankAccountId" value={form.bankAccountId} onChange={setField} required><option value="">Select account</option>{bankAccounts.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.bankName}</option>)}</select></label>}
      </div>
      {employee && <p className="text-sm text-slate-700">Monthly salary: <strong>{formatMoney(employee.salary)}</strong>{monthPayments.length > 0 && <span className="ml-2 text-rose-700">Payment already recorded for this period.</span>}</p>}
      {!activeEmployees.length && <p className="text-sm text-amber-800">Add an active employee from <Link to="/hr/add-employee" className="underline">Add Employee</Link> before processing salary.</p>}
      {form.method === 'Bank' && !bankAccounts.length && <p className="text-sm text-amber-800">Add a bank account in <Link to="/accounts/bank-accounts" className="underline">Accounts</Link> before making a bank salary payment.</p>}
      <div className="flex justify-end"><button disabled={!activeEmployees.length || (form.method === 'Bank' && !bankAccounts.length)} className="rounded bg-emerald-600 px-6 py-2 font-medium text-white disabled:opacity-50">Save Salary Payment</button></div>
    </form>
    <StatusMessage message={message} error={hasError} />
    <h2 className="font-semibold text-slate-800">Recorded Salary Payments</h2>
    <PrintSearch query={query} setQuery={setQuery} placeholder="Search payments..." />
    <Table columns={['Receipt', 'Date', 'Employee', 'Period', 'Method', 'Amount']} empty="No salary payments recorded yet.">
      {filteredPayments.map((payment) => <tr key={payment.id} className="hover:bg-sky-50"><td className="border px-3 py-2">{payment.receipt}</td><td className="border px-3 py-2">{payment.date}</td><td className="border px-3 py-2">{payment.employee}</td><td className="border px-3 py-2">{payment.period}</td><td className="border px-3 py-2">{payment.method}</td><td className="border px-3 py-2 text-right">{formatMoney(payment.amount)}</td></tr>)}
    </Table>
  </AccountPage>;
};

export const SalaryPaymentReportPage = () => {
  const { payments } = useHrState();
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('2000-01-01');
  const [to, setTo] = useState(today());
  const rows = payments.filter((payment) => payment.date >= from && payment.date <= to &&
    `${payment.receipt} ${payment.employee} ${payment.period} ${payment.method}`.toLowerCase().includes(query.toLowerCase())
  );
  return <AccountPage title="Salary Payment Report">
    <div className="grid items-end gap-3 rounded-lg border border-sky-300 bg-sky-100 p-4 sm:grid-cols-[1fr_1fr_auto]">
      <label className="text-sm text-slate-700">From<input className={`${accountInputClass} mt-1`} type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label className="text-sm text-slate-700">To<input className={`${accountInputClass} mt-1`} type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      <button type="button" onClick={() => window.print()} className="rounded bg-emerald-600 px-5 py-2 text-sm font-medium text-white"><Printer size={16} className="mr-1 inline" />Print</button>
    </div>
    <input className={`${accountInputClass} max-w-sm`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search salary payments..." />
    <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold">Total paid: {formatMoney(rows.reduce((sum, item) => sum + item.amount, 0))}</p>
    <Table columns={['Receipt', 'Date', 'Employee', 'Salary Period', 'Method', 'Amount']} empty="No payments in this date range.">
      {rows.map((payment) => <tr key={payment.id}><td className="border px-3 py-2">{payment.receipt}</td><td className="border px-3 py-2">{payment.date}</td><td className="border px-3 py-2">{payment.employee}</td><td className="border px-3 py-2">{payment.period}</td><td className="border px-3 py-2">{payment.method}</td><td className="border px-3 py-2 text-right">{formatMoney(payment.amount)}</td></tr>)}
    </Table>
  </AccountPage>;
};
