import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Truck, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatMoney } from '../lib/accountsStore';
import { useAdminState } from '../lib/adminStore';
import { useCommerceState } from '../lib/commerceStore';
import { numberToWordsBDT } from '../lib/numberToWords';

const SalesInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sales } = useCommerceState();
  const { customers, company } = useAdminState();

  const urlId = searchParams.get('id');
  const urlInvoice = searchParams.get('invoice');

  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    if (urlId) {
      const match = sales.find((s) => s.id === urlId);
      if (match) setInvoiceId(match.id);
    } else if (urlInvoice) {
      const match = sales.find((s) => s.invoice.toLowerCase() === urlInvoice.toLowerCase());
      if (match) setInvoiceId(match.id);
    } else if (sales.length > 0 && !invoiceId) {
      setInvoiceId(sales[0].id);
    }
  }, [urlId, urlInvoice, sales, invoiceId]);

  const invoice = sales.find((item) => item.id === invoiceId) || sales[0];
  const customer = customers.find((item) => item.name === invoice?.party);

  return (
    <div className="mx-auto max-w-4xl p-3 sm:p-5 md:p-8 space-y-4 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls - Hidden on Print */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/sales/record')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Sales Records
          </button>
          {invoice && (
            <button
              type="button"
              onClick={() => navigate(`/sales/challan?invoice=${invoice.invoice}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium border border-indigo-200 transition-colors"
            >
              <Truck size={16} /> Delivery Challan
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden md:inline">Select Invoice:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 max-w-[200px] sm:max-w-xs"
            value={invoice?.id || ''}
            onChange={(e) => setInvoiceId(e.target.value)}
          >
            {sales.map((item) => (
              <option key={item.id} value={item.id}>
                {item.invoice} · {item.party} ({item.date})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!invoice}
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer size={16} /> Print Bill
          </button>
        </div>
      </div>

      {invoice ? (
        <article className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 text-slate-800 text-xs sm:text-sm">
          {/* Header - Clean & Minimal */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-300 pb-3 gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {company.name || 'Kamrul Yarn Trading'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {company.address || 'Tanbazar, Narayanganj'} · Phone: {company.phone || '+880 1711-000000'}
              </p>
              {company.taxId && <p className="text-[11px] text-slate-400">BIN / Tax ID: {company.taxId}</p>}
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded tracking-wider uppercase">
                Sales Invoice / বিল
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1.5">
                Invoice: <span className="font-mono text-slate-900">{invoice.invoice}</span>
              </p>
              <p className="text-xs text-slate-500">Date: {invoice.date}</p>
            </div>
          </div>

          {/* Customer & Payment Meta Grid */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">Customer Details (গ্রাহক):</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{invoice.party}</p>
              {customer?.phone && <p className="text-slate-600 mt-0.5">Phone: {customer.phone}</p>}
              {customer?.address && <p className="text-slate-500 truncate mt-0.5">{customer.address}</p>}
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">Billing Summary:</span>
              <p className="text-slate-700">Type: <span className="font-semibold text-slate-900">{invoice.note?.split(' · ')[0] || 'Wholesale'}</span></p>
              <p className="text-slate-700">
                Payment Status: <span className={`font-bold ${invoice.due <= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {invoice.due <= 0 ? 'PAID' : 'DUE'}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table - Clean & Compact */}
          <div className="overflow-x-auto my-3">
            <table className="w-full border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                  <th className="border border-slate-300 px-2.5 py-1.5 text-center w-8">SL</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left">Product / Yarn Description</th>
                  <th className="border border-slate-300 px-2.5 py-1.5 text-center">Brand</th>
                  <th className="border border-slate-300 px-2.5 py-1.5 text-center">Lot</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-right">Quantity</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-right">Rate</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`} className="border-b border-slate-200">
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center text-slate-500">{index + 1}</td>
                    <td className="border border-slate-300 px-3 py-1.5">
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {(item.yarnCount || item.yarnType) && (
                        <span className="text-[11px] text-slate-500 ml-1.5">
                          {[item.yarnCount, item.yarnType].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center text-slate-700">{item.brand || '—'}</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono text-slate-700">{item.lotNo || '—'}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">
                      {item.quantity} {item.unit}
                      {item.totalWeight > 0 && item.rateType === 'per_lb' && (
                        <span className="text-[10px] text-slate-400 block">({item.totalWeight} Lbs)</span>
                      )}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">
                      {formatMoney(item.rate)}
                      <span className="text-[10px] text-slate-400 block">{item.rateType === 'per_lb' ? '/Lb' : `/${item.unit || 'Bag'}`}</span>
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold font-mono text-slate-900">{formatMoney(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount In Words & Totals Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-2 pt-1 items-start">
            <div className="sm:col-span-7 space-y-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[11px]">In Words (কথায়):</span>
                <span className="font-semibold text-slate-900 italic">{numberToWordsBDT(invoice.total)}</span>
              </div>
              {invoice.note && (
                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-500">Note:</span> {invoice.note}
                </p>
              )}
              <div className="text-[11px] text-slate-400 space-y-0.5 border-l-2 border-slate-300 pl-2">
                <p>Goods once sold will not be returned without valid inspection.</p>
              </div>
            </div>

            <div className="sm:col-span-5">
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Subtotal:</td>
                    <td className="border border-slate-300 px-2.5 py-1 text-right font-mono font-medium">{formatMoney(invoice.subtotal)}</td>
                  </tr>
                  {Number(invoice.discount) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Discount:</td>
                      <td className="border border-slate-300 px-2.5 py-1 text-right text-rose-600 font-mono font-medium">-{formatMoney(invoice.discount)}</td>
                    </tr>
                  )}
                  {Number(invoice.vat) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-2.5 py-1 text-slate-600">VAT:</td>
                      <td className="border border-slate-300 px-2.5 py-1 text-right font-mono font-medium">{formatMoney(invoice.vat)}</td>
                    </tr>
                  )}
                  {Number(invoice.transport) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Transport:</td>
                      <td className="border border-slate-300 px-2.5 py-1 text-right font-mono font-medium">{formatMoney(invoice.transport)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="border border-slate-300 px-2.5 py-1.5">Net Total:</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-right font-mono text-sm">{formatMoney(invoice.total)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Paid:</td>
                    <td className="border border-slate-300 px-2.5 py-1 text-right text-emerald-700 font-mono font-semibold">{formatMoney(invoice.paid)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="border border-slate-300 px-2.5 py-1.5 text-slate-800">Due:</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-right text-rose-600 font-mono">{formatMoney(invoice.due)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 pb-2 text-center text-xs print:pt-14">
            <div className="border-t border-slate-300 pt-1 text-slate-600">Customer Signature</div>
            <div className="border-t border-slate-300 pt-1 text-slate-600">Prepared & Checked By</div>
            <div className="border-t border-slate-300 pt-1 font-semibold text-slate-900">Authorized Signature</div>
          </div>
        </article>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FileText className="mx-auto text-slate-400 mb-2" size={36} />
          <p className="font-medium">No saved sales invoices are available to print.</p>
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;
