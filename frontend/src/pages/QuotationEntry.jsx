import React, { useMemo, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { localDate } from '../lib/accountsStore';
import { nextInvoiceNumber, saveQuotation } from '../lib/commerceStore';

const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
const labelClass = 'mb-1 block text-sm text-slate-700';

const QuotationEntry = () => {
  const admin = useAdminState();
  const products = admin.products.map((product) => ({ ...product, rate: product.salesPrice }));
  const customers = admin.customers.map((customer) => customer.name);
  const [invoiceNo, setInvoiceNo] = useState(() => nextInvoiceNumber('quotations'));
  const [date, setDate] = useState(() => localDate());
  const [customer, setCustomer] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [productId, setProductId] = useState('');
  const [rate, setRate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [vat, setVat] = useState('0');
  const [transport, setTransport] = useState('0');
  const [message, setMessage] = useState('');
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const total = subtotal - Number(discount || 0) + Number(vat || 0) + Number(transport || 0);
  const money = (amount) => Number(amount || 0).toFixed(2);

  const addItem = () => {
    const product = products.find((item) => item.id === productId);
    if (!product || Number(quantity) <= 0) return;
    const itemRate = Number(rate || product.rate);
    setItems((rows) => [...rows, { ...product, rate: itemRate, quantity: Number(quantity), total: itemRate * Number(quantity), note, rowId: `${product.id}-${Date.now()}` }]);
    setProductId('');
    setRate('');
    setQuantity('');
    setNote('');
  };

  const reset = () => {
    setItems([]);
    setProductId('');
    setRate('');
    setQuantity('');
    setNote('');
    setDiscount('0');
    setVat('0');
    setTransport('0');
    setMessage('');
  };

  const submitQuotation = (event) => {
    event.preventDefault();
    try {
      const quotation = saveQuotation({
        invoice: invoiceNo, date, party: customer, items, discount, vat, transport, note, preparedBy,
      }, admin.products);
      setMessage(`Quotation ${quotation.invoice} saved.`);
      setItems([]);
      setInvoiceNo(nextInvoiceNumber('quotations'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the quotation.');
    }
  };

  return (
    <form onSubmit={submitQuotation} className="mx-auto max-w-[1500px] space-y-3 p-4 md:p-6">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Invoice no<input className={inputClass} value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} /></label>
        <label className={labelClass}>Prepared By<input className={inputClass} value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} placeholder="Optional" /></label>
        <label className={labelClass}>Quotation Date<input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </div>
      <div className="grid items-start gap-3 xl:grid-cols-[1fr_1fr_300px]">
        <section className="rounded-lg border border-sky-200 bg-sky-100 p-4">
          <h2 className="mb-3 font-semibold text-slate-800">Customer Information</h2>
          <label className={labelClass}>Customer<select className={inputClass} value={customer} onChange={(event) => setCustomer(event.target.value)} required><option value="">Select customer</option>{customers.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label className={labelClass}>Name<input className={inputClass} value={customer} onChange={(event) => setCustomer(event.target.value)} /></label>
          <label className={labelClass}>Mobile No<input className={inputClass} placeholder="Mobile No" /></label>
          <label className={labelClass}>Address<textarea className={inputClass} rows="2" /></label>
        </section>
        <section className="rounded-lg border border-sky-200 bg-sky-100 p-4">
          <h2 className="mb-3 font-semibold text-slate-800">Product Information</h2>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className={labelClass}>Product<select className={inputClass} value={productId} onChange={(event) => {
              const product = products.find((item) => item.id === event.target.value);
              setProductId(event.target.value);
              setRate(product ? String(product.rate) : '');
            }}><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <button type="button" onClick={() => setMessage('Product creation is available in Administration.')} className="mt-6 rounded bg-rose-500 px-3 py-2 text-white" aria-label="Add product"><Plus size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Sale Rate<input className={inputClass} type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
            <label className={labelClass}>Qty<input className={inputClass} type="number" min="0" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
          </div>
          <label className={labelClass}>Total<input className={inputClass} value={money(Number(rate || 0) * Number(quantity || 0))} readOnly /></label>
          <label className={labelClass}>Note<input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} /></label>
          <div className="flex justify-end"><button type="button" onClick={addItem} className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">Add Cart</button></div>
        </section>
        <section className="rounded-lg border border-sky-200 bg-sky-100 p-4">
          <h2 className="mb-3 font-semibold text-slate-800">Amount Details</h2>
          <label className={labelClass}>SubTotal<input className={inputClass} value={money(subtotal)} readOnly /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className={labelClass}>Discount<input className={inputClass} type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
            <label className={labelClass}>Discount Amount<input className={inputClass} value={money(discount)} readOnly /></label>
            <label className={labelClass}>Vat<input className={inputClass} type="number" min="0" value={vat} onChange={(event) => setVat(event.target.value)} /></label>
            <label className={labelClass}>Vat Amount<input className={inputClass} value={money(vat)} readOnly /></label>
          </div>
          <label className={labelClass}>Transport / Labour Cost<input className={inputClass} type="number" min="0" value={transport} onChange={(event) => setTransport(event.target.value)} /></label>
          <label className={labelClass}>Total<input className={inputClass} value={money(total)} readOnly /></label>
          <div className="grid grid-cols-2 gap-2">
            <button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Quotation</button>
            <button type="button" onClick={reset} className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">New Quotation</button>
          </div>
        </section>
      </div>
      <div className="overflow-x-auto rounded border border-slate-300 bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-sky-700 text-white"><tr>{['SL', 'Product Name', 'Category', 'Rate', 'Quantity', 'Total', 'Action'].map((title) => <th key={title} className="px-3 py-1 text-center">{title}</th>)}</tr></thead>
          <tbody>{items.map((item, index) => <tr key={item.rowId} className="border-t border-slate-200"><td className="px-3 py-2 text-center">{index + 1}</td><td className="px-3 py-2">{item.name}</td><td className="px-3 py-2">{item.category}</td><td className="px-3 py-2 text-right">{money(item.rate)}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{money(item.total)}</td><td className="px-3 py-2 text-center"><button type="button" onClick={() => setItems((rows) => rows.filter((row) => row.rowId !== item.rowId))} aria-label={`Remove ${item.name}`} className="text-rose-600"><Trash2 size={16} /></button></td></tr>)}</tbody>
        </table>
      </div>
      {message && <p role="status" className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm text-slate-600"><RotateCcw size={16} /> Reset form</button>
    </form>
  );
};

export default QuotationEntry;
