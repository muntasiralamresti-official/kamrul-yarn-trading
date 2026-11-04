import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Truck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCommerceState } from '../lib/commerceStore';
import { useAdminState } from '../lib/adminStore';

const DeliveryChallanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const commerce = useCommerceState();
  const admin = useAdminState();

  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [challanNo] = useState(() => `DC-${Date.now().toString().slice(-6)}`);
  const [date] = useState(() => new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState('');
  const [destination, setDestination] = useState('');
  const [truckNo, setTruckNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [remarks] = useState('');
  const [items, setItems] = useState([]);

  // Load from existing sale invoice
  const handleSelectInvoice = (invNo) => {
    if (!invNo) {
      setSelectedInvoiceNo('');
      setCustomer('');
      setDestination('');
      setItems([]);
      return;
    }
    setSelectedInvoiceNo(invNo);
    const sale = commerce.sales.find((s) => s.invoice.toLowerCase() === invNo.toLowerCase());
    if (!sale) return;

    setCustomer(sale.party || '');
    const custObj = admin.customers.find((c) => c.name === sale.party);
    if (custObj) {
      setDestination(custObj.address || custObj.area || '');
    }

    if (sale.items && sale.items.length) {
      setItems(
        sale.items.map((it, idx) => ({
          id: String(idx + 1),
          description: `${it.name || ''} ${it.yarnCount ? `(${it.yarnCount}${it.yarnType ? ` ${it.yarnType}` : ''})` : ''}`,
          lot: it.lotNo || it.lot || '—',
          bags: it.quantity || 1,
          weight: it.lbsPerBag ? `${(Number(it.quantity) || 1) * Number(it.lbsPerBag)} Lbs` : `${it.quantity} ${it.unit}`,
        }))
      );
    }
  };

  useEffect(() => {
    const invParam = searchParams.get('invoice');
    if (invParam) {
      handleSelectInvoice(invParam);
    } else if (commerce.sales.length > 0 && !selectedInvoiceNo) {
      handleSelectInvoice(commerce.sales[0].invoice);
    }
  }, [searchParams, commerce.sales, selectedInvoiceNo]);

  const totalBags = items.reduce((sum, item) => sum + (Number(item.bags) || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Delivery Challan & Gate Pass</h1>
            <p className="text-xs text-slate-500">Generate rate-free transport copy & security gate slip</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedInvoiceNo}
            onChange={(e) => handleSelectInvoice(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Load from Sale Invoice --</option>
            {commerce.sales.map((s) => (
              <option key={s.id} value={s.invoice}>
                {s.invoice} ({s.party})
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer size={16} /> Print Challan
          </button>
        </div>
      </div>

      {/* Editable Transport Controls (Hidden during Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 mb-1">Truck / Vehicle No (গাড়ি নং)</label>
          <input
            type="text"
            placeholder="e.g. Dhaka Metro-Ta 11-2345"
            value={truckNo}
            onChange={(e) => setTruckNo(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 mb-1">Driver Name (চালকের নাম)</label>
          <input
            type="text"
            placeholder="e.g. Md. Rafiqul Islam"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 mb-1">Driver Mobile (মোবাইল নং)</label>
          <input
            type="text"
            placeholder="e.g. 01700-112233"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* PRINTABLE DOCUMENT */}
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 text-slate-800">
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              {admin.company.name || 'Kamrul Yarn Trading'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {admin.company.address || 'Tanbazar, Narayanganj | Yarn Merchant & Commission Agent'}
            </p>
            <p className="text-xs text-slate-500">
              Phone: {admin.company.phone || '01711-000000'} | Email: {admin.company.email || 'info@kamrulyarn.com'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-3 py-1 rounded tracking-wider">
              Delivery Challan
            </span>
            <p className="text-xs font-semibold text-slate-700 mt-2">Challan No: <span className="font-mono">{challanNo}</span></p>
            <p className="text-xs text-slate-500">Date: {date}</p>
            {selectedInvoiceNo && <p className="text-xs text-slate-500">Ref Inv: {selectedInvoiceNo}</p>}
          </div>
        </div>

        {/* Party & Transport Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <span className="text-slate-400 uppercase font-bold tracking-wider block mb-1">Consignee / Delivery To:</span>
            <p className="font-bold text-sm text-slate-900">{customer || 'Walk-in Factory / Party'}</p>
            <p className="text-slate-600 mt-0.5">{destination || 'Delivery Point / Factory Godown'}</p>
          </div>
          <div className="border-l border-slate-200 pl-6 space-y-1">
            <span className="text-slate-400 uppercase font-bold tracking-wider block mb-1">Transport Details:</span>
            <p><strong className="text-slate-700">Vehicle No:</strong> {truckNo || 'Direct Handover / Van'}</p>
            <p><strong className="text-slate-700">Driver:</strong> {driverName || '—'} {driverPhone ? `(${driverPhone})` : ''}</p>
          </div>
        </div>

        {/* Item Table (Without Rates or Price) */}
        <table className="w-full text-left text-xs mb-8 border-collapse">
          <thead>
            <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-700 uppercase font-bold tracking-wide">
              <th className="py-2.5 px-3 w-12 text-center">SL</th>
              <th className="py-2.5 px-3">Yarn Description & Count (সুতার বিবরণ)</th>
              <th className="py-2.5 px-3 text-center">Lot No (লট নং)</th>
              <th className="py-2.5 px-3 text-right">Quantity (Bags)</th>
              <th className="py-2.5 px-3 text-right">Total Weight (Lbs / Kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((it, idx) => (
              <tr key={it.id}>
                <td className="py-3 px-3 text-center text-slate-500">{idx + 1}</td>
                <td className="py-3 px-3 font-semibold text-slate-800">{it.description}</td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">{it.lot}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-800">{it.bags} Bags</td>
                <td className="py-3 px-3 text-right text-slate-700 font-medium">{it.weight}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                  No items loaded. Select a saved sales invoice above to load dispatch goods.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800 font-bold bg-slate-50 text-slate-900">
              <td colSpan="3" className="py-3 px-3 text-right uppercase">Total Dispatch:</td>
              <td className="py-3 px-3 text-right">{totalBags} Bags</td>
              <td className="py-3 px-3 text-right">Items Verified</td>
            </tr>
          </tfoot>
        </table>

        {remarks && (
          <p className="text-xs text-slate-500 mb-8 italic">Remarks: {remarks}</p>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-4 gap-4 pt-12 text-center text-xs text-slate-600 border-t border-slate-200 mt-12">
          <div>
            <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
            <span>Received By</span>
          </div>
          <div>
            <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
            <span>Driver Signature</span>
          </div>
          <div>
            <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
            <span>Godown In-Charge</span>
          </div>
          <div>
            <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
            <span>Authorized Signature</span>
          </div>
        </div>

        {/* Dotted Tear-off Gate Pass */}
        <div className="mt-12 pt-6 border-t-2 border-dashed border-slate-300">
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Truck size={14} /> Security Gate Pass Copy (গেট পাস)
            </span>
            <span className="font-mono text-slate-500">Challan #{challanNo}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs flex justify-between items-center">
            <div>
              <p><strong className="text-slate-700">Vehicle:</strong> {truckNo || 'N/A'}</p>
              <p><strong className="text-slate-700">Consignee:</strong> {customer || 'Party'}</p>
            </div>
            <div>
              <p><strong className="text-slate-700">Bags:</strong> {totalBags} Bags</p>
              <p><strong className="text-slate-700">Driver:</strong> {driverName || '—'}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-24 mb-1"></div>
              <span className="text-[10px] text-slate-500">Security Gate Sign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanPage;
