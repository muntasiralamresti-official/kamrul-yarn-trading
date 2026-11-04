import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatMoney } from '../lib/accountsStore';
import { useAdminState } from '../lib/adminStore';
import { useCommerceState } from '../lib/commerceStore';
import { numberToWordsBDT } from '../lib/numberToWords';

const QuotationInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { quotations } = useCommerceState();
  const { customers, company } = useAdminState();

  const urlId = searchParams.get('id');
  const urlInvoice = searchParams.get('invoice');

  const [quotationId, setQuotationId] = useState('');

  useEffect(() => {
    if (urlId) {
      const match = quotations.find((q) => q.id === urlId);
      if (match) setQuotationId(match.id);
    } else if (urlInvoice) {
      const match = quotations.find((q) => q.invoice.toLowerCase() === urlInvoice.toLowerCase());
      if (match) setQuotationId(match.id);
    } else if (quotations.length > 0 && !quotationId) {
      setQuotationId(quotations[0].id);
    }
  }, [urlId, urlInvoice, quotations, quotationId]);

  const quotation = quotations.find((item) => item.id === quotationId) || quotations[0];
  const customer = customers.find((item) => item.name === quotation?.customer);

  return (
    <div className="mx-auto max-w-4xl p-3 sm:p-5 md:p-8 space-y-4 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <button
          type="button"
          onClick={() => navigate('/sales/quotation-record')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Quotation Records
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden md:inline">Select Quote:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 max-w-[200px] sm:max-w-xs"
            value={quotation?.id || ''}
            onChange={(e) => setQuotationId(e.target.value)}
          >
            {quotations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.invoice} · {item.customer} ({item.date})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!quotation}
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer size={16} /> Print Quotation
          </button>
        </div>
      </div>

      {quotation ? (
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

            <div className="mt-3 inline-block bg-sky-800 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Price Quotation / কোটেশন
            </div>
          </div>

          {/* Customer & Quote Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs sm:text-sm bg-slate-50/70 p-4 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Quotation For (গ্রাহক):</p>
              <p className="font-bold text-slate-900 text-sm sm:text-base">{quotation.customer}</p>
              {customer?.code && <p className="text-slate-600"><span className="text-slate-400">Customer ID:</span> {customer.code}</p>}
              <p className="text-slate-600"><span className="text-slate-400">Address:</span> {customer?.address || '—'}</p>
              <p className="text-slate-600"><span className="text-slate-400">Phone:</span> {customer?.phone || '—'}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Quote Details:</p>
              <p className="font-bold text-slate-900"><span className="text-slate-500 font-normal">Quotation No:</span> {quotation.invoice}</p>
              <p className="text-slate-700"><span className="text-slate-500">Date:</span> {quotation.date}</p>
              <p className="text-slate-700"><span className="text-slate-500">Status:</span> <span className="font-bold text-sky-700">{quotation.status || 'Valid'}</span></p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse text-xs sm:text-sm border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-10">#</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Product / Yarn Description</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center">Mill / Brand</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center">Lot / Spec</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Quantity</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Quoted Rate</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-500">{index + 1}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {(item.yarnCount || item.yarnType) && (
                        <div className="text-[11px] text-slate-500">
                          {item.yarnCount ? `Count: ${item.yarnCount}` : ''} {item.yarnType ? `(${item.yarnType})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-700">{item.brand || '—'}</td>
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
                <span className="font-bold text-slate-800 text-sm italic">{numberToWordsBDT(quotation.total)}</span>
              </div>
              {quotation.note && (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Note / Terms:</span> {quotation.note}
                </div>
              )}
            </div>

            <div className="sm:col-span-5 flex justify-end">
              <table className="w-full text-xs sm:text-sm border border-slate-300">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Subtotal:</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(quotation.subtotal)}</td>
                  </tr>
                  {Number(quotation.discount) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Discount:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right text-rose-600 font-medium">-{formatMoney(quotation.discount)}</td>
                    </tr>
                  )}
                  {Number(quotation.vat) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">VAT / Tax:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(quotation.vat)}</td>
                    </tr>
                  )}
                  {Number(quotation.transport) > 0 && (
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Transport:</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatMoney(quotation.transport)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                    <td className="border border-slate-300 px-3 py-2 text-sm">Estimated Total:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-sm">{formatMoney(quotation.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-16 pb-4 text-center text-xs print:pt-20">
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Prepared By</div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">For {company.name || 'Kamrul Yarn'}</div>
          </div>
        </article>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FileText className="mx-auto text-slate-400 mb-2" size={36} />
          <p className="font-medium">No saved quotations are available to print.</p>
        </div>
      )}
    </div>
  );
};

export default QuotationInvoice;
