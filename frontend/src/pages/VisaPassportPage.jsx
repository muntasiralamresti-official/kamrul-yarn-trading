import React, { useState, useMemo } from 'react';
import {
  useVisaState, saveVisaFile, deleteVisaFile, addVisaPayment, deleteVisaPayment,
  calculateFileFinances, VISA_STATUSES
} from '../lib/visaStore';
import { formatMoney } from '../lib/accountsStore';
import { exportMultipleSheets } from '../lib/excelExport';
import { VisaKpiCards } from '../components/VisaKpiCards';
import { VisaFileForm } from '../components/VisaFileForm';
import { VisaPaymentModal } from '../components/VisaPaymentModal';
import { VisaFileDetailsModal } from '../components/VisaFileDetailsModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { Plane, Search, FileSpreadsheet, Printer, Eye, DollarSign, Edit, Trash2 } from 'lucide-react';

const emptyFileForm = {
  candidateName: '', passportNumber: '', phone: '', country: 'Saudi Arabia',
  agencyName: '', agencyPhone: '', status: 'received', contractAmount: '',
  agencyCost: '', documents: {}, notes: '',
};

const VisaPassportPage = () => {
  const { files = [], payments = [] } = useVisaState();
  const [activeTab, setActiveTab] = useState('files');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [fileForm, setFileForm] = useState(emptyFileForm);
  const [editingFileId, setEditingFileId] = useState(null);

  const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);
  const [paymentModalFile, setPaymentModalFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [message, setMessage] = useState('');

  const stats = useMemo(() => {
    let totalCandidateDue = 0, totalAgencyDue = 0, totalProjectedProfit = 0;
    let activeFiles = 0, deliveredFiles = 0;

    files.forEach((f) => {
      const fin = calculateFileFinances(f, payments);
      totalCandidateDue += Math.max(0, fin.candidateDue);
      totalAgencyDue += Math.max(0, fin.agencyDue);
      totalProjectedProfit += fin.projectedProfit;
      if (f.status === 'delivered') deliveredFiles += 1;
      else if (f.status !== 'cancelled') activeFiles += 1;
    });

    return { totalCandidateDue, totalAgencyDue, totalProjectedProfit, totalFiles: files.length, activeFiles, deliveredFiles };
  }, [files, payments]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const term = `${f.candidateName} ${f.passportNumber} ${f.agencyName || ''} ${f.country || ''} ${f.phone || ''}`.toLowerCase();
      if (!term.includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      return true;
    });
  }, [files, search, statusFilter]);

  const handleSaveFile = (e) => {
    e.preventDefault();
    try {
      saveVisaFile({ ...fileForm, id: editingFileId });
      setFileForm(emptyFileForm);
      setEditingFileId(null);
      setMessage(editingFileId ? 'Visa file updated successfully.' : 'New visa file created successfully.');
      setActiveTab('files');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditFile = (file) => {
    setEditingFileId(file.id);
    setFileForm({ ...file });
    setActiveTab('form');
  };

  const handleExportExcel = () => {
    if (!files.length) { alert('No visa files available to export.'); return; }
    const fileRows = files.map((f) => {
      const fin = calculateFileFinances(f, payments);
      return {
        'Candidate Name': f.candidateName, 'Passport No': f.passportNumber, 'Phone': f.phone || '',
        'Country': f.country, 'Agency': f.agencyName || '', 'Status': f.status,
        'Deal Amount': f.contractAmount, 'Paid by Candidate': fin.candidatePaid, 'Due from Candidate': fin.candidateDue,
        'Agency Cost': f.agencyCost, 'Paid to Agency': fin.agencyPaid, 'Due to Agency': fin.agencyDue,
        'Projected Profit': fin.projectedProfit,
      };
    });
    const paymentRows = payments.map((p) => ({
      'Date': p.date, 'Candidate': p.candidateName, 'Passport': p.passportNumber,
      'Party': p.party === 'candidate' ? 'From Candidate' : 'To Agency',
      'Amount': p.amount, 'Method': p.method, 'Receipt': p.receiptNo || '', 'Note': p.note || '',
    }));
    exportMultipleSheets({ 'Visa Files': fileRows, 'Payments Log': paymentRows }, 'Visa_Files_Ledger');
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {previewData && <DocumentPreviewModal doc={previewData.doc} title={previewData.title} onClose={() => setPreviewData(null)} />}
      {paymentModalFile && (
        <VisaPaymentModal file={paymentModalFile} isOpen={!!paymentModalFile} onClose={() => setPaymentModalFile(null)} onSavePayment={addVisaPayment} />
      )}
      {selectedFileForDetails && (
        <VisaFileDetailsModal
          file={selectedFileForDetails} payments={payments} isOpen={!!selectedFileForDetails}
          onClose={() => setSelectedFileForDetails(null)} onOpenPayment={() => setPaymentModalFile(selectedFileForDetails)}
          onEditFile={handleEditFile} onDeletePayment={deleteVisaPayment} onPreviewDoc={(doc, title) => setPreviewData({ doc, title })}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Plane className="text-indigo-600" size={26} /> Visa & Passport Processing Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            প্যাসেঞ্জারদের পাসপোর্ট, ভিসা প্রসেসিং ও এজেন্সির লেনদেন হিসাব
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportExcel} className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <FileSpreadsheet size={15} className="text-emerald-600" /> Export Excel
          </button>
          <button type="button" onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Printer size={15} className="text-slate-600" /> Print
          </button>
        </div>
      </div>

      <VisaKpiCards stats={stats} />
      {message && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs">{message}</div>}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-3 text-xs sm:text-sm font-semibold">
        <button type="button" onClick={() => setActiveTab('files')} className={`pb-2.5 border-b-2 transition-colors ${activeTab === 'files' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          All Visa Files ({files.length})
        </button>
        <button type="button" onClick={() => setActiveTab('payments')} className={`pb-2.5 border-b-2 transition-colors ${activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Payment History ({payments.length})
        </button>
        <button type="button" onClick={() => { setFileForm(emptyFileForm); setEditingFileId(null); setActiveTab('form'); }} className={`pb-2.5 border-b-2 transition-colors ${activeTab === 'form' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          {editingFileId ? '✏️ Edit File' : '+ New Passport File'}
        </button>
      </div>

      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate, passport or agency..." className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              {[{ id: 'all', label: 'All' }, ...VISA_STATUSES].map((s) => (
                <button key={s.id} type="button" onClick={() => setStatusFilter(s.id)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${statusFilter === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="px-3 py-2.5">Candidate & Passport</th>
                  <th className="px-3 py-2.5">Country & Agency</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Candidate Due</th>
                  <th className="px-3 py-2.5 text-right">Agency Due</th>
                  <th className="px-3 py-2.5 text-right">Profit</th>
                  <th className="px-3 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-400">No visa files found matching your criteria.</td></tr>
                ) : (
                  filteredFiles.map((f) => {
                    const fin = calculateFileFinances(f, payments);
                    const statusObj = VISA_STATUSES.find((s) => s.id === f.status) || VISA_STATUSES[0];
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-900">{f.candidateName}</p>
                          <span className="font-mono text-slate-500 text-[11px]">{f.passportNumber} {f.phone ? `• ${f.phone}` : ''}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-slate-800">{f.country}</p>
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px] block">{f.agencyName || 'Direct'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusObj.color}`}>
                            {statusObj.icon} {statusObj.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{formatMoney(fin.candidateDue)}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-700">{formatMoney(fin.agencyDue)}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-700">{formatMoney(fin.projectedProfit)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setSelectedFileForDetails(f)} className="p-1 rounded text-indigo-600 hover:bg-indigo-50" title="View details & ledger"><Eye size={14} /></button>
                            <button type="button" onClick={() => setPaymentModalFile(f)} className="p-1 rounded text-emerald-600 hover:bg-emerald-50" title="Record payment"><DollarSign size={14} /></button>
                            <button type="button" onClick={() => handleEditFile(f)} className="p-1 rounded text-amber-600 hover:bg-amber-50" title="Edit file"><Edit size={14} /></button>
                            <button type="button" onClick={() => { if (window.confirm(`Delete file for ${f.candidateName}?`)) deleteVisaFile(f.id); }} className="p-1 rounded text-slate-400 hover:text-rose-600" title="Delete file"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="px-3 py-2">Date</th><th className="px-3 py-2">Candidate</th><th className="px-3 py-2">Passport</th>
                <th className="px-3 py-2">Party</th><th className="px-3 py-2">Method</th><th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Receipt</th><th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-slate-400">No payment history recorded yet.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-slate-600">{p.date}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{p.candidateName}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{p.passportNumber}</td>
                    <td className="px-3 py-2">
                      {p.party === 'candidate' ? <span className="text-emerald-700 font-medium">প্যাসেঞ্জার দিয়েছে</span> : <span className="text-rose-700 font-medium">এজেন্সিকে দিয়েছি</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.method}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{formatMoney(p.amount)}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{p.receiptNo || '—'}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[150px] truncate">{p.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'form' && (
        <VisaFileForm
          fileForm={fileForm} setFileForm={setFileForm} onSaveFile={handleSaveFile}
          editingFileId={editingFileId} onCancelEdit={() => { setFileForm(emptyFileForm); setEditingFileId(null); setActiveTab('files'); }}
          onPreviewDoc={(doc, title) => setPreviewData({ doc, title })}
        />
      )}
    </div>
  );
};

export default VisaPassportPage;
