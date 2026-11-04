import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatMoney } from '../lib/accountsStore';
import { useAdminState } from '../lib/adminStore';
import { useCommerceState } from '../lib/commerceStore';
import { numberToWordsBDT } from '../lib/numberToWords';

const PurchaseInvoicePrint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { purchases } = useCommerceState();
  const { suppliers, company } = useAdminState();

  const urlId = searchParams.get('id');
  const urlInvoice = searchParams.get('invoice');

  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    if (urlId) {
      const match = purchases.find((p) => p.id === urlId);
      if (match) setInvoiceId(match.id);
    } else if (urlInvoice) {
      const match = purchases.find((p) => p.invoice.toLowerCase() === urlInvoice.toLowerCase());
      if (match) setInvoiceId(match.id);
    } else if (purchases.length > 0 && !invoiceId) {
      setInvoiceId(purchases[0].id);
    }
  }, [urlId, urlInvoice, purchases, invoiceId]);

  const invoice = purchases.find((item) => item.id === invoiceId) || purchases[0];
  const supplier = suppliers.find((item) => item.name === invoice?.party);

  return (
    <div className="mx-auto max-w-4xl p-3 sm:p-5 md:p-8 space-y-4 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <button
          type="button"
          onClick={() => navigate('/purchase/record')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Purchase Records
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden md:inline">Select Bill:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 max-w-[200px] sm:max-w-xs"
            value={invoice?.id || ''}
            onChange={(e) => setInvoiceId(e.target.value)}
          >
            {purchases.map((item) => (
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
        <article className="bg-white p-6 sm:p-8 md:p-10 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-2 text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900">
              {company.name || 'Kamrul Yarn Trading'}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Importer, Stockist & Indentor of All Kinds of Cotton, Combed, Carded & Melange Yarn
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {company.address || 'Tanbazar, Narayanganj, Bangladesh'} | Phone: {company.phone || '+880 1711-000000'} | Email: {company.email || 'kamrulyarn@gmail.com'}
            </p>

            <div className="mt-3 inline-block bg-emerald-800 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Purchase Invoice / ক্রয় বিল
            </div>
          </div>

          {/* Supplier & Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs sm:text-sm bg-slate-50/70 p-4 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Supplier / Mill Info (সরবরাহকারী):</p>
              <p className="font-bold text-slate-900 text-sm sm:text-base">{invoice.party}</p>
              {supplier?.code && <p className="text-slate-600"><span className="text-slate-400">Supplier ID:</span> {supplier.code}</p>}
              <p className="text-slate-600"><span className="text-slate-400">Address:</span> {supplier?.address || '—'}</p>
              <p className="text-slate-600"><span className="text-slate-400">Phone:</span> {supplier?.phone || '—'}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Purchase Info:</p>
              <p className="font-bold text-slate-900"><span className="text-slate-500 font-normal">Purchase Bill No:</span> {invoice.invoice}</p>
              <p className="text-slate-700"><span className="text-slate-500">Date:</span> {invoice.date}</p>
              <p className="text-slate-700">
                <span className="text-slate-500">Payment Status: </span>
                <span className={`inline-block font-bold ${invoice.due <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {invoice.due <= 0 ? 'PAID' : `DUE (${formatMoney(invoice.due)})`}
                </span>
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse text-xs sm:text-sm border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-10">#</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Product / Yarn Description</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center">Lot No</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Quantity</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Purchase Rate</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`} className="border-b border-slate-200">
                    <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-500">{index + 1}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {(item.yarnCount || item.yarnType) && (
                        <div className="text-[11px] text-slate-500">
                          {item.yarnCount ? `Count: ${item.yarnCount}` : ''} {item.yarnType ? `(${item.yarnType})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-2 text-center font-mono text-slate-700">{item.lotNo || '—'}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right">{formatMoney(item.rate)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-bold text-slate-900">{formatMoney(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount In Words & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 pt-2">
            <div className="sm:col-span-7 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600 block">In Words (কথায়):</span>
                <span className="font-bold text-slate-800 text-sm italic">{numberToWordsBDT(invoice.total)}</span>
              </div>
              {invoice.note && (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Note / Remarks:</span> {invoice.note}
                </div>
              )}
            </div>

            <div className="sm:col-span-5 flex justify-end">
              <table className="w-full text-xs sm:text-sm border border-slate-300">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Subtotal:</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(invoice.subtotal)}</td>
                  </tr>
                  {Number(invoice.discount) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Discount:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right text-rose-600 font-medium">-{formatMoney(invoice.discount)}</td>
                    </tr>
                  )}
                  {Number(invoice.vat) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">VAT / Tax:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(invoice.vat)}</td>
                    </tr>
                  )}
                  {Number(invoice.transport) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Transport:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(invoice.transport)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                    <td className="border border-slate-300 px-3 py-2 text-sm">Grand Total:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-sm">{formatMoney(invoice.total)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Paid:</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right text-emerald-700 font-semibold">{formatMoney(invoice.paid)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="border border-slate-300 px-3 py-2 text-slate-800">Due:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-rose-600 font-bold">{formatMoney(invoice.due)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-16 pb-4 text-center text-xs print:pt-20">
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Supplier / Delivery Rep</div>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Store In-Charge</div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">Authorized Signature</div>
          </div>
        </article>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FileText className="mx-auto text-slate-400 mb-2" size={36} />
          <p className="font-medium">No saved purchase invoices are available to print.</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoicePrint;
