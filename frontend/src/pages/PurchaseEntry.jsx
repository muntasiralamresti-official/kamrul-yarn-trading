import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RotateCcw, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { useAdminState } from '../lib/adminStore';
import { addAccountTransaction, localDate, removeAccountTransaction, useAccountsState } from '../lib/accountsStore';
import { nextInvoiceNumber, purchaseDueBySupplier, savePurchase } from '../lib/commerceStore';

const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
const labelClass = 'mb-1 block text-sm text-slate-700';
const money = (amount) => Number(amount || 0).toFixed(2);

const PurchaseEntry = () => {
  const admin = useAdminState();
  const { bankAccounts, transactions } = useAccountsState();
  const suppliers = admin.suppliers.map((supplier) => supplier.name);
  const [supplier, setSupplier] = useState('');
  const selectedSupplier = admin.suppliers.find((item) => item.name === supplier);
  const previousDue = selectedSupplier ? purchaseDueBySupplier(selectedSupplier, transactions) : 0;
  const products = admin.products.map((product) => ({ ...product, rate: product.purchasePrice }));
  const [invoiceNo, setInvoiceNo] = useState(() => nextInvoiceNumber('purchases'));
  const [date, setDate] = useState(() => localDate());
  
  const [productId, setProductId] = useState('');
  const [rateType, setRateType] = useState('per_lb');
  const [rate, setRate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [vat, setVat] = useState('0');
  const [transport, setTransport] = useState('0');
  const [cashPaid, setCashPaid] = useState('0');
  const [bankPaid, setBankPaid] = useState('0');
  const [bankAccountId, setBankAccountId] = useState('');
  const [message, setMessage] = useState('');
  const [lastPurchase, setLastPurchase] = useState(null);

  const currentProduct = products.find((item) => item.id === productId);
  const currentLbsPerBag = Number(currentProduct?.lbsPerBag) || 0;
  const currentTotalWeight = currentLbsPerBag > 0 ? (Number(quantity || 0) * currentLbsPerBag) : 0;
  const currentLineTotal = rateType === 'per_lb' && currentLbsPerBag > 0
    ? currentTotalWeight * Number(rate || 0)
    : Number(quantity || 0) * Number(rate || 0);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const total = subtotal - Number(discount || 0) + Number(vat || 0) + Number(transport || 0);
  const paid = Number(cashPaid || 0) + Number(bankPaid || 0);
  const due = Math.max(total - paid, 0);

  const addItem = () => {
    const product = products.find((item) => item.id === productId);
    if (!product || Number(quantity) <= 0) {
      setMessage('Choose a product and enter a quantity greater than zero.');
      return;
    }
    const itemRate = Number(rate || product.rate);
    const lbsPerBag = Number(product.lbsPerBag) || 0;
    const conesPerBag = Number(product.conesPerBag) || 0;
    const totalWeight = lbsPerBag > 0 ? (Number(quantity) * lbsPerBag) : 0;
    const lineTotal = rateType === 'per_lb' && lbsPerBag > 0 ? (totalWeight * itemRate) : (Number(quantity) * itemRate);

    setItems((rows) => [...rows, {
      ...product,
      rate: itemRate,
      rateType,
      lbsPerBag,
      conesPerBag,
      totalWeight,
      quantity: Number(quantity),
      total: lineTotal,
      rowId: `${product.id}-${Date.now()}`
    }]);
    setProductId('');
    setRate('');
    setQuantity('');
  };

  const reset = () => {
    setSupplier('');
    setProductId('');
    setRate('');
    setQuantity('');
    setItems([]);
    setDiscount('0');
    setVat('0');
    setTransport('0');
    setCashPaid('0');
    setBankPaid('0');
    setBankAccountId('');
    setMessage('');
    setLastPurchase(null);
  };

  const save = (event) => {
    event.preventDefault();
    if (!supplier || !invoiceNo.trim() || !items.length) {
      setMessage('Select a saved supplier, enter an invoice number, and add at least one product.');
      return;
    }
    const savedPayments = [];
    try {
      if (Number(bankPaid) > 0 && !bankAccountId) throw new Error('Select a bank account for the bank payment.');
      if (Number(cashPaid) > 0) savedPayments.push(addAccountTransaction({
        type: 'supplier-payment', date, party: supplier, amount: cashPaid, method: 'Cash',
        reference: `Purchase invoice ${invoiceNo}`, note: 'Payment made with purchase invoice', invoicePayment: true,
      }));
      if (Number(bankPaid) > 0) savedPayments.push(addAccountTransaction({
        type: 'supplier-payment', date, party: supplier, amount: bankPaid, method: 'Bank',
        bankAccountId, reference: `Purchase invoice ${invoiceNo}`, note: 'Payment made with purchase invoice', invoicePayment: true,
      }));
      const purchase = savePurchase({
        invoice: invoiceNo, date, party: supplier, items, discount, vat, transport,
        cash: cashPaid, bank: bankPaid, note: event.currentTarget.elements.namedItem('reference')?.value || '',
      }, admin.products, admin);
      setLastPurchase(purchase);
      setMessage(`Purchase ${purchase.invoice} saved. Due: ${money(purchase.due)}.`);
      setItems([]);
      setInvoiceNo(nextInvoiceNumber('purchases'));
    } catch (error) {
      savedPayments.forEach((transaction) => removeAccountTransaction(transaction.id));
      setMessage(error instanceof Error ? error.message : 'Could not save the purchase.');
    }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-[1500px] space-y-3 p-4 md:p-6">
      <div className="grid gap-3 rounded-lg border border-orange-200 bg-orange-100 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Invoice no<input className={inputClass} value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} required /></label>
        <label className={labelClass}>Reference<input className={inputClass} name="reference" placeholder="Supplier invoice / reference" /></label>
        <label className={labelClass}>Purchase Date<input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[1.2fr_1.35fr_0.9fr]">
        <section className="rounded-lg border border-sky-200 bg-sky-100 p-3">
          <h2 className="mb-3 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Supplier Information</h2>
          <label className={labelClass}>Supplier / Mill<select className={inputClass} value={supplier} onChange={(event) => setSupplier(event.target.value)} required><option value="">Select supplier</option>{suppliers.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label className={labelClass}>Name<input className={inputClass} value={supplier} readOnly placeholder="Supplier name" /></label>
          <label className={labelClass}>Mobile No<input className={inputClass} value={selectedSupplier?.phone || ''} readOnly placeholder="Not provided" /></label>
          <label className={labelClass}>Address<textarea className={inputClass} rows="3" value={selectedSupplier?.address || ''} readOnly placeholder="Not provided" /></label>
        </section>

        <section className="rounded-lg border border-sky-200 bg-sky-100 p-3">
          <h2 className="mb-3 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Product Information</h2>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className={labelClass}>Product<select className={inputClass} value={productId} onChange={(event) => {
              const product = products.find((item) => item.id === event.target.value);
              setProductId(event.target.value);
              setRate(product ? String(product.rate) : '');
              setRateType((product?.lbsPerBag || 0) > 0 ? 'per_lb' : 'per_bag');
            }}><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <button type="button" onClick={() => setMessage('Product setup is available in Administration.')} className="mt-6 rounded bg-rose-500 px-3 py-2 text-white hover:bg-rose-600" aria-label="Add product"><Plus size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Rate Type
              <select className={inputClass} value={rateType} onChange={(e) => setRateType(e.target.value)}>
                <option value="per_lb">Per Lb (টাকা/পাউন্ড)</option>
                <option value="per_bag">Per Bag / Unit (টাকা/বস্তা)</option>
              </select>
            </label>
            <label className={labelClass}>Purchase Rate (৳)<input className={inputClass} type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Qty ({currentProduct?.unit || 'Bags'})<input className={inputClass} type="number" min="0" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            <label className={labelClass}>Total Weight<input className={`${inputClass} bg-slate-50`} readOnly value={currentTotalWeight > 0 ? `${currentTotalWeight.toLocaleString()} Lbs` : '-'} /></label>
          </div>
          <label className={labelClass}>Line Total (৳)<input className={`${inputClass} font-semibold text-emerald-800`} readOnly value={money(currentLineTotal)} /></label>
          <div className="flex justify-end"><button type="button" onClick={addItem} className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">Add Cart</button></div>
        </section>

        <section className="rounded-lg border border-sky-200 bg-sky-100 p-3">
          <h2 className="mb-3 rounded bg-sky-700 px-3 py-1.5 font-semibold text-white">Amount Details</h2>
          <label className={labelClass}>SubTotal<input className={inputClass} readOnly value={money(subtotal)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Discount<input className={inputClass} type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
            <label className={`${labelClass} pt-6`}>Amount<input className={inputClass} readOnly value={money(discount)} /></label>
            <label className={labelClass}>Vat<input className={inputClass} type="number" min="0" value={vat} onChange={(event) => setVat(event.target.value)} /></label>
            <label className={`${labelClass} pt-6`}>Amount<input className={inputClass} readOnly value={money(vat)} /></label>
          </div>
          <label className={labelClass}>Transport / Labour Cost<input className={inputClass} type="number" min="0" value={transport} onChange={(event) => setTransport(event.target.value)} /></label>
          <label className={labelClass}>Total<input className={inputClass} readOnly value={money(total)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Cash Paid<input className={inputClass} type="number" min="0" value={cashPaid} onChange={(event) => setCashPaid(event.target.value)} /></label>
            <label className={labelClass}>Bank Paid<input className={inputClass} type="number" min="0" value={bankPaid} onChange={(event) => setBankPaid(event.target.value)} /></label>
            {Number(bankPaid) > 0 && <label className={labelClass}>Bank Account<select className={inputClass} value={bankAccountId} onChange={(event) => setBankAccountId(event.target.value)} required><option value="">Select account</option>{bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.bankName}</option>)}</select></label>}
            <label className={labelClass}>Due<input className={inputClass} readOnly value={money(due)} /></label>
            <label className={labelClass}>Previous Due<input className={`${inputClass} text-red-600`} readOnly value={money(previousDue)} /></label>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Purchase</button>
            <button type="button" onClick={reset} className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">New Purchase</button>
          </div>
        </section>
      </div>

      <div className="overflow-x-auto rounded border border-slate-300 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-sky-700 text-white"><tr>{['SL', 'Product Details', 'Rate', 'Quantity & Weight', 'Total', 'Action'].map((title) => <th key={title} className="border-r border-white/20 px-3 py-1 text-center">{title}</th>)}</tr></thead>
          <tbody>{items.map((item, index) => <tr key={item.rowId} className="border-t border-slate-200">
            <td className="px-3 py-2 text-center">{index + 1}</td>
            <td className="px-3 py-2">
              <div className="font-medium text-slate-900">{item.name}</div>
              {(item.yarnCount || item.brand || item.lotNo) && (
                <div className="text-xs text-slate-500">
                  {[item.yarnCount && `Count: ${item.yarnCount}`, item.brand && `Brand: ${item.brand}`, item.lotNo && `Lot: ${item.lotNo}`].filter(Boolean).join(' | ')}
                </div>
              )}
            </td>
            <td className="px-3 py-2 text-right">
              {money(item.rate)}
              <span className="text-xs text-slate-500 block">{item.rateType === 'per_lb' ? 'per Lb' : `per ${item.unit || 'Bag'}`}</span>
            </td>
            <td className="px-3 py-2 text-right">
              {item.quantity} {item.unit || 'Bags'}
              {item.totalWeight > 0 && <span className="text-xs text-slate-500 block">({item.totalWeight.toLocaleString()} Lbs)</span>}
            </td>
            <td className="px-3 py-2 text-right font-medium">{money(item.total)}</td>
            <td className="px-3 py-2 text-center"><button type="button" onClick={() => setItems((rows) => rows.filter((row) => row.rowId !== item.rowId))} aria-label={`Remove ${item.name}`} className="text-rose-600 hover:text-rose-800"><Trash2 size={16} /></button></td>
          </tr>)}</tbody>
        </table>
      </div>
      {lastPurchase && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            <div>
              <p className="font-semibold">Purchase Bill #{lastPurchase.invoice} saved successfully for {lastPurchase.party}!</p>
              <p className="text-xs text-emerald-700">Total: {money(lastPurchase.total)} | Paid: {money(lastPurchase.paid)} | Due: {money(lastPurchase.due)}</p>
            </div>
          </div>
          <Link
            to={`/purchase/invoice-print?id=${lastPurchase.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Printer size={15} /> Print / View Purchase Bill
          </Link>
        </div>
      )}
      {message && !lastPurchase && <p role="status" className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</p>}
      <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm text-slate-600"><RotateCcw size={16} /> Reset form</button>
    </form>
  );
};

export default PurchaseEntry;
