import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { AccountPage, AccountTable, accountInputClass } from '../components/Accounts/AccountsUI';
import { formatMoney, localDate, useAccountsState } from '../lib/accountsStore';
import { useHrState } from '../lib/hrStore';
import { useCommerceState } from '../lib/commerceStore';
import { useAdminState } from '../lib/adminStore';

const fromDate = '2000-01-01';
const toDate = localDate;
const filterByText = (rows, query, keys) => rows.filter((row) =>
  keys.some((key) => String(row[key] ?? '').toLowerCase().includes(query.toLowerCase()))
);

const ReportSearch = ({ query, setQuery, startDate, setStartDate, endDate, setEndDate }) => (
  <>
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-200 p-3">
      <h2 className="w-full text-base sm:text-lg font-semibold text-slate-800">Report Filters</h2>
      <label className="text-sm text-slate-700 flex-1 sm:flex-initial">From<input className={`${accountInputClass} mt-1`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label className="text-sm text-slate-700 flex-1 sm:flex-initial">To<input className={`${accountInputClass} mt-1`} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <button type="button" className="w-full sm:w-auto rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700">Show Report</button>
    </div>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <input className={`${accountInputClass} w-full sm:max-w-sm`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." aria-label="Search report" />
      <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 border sm:border-transparent rounded px-3 py-1.5 sm:p-0"><Printer size={16} /> Print</button>
    </div>
  </>
);

const reportRows = (rows, columns) => rows.map((row, index) => (
  <tr key={row.id || row.invoice || row.code || row.receipt || index} className="hover:bg-sky-50">
    {columns.map((column) => <td key={column.key} className={`border px-3 py-2 ${column.numeric ? 'text-right' : ''}`}>{column.render ? column.render(row) : row[column.key] || '—'}</td>)}
  </tr>
));

const CustomerPaymentReport = () => {
  const { transactions } = useAccountsState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);
  const payments = useMemo(() => filterByText(
    transactions.filter((item) => item.type === 'customer-payment' && item.date >= startDate && item.date <= endDate),
    query,
    ['party', 'reference', 'method']
  ), [transactions, startDate, endDate, query]);
  const total = payments.reduce((sum, item) => sum + item.amount, 0);
  const columns = [
    { key: 'date' }, { key: 'party', render: (row) => row.party }, { key: 'method' },
    { key: 'reference' }, { key: 'amount', numeric: true, render: (row) => formatMoney(row.amount) },
    { key: 'action', render: (row) => (
      <Link to={`/accounts/money-receipt?id=${row.id}`} className="text-emerald-700 hover:text-emerald-900 font-semibold underline text-xs">
        Print Receipt
      </Link>
    ) },
  ];
  return <AccountPage title="Customer Payment Report">
    <ReportSearch {...{ query, setQuery, startDate, setStartDate, endDate, setEndDate }} />
    <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold">Total customer receipts: {formatMoney(total)}</p>
    <AccountTable columns={['Date', 'Customer', 'Method', 'Receipt / Reference', 'Amount', 'Action']} rows={reportRows(payments, columns)} emptyMessage="No customer payments recorded for this period. Record payments in Accounts → Customer Payment." />
  </AccountPage>;
};

const SupplierLedgerReport = () => {
  const admin = useAdminState();
  const { transactions } = useAccountsState();
  const { purchases, purchaseReturns } = useCommerceState();
  const [supplier, setSupplier] = useState('All');
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);

  const selectedSupplier = admin.suppliers.find((s) => s.name === supplier);
  const openingBalance = supplier !== 'All' ? (Number(selectedSupplier?.openingBalance) || 0) : 0;

  const payments = transactions.filter((item) => item.type === 'supplier-payment').map((item) => ({
    id: item.id, date: item.date, supplier: item.party, description: `Supplier payment (${item.method})`,
    purchase: 0, payment: item.amount, reference: item.reference || '',
  }));
  const purchaseEntries = purchases.map((item) => ({
    id: item.id, date: item.date, supplier: item.party, description: `Purchase invoice ${item.invoice}`,
    purchase: item.total, payment: 0, reference: item.invoice,
  }));
  const returnEntries = purchaseReturns.map((item) => ({
    id: item.id, date: item.date, supplier: item.party, description: `Purchase return ${item.number}`,
    purchase: 0, payment: item.amount, reference: item.invoice,
  }));

  const allEntries = [...purchaseEntries, ...returnEntries, ...payments].sort((a, b) => a.date.localeCompare(b.date));
  const parties = [...new Set([...admin.suppliers.map((s) => s.name), ...allEntries.map((item) => item.supplier)])];

  const relevantEntries = supplier === 'All' ? allEntries : allEntries.filter((item) => item.supplier === supplier);

  const priorBalance = useMemo(() => {
    if (supplier === 'All') return 0;
    const priorNet = relevantEntries.filter((e) => e.date < startDate).reduce(
      (sum, item) => sum + item.purchase - item.payment, 0
    );
    return openingBalance + priorNet;
  }, [supplier, relevantEntries, startDate, openingBalance]);

  const filtered = relevantEntries.filter((item) =>
    item.date >= startDate && item.date <= endDate &&
    `${item.supplier} ${item.description} ${item.reference}`.toLowerCase().includes(query.toLowerCase())
  );

  let running = priorBalance;
  const rows = filtered.map((item) => {
    running = running + item.purchase - item.payment;
    return { ...item, balance: running };
  });

  const totals = filtered.reduce((acc, item) => ({ purchase: acc.purchase + item.purchase, payment: acc.payment + item.payment }), { purchase: 0, payment: 0 });
  const closingBalance = rows.length ? rows[rows.length - 1].balance : priorBalance;

  const columns = [
    { key: 'date' }, { key: 'supplier' }, { key: 'description' }, { key: 'reference' },
    { key: 'purchase', numeric: true, render: (row) => formatMoney(row.purchase) },
    { key: 'payment', numeric: true, render: (row) => formatMoney(row.payment) },
    { key: 'balance', numeric: true, render: (row) => formatMoney(row.balance) },
  ];

  return <AccountPage title="Supplier Ledger (সাপ্লায়ার লেজার)">
    <ReportSearch {...{ query, setQuery, startDate, setStartDate, endDate, setEndDate }} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="block max-w-md flex-1 text-sm text-slate-700">Supplier / Mill
        <select className={`${accountInputClass} mt-1`} value={supplier} onChange={(event) => setSupplier(event.target.value)}><option>All</option>{parties.map((party) => <option key={party}>{party}</option>)}</select>
      </label>
      {supplier !== 'All' && selectedSupplier && (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div><span className="font-medium">Phone:</span> {selectedSupplier.phone || '-'} · <span className="font-medium">Address:</span> {selectedSupplier.address || '-'}</div>
          <div><span className="font-medium">Opening Balance:</span> {formatMoney(openingBalance)}</div>
        </div>
      )}
    </div>
    <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold">Purchases: {formatMoney(totals.purchase)} · Payments & Returns: {formatMoney(totals.payment)} · Net Payable: {formatMoney(supplier === 'All' ? totals.purchase - totals.payment : closingBalance)}</p>
    <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-sky-700 text-white">
          <tr>{['Date', 'Supplier', 'Description', 'Reference', 'Purchase Bill (ক্রয়)', 'Payment / Return (পরিশোধ)', 'Payable Balance (জের)'].map((t) => <th key={t} className="border px-3 py-2">{t}</th>)}</tr>
        </thead>
        <tbody>
          {supplier !== 'All' && (priorBalance !== 0 || (openingBalance > 0 && startDate <= fromDate)) && (
            <tr className="bg-amber-50/70 font-semibold text-slate-800">
              <td className="border px-3 py-2 text-center">{startDate > fromDate ? startDate : 'Initial'}</td>
              <td className="border px-3 py-2">{supplier}</td>
              <td className="border px-3 py-2" colSpan="2">Opening Balance (পূর্বের জের)</td>
              <td className="border px-3 py-2 text-right">-</td>
              <td className="border px-3 py-2 text-right">-</td>
              <td className="border px-3 py-2 text-right font-bold text-amber-900">{formatMoney(priorBalance)}</td>
            </tr>
          )}
          {reportRows(rows, columns)}
          {!rows.length && priorBalance === 0 && <tr><td colSpan="7" className="border px-3 py-8 text-center text-slate-500">No supplier ledger activity for this period.</td></tr>}
        </tbody>
      </table>
    </div>
    <p className="text-xs text-slate-500">This report reflects purchases, returns, and payments saved in this business system.</p>
  </AccountPage>;
};

const QuotationRecord = () => {
  const { quotations } = useCommerceState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);
  const [status, setStatus] = useState('All');
  const filtered = quotations.filter((item) => item.date >= startDate && item.date <= endDate && (status === 'All' || item.status === status) && `${item.invoice} ${item.customer} ${item.note}`.toLowerCase().includes(query.toLowerCase()));
  const columns = [
    { key: 'invoice' }, { key: 'date' }, { key: 'customer' }, { key: 'status' },
    { key: 'total', numeric: true, render: (row) => formatMoney(row.total) }, { key: 'note' },
  ];
  return <AccountPage title="Quotation Record">
    <ReportSearch {...{ query, setQuery, startDate, setStartDate, endDate, setEndDate }} />
    <label className="block max-w-xs text-sm text-slate-700">Status<select className={`${accountInputClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Pending</option><option>Approved</option></select></label>
    <AccountTable columns={['Quotation No.', 'Date', 'Customer', 'Status', 'Total', 'Note']} rows={reportRows(filtered, columns)} emptyMessage="No quotations match these filters." />
    <p className="text-xs text-slate-500">Quotation records are stored in this browser.</p>
  </AccountPage>;
};

const QuotationInvoiceReport = () => {
  const { quotations } = useCommerceState();
  const [invoice, setInvoice] = useState(quotations[0]?.invoice || '');
  const [query, setQuery] = useState('');
  const matches = filterByText(quotations, query, ['invoice', 'customer', 'status']);
  const current = matches.find((item) => item.invoice === invoice) || matches[0];
  return <AccountPage title="Quotation Invoice">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-200 p-4">
      <label className="min-w-64 flex-1 text-sm text-slate-700">Search Quotation
        <select className={`${accountInputClass} mt-1`} value={current?.invoice || ''} onChange={(event) => setInvoice(event.target.value)}>{matches.map((item) => <option key={item.invoice} value={item.invoice}>{item.invoice} - {item.customer}</option>)}</select>
      </label>
      <input className={`${accountInputClass} max-w-sm`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by customer / number" aria-label="Filter quotations" />
      <button type="button" onClick={() => window.print()} className="rounded bg-emerald-600 px-5 py-2 text-sm font-medium text-white"><Printer size={16} className="mr-1 inline" />Print</button>
    </div>
    {current ? <article className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="border-b border-slate-300 pb-3 text-center text-lg font-semibold">Quotation</h2>
      <div className="grid gap-3 py-4 sm:grid-cols-2"><p><strong>Quotation No:</strong> {current.invoice}</p><p><strong>Date:</strong> {current.date}</p><p><strong>Customer:</strong> {current.customer}</p><p><strong>Status:</strong> {current.status}</p></div>
      <table className="w-full border-collapse text-sm"><thead className="bg-sky-700 text-white"><tr><th className="border px-3 py-2 text-left">Product</th><th className="border px-3 py-2 text-right">Quantity</th><th className="border px-3 py-2 text-right">Rate</th><th className="border px-3 py-2 text-right">Amount</th></tr></thead><tbody>{current.items.map((item, index) => <tr key={`${item.productId}-${index}`}><td className="border px-3 py-2">{item.name}</td><td className="border px-3 py-2 text-right">{item.quantity} {item.unit}</td><td className="border px-3 py-2 text-right">{formatMoney(item.rate)}</td><td className="border px-3 py-2 text-right">{formatMoney(item.total)}</td></tr>)}<tr><td colSpan="3" className="border px-3 py-2 text-right">Subtotal</td><td className="border px-3 py-2 text-right">{formatMoney(current.subtotal)}</td></tr><tr><td colSpan="3" className="border px-3 py-2 text-right">Discount / VAT / Transport</td><td className="border px-3 py-2 text-right">{formatMoney(current.discount)} / {formatMoney(current.vat)} / {formatMoney(current.transport)}</td></tr><tr className="font-semibold"><td colSpan="3" className="border px-3 py-2 text-right">Total</td><td className="border px-3 py-2 text-right">{formatMoney(current.total)}</td></tr></tbody></table>
    </article> : <p className="text-slate-500">No quotation matches the search.</p>}
    <p className="text-xs text-slate-500">Quotation records are stored in this browser.</p>
  </AccountPage>;
};

const EmployeeListReport = () => {
  const { employees } = useHrState();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const filtered = filterByText(employees.filter((item) => status === 'All' || item.status === status), query, ['code', 'name', 'designation', 'department', 'phone']);
  const columns = [{ key: 'code' }, { key: 'name' }, { key: 'designation' }, { key: 'department' }, { key: 'phone' }, { key: 'status' }];
  return <AccountPage title="Employee List">
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-sky-300 bg-sky-200 p-3">
      <label className="text-sm text-slate-700">Status<select className={`${accountInputClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></label>
      <button type="button" onClick={() => window.print()} className="rounded bg-emerald-600 px-5 py-2 text-sm font-medium text-white"><Printer size={16} className="mr-1 inline" />Print</button>
    </div>
    <input className={`${accountInputClass} max-w-sm`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees..." aria-label="Search employees" />
    <AccountTable columns={['Employee Code', 'Name', 'Designation', 'Department', 'Phone', 'Status']} rows={reportRows(filtered, columns)} emptyMessage="No employees match the selected filter." />
  </AccountPage>;
};

const SalaryPaymentReport = () => {
  const { payments } = useHrState();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);
  const filteredPayments = payments.filter((item) =>
    item.date >= startDate && item.date <= endDate &&
    `${item.receipt} ${item.employee} ${item.period} ${item.method}`.toLowerCase().includes(query.toLowerCase())
  );
  const columns = [
    { key: 'receipt' }, { key: 'date' }, { key: 'employee' }, { key: 'period' }, { key: 'method' },
    { key: 'amount', numeric: true, render: (row) => formatMoney(row.amount) },
  ];
  return <AccountPage title="Salary Payment Report">
    <ReportSearch {...{ query, setQuery, startDate, setStartDate, endDate, setEndDate }} />
    <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold">Total salary paid: {formatMoney(filteredPayments.reduce((sum, item) => sum + item.amount, 0))}</p>
    <AccountTable columns={['Receipt No.', 'Payment Date', 'Employee', 'Salary Period', 'Method', 'Amount']} rows={reportRows(filteredPayments, columns)} emptyMessage="No salary payments recorded for this period." />
  </AccountPage>;
};

export { CustomerPaymentReport, EmployeeListReport, QuotationInvoiceReport, QuotationRecord, SalaryPaymentReport, SupplierLedgerReport };
