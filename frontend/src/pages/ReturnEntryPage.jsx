import React, { useMemo, useState } from 'react';
import { localDate, formatMoney } from '../lib/accountsStore';
import { savePurchaseReturn, saveSalesReturn, useCommerceState } from '../lib/commerceStore';
import { useAdminState } from '../lib/adminStore';

const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';

const ReturnEntryPage = ({ type }) => {
  const commerce = useCommerceState();
  const admin = useAdminState();
  const isSale = type === 'sales';
  const invoices = isSale ? commerce.sales : commerce.purchases;
  const returns = isSale ? commerce.salesReturns : commerce.purchaseReturns;
  const [party, setParty] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(() => localDate());
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const invoiceOptions = invoices.filter((invoice) => !party || invoice.party === party);
  const invoice = invoices.find((item) => item.id === invoiceId);
  const products = useMemo(() => (invoice?.items || []).map((item) => {
    const returned = returns.filter((entry) => entry.invoiceId === invoice.id && entry.productId === item.productId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    return { ...item, remaining: item.quantity - returned };
  }).filter((item) => item.remaining > 0), [invoice, returns]);
  const product = products.find((item) => item.productId === productId);

  const submit = (event) => {
    event.preventDefault();
    try {
      const form = { invoiceId, productId, quantity, date, reason };
      const saved = isSale ? saveSalesReturn(form) : savePurchaseReturn(form, admin.products, admin);
      setMessage(`${isSale ? 'Sales' : 'Purchase'} return ${saved.number} saved for ${formatMoney(saved.amount)}.`);
      setQuantity('');
      setReason('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the return.');
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-3 sm:p-4 md:p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <h1 className="mb-4 text-lg sm:text-xl font-semibold text-slate-900">{isSale ? 'Sales Return' : 'Purchase Return'}</h1>
        {!invoices.length && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">No saved {isSale ? 'sales' : 'purchases'} are available for return.</p>}
        <form onSubmit={submit} className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-700">{isSale ? 'Customer' : 'Supplier'}
            <select className={`${inputClass} mt-1`} value={party} onChange={(event) => { setParty(event.target.value); setInvoiceId(''); setProductId(''); }} required>
              <option value="">Select {isSale ? 'customer' : 'supplier'}</option>{[...new Set(invoices.map((item) => item.party))].map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700">Invoice
            <select className={`${inputClass} mt-1`} value={invoiceId} onChange={(event) => { setInvoiceId(event.target.value); setProductId(''); }} required>
              <option value="">Select invoice</option>{invoiceOptions.map((item) => <option key={item.id} value={item.id}>{item.invoice} · {item.date}</option>)}
            </select>
          </label>
          {invoice && <>
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">{isSale ? 'Customer' : 'Supplier'}: <strong>{invoice.party}</strong><br />Invoice total: <strong>{formatMoney(invoice.total)}</strong></p>
            <label className="text-sm text-slate-700">Product
              <select className={`${inputClass} mt-1`} value={productId} onChange={(event) => setProductId(event.target.value)} required>
                <option value="">Select product</option>{products.map((item) => <option key={item.productId} value={item.productId}>{item.name} · {item.remaining} {item.unit} remaining</option>)}
              </select>
            </label>
            {product && <label className="text-sm text-slate-700">Return Quantity (max {product.remaining} {product.unit})
              <input className={`${inputClass} mt-1`} type="number" min="0.01" max={product.remaining} step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
            </label>}
            <label className="text-sm text-slate-700">Return Date<input className={`${inputClass} mt-1`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
            <label className="text-sm text-slate-700">Reason (কারন)<input className={`${inputClass} mt-1`} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="ত্রুটিপূর্ণ কোন / কাউন্ট গরমিল / বাতিল" /></label>
            {product && (
              <p className="self-end text-sm text-slate-600 sm:col-span-2">
                Return value: <strong>{formatMoney(
                  (product.rateType === 'per_lb' && (product.lbsPerBag || 0) > 0)
                    ? Number(quantity || 0) * Number(product.lbsPerBag) * Number(product.rate)
                    : Number(quantity || 0) * Number(product.rate)
                )}</strong>
                {product.rateType === 'per_lb' && (product.lbsPerBag || 0) > 0 && (
                  <span className="text-xs text-slate-500 ml-2">({Number(quantity || 0) * Number(product.lbsPerBag)} Lbs @ ৳{product.rate}/Lb)</span>
                )}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <button className="w-full sm:w-auto rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">Save Return</button>
            </div>
            <p className="text-xs text-slate-500 sm:col-span-2">A saved return adjusts inventory and the partner balance. Any cash refund or settlement must be recorded separately in Accounts.</p>
          </>}
        </form>
      </section>
      {message && <p role="status" className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
    </main>
  );
};

export default ReturnEntryPage;
