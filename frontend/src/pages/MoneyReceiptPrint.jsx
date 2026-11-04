import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatMoney, useAccountsState } from '../lib/accountsStore';
import { useAdminState } from '../lib/adminStore';
import { saleDueByCustomer, useCommerceState } from '../lib/commerceStore';
import { numberToWordsBDT } from '../lib/numberToWords';

const MoneyReceiptPrint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, bankAccounts } = useAccountsState();
  const { customers, company } = useAdminState();
  const commerce = useCommerceState();

  const urlId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState('');

  const customerPayments = transactions.filter((t) => t.type === 'customer-payment');

  useEffect(() => {
    if (urlId) {
      const match = customerPayments.find((t) => t.id === urlId);
      if (match) setSelectedId(match.id);
    } else if (customerPayments.length > 0 && !selectedId) {
      setSelectedId(customerPayments[0].id);
    }
  }, [urlId, customerPayments, selectedId]);

  const payment = customerPayments.find((t) => t.id === selectedId) || customerPayments[0];
  const customer = customers.find((c) => c.name === payment?.party);
  const bankAccount = bankAccounts.find((b) => b.id === payment?.bankAccountId);

  const currentDue = customer ? saleDueByCustomer(customer, transactions) : 0;
  const receiptNo = payment ? `MR-${String(payment.id).slice(-6).toUpperCase()}` : 'MR-000000';

  const renderVoucher = (copyTitle) => (
    <div className="bg-white border border-slate-300 rounded-lg p-5 text-slate-800 space-y-3 relative overflow-hidden text-xs sm:text-sm">
      <div className="flex justify-between items-start border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-sky-900">{company.name || 'Kamrul Yarn Trading'}</h1>
          <p className="text-xs text-slate-500">{company.address || 'Tanbazar, Narayanganj'} · Phone: {company.phone || '+880 1711-000000'}</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded border border-sky-300 uppercase tracking-wider mb-1">
            {copyTitle}
          </span>
          <p className="text-xs font-semibold text-slate-700">Receipt No: <span className="font-mono text-slate-900">{receiptNo}</span></p>
          <p className="text-xs text-slate-500">Date: {payment?.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs py-1">
        <div>
          <span className="text-slate-500">Received With Thanks From:</span>
          <p className="font-bold text-sm text-slate-900">{payment?.party || 'Unknown Customer'}</p>
          {customer && <p className="text-slate-500">{customer.address || ''} {customer.phone ? `· Mobile: ${customer.phone}` : ''}</p>}
        </div>
        <div className="text-right">
          <span className="text-slate-500">Payment Mode:</span>
          <p className="font-semibold text-slate-800">{payment?.method || 'Cash'}</p>
          {payment?.method === 'Bank' && bankAccount && (
            <p className="text-slate-500">{bankAccount.bankName} (A/C: {bankAccount.accountNumber})</p>
          )}
          {payment?.reference && <p className="text-slate-500 text-[11px]">Ref: {payment.reference}</p>}
        </div>
      </div>

      <div className="border border-sky-200 bg-sky-50/60 rounded-md p-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-700">Amount Received (টাকার পরিমাণ):</span>
          <span className="text-base sm:text-lg font-bold text-sky-950 font-mono">{formatMoney(payment?.amount || 0)}</span>
        </div>
        <div className="mt-1 text-xs text-slate-600 border-t border-sky-200/60 pt-1">
          <span className="font-medium">In Words:</span> <span className="italic">{numberToWordsBDT(payment?.amount || 0)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
        <div>Customer Current Remaining Due: <strong className="text-rose-700 font-mono">{formatMoney(currentDue)}</strong></div>
        <div className="text-[11px] italic">Computer Generated Valid Receipt</div>
      </div>

      <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
        <div>
          <div className="border-t border-slate-300 pt-1">Customer / Paid By</div>
        </div>
        <div>
          <div className="border-t border-slate-300 pt-1">Received By / Cashier</div>
        </div>
        <div>
          <div className="border-t border-slate-300 pt-1 font-semibold text-slate-800">Authorized Signature</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5 md:p-8 space-y-4 print:p-0 print:m-0 print:max-w-none">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <button
          type="button"
          onClick={() => navigate('/accounts/customer-payment')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Customer Payment
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">Select Receipt:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-500 max-w-56 truncate"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {customerPayments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.date} · {t.party} (৳{Number(t.amount).toLocaleString()})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>

      {!payment ? (
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
          No customer payment transaction found. Please record a payment in Accounts &rarr; Customer Payment first.
        </div>
      ) : (
        <div className="space-y-4 print:space-y-6">
          {renderVoucher('Customer Copy (গ্রাহক কপি)')}
          <div className="border-t-2 border-dashed border-slate-300 relative my-2 print:my-4">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] text-slate-400 font-mono">
              ✂ Tear / Cut along this line (অফিস ও গ্রাহক কপি)
            </span>
          </div>
          {renderVoucher('Office Copy (অফিস কপি)')}
        </div>
      )}
    </div>
  );
};

export default MoneyReceiptPrint;
