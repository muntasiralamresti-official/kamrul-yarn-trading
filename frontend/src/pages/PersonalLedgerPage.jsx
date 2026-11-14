import React, { useState, useMemo } from 'react';
import { Wallet, Search, FileSpreadsheet, Printer } from 'lucide-react';
import {
  usePersonalState, savePerson, addPersonalRecord, updatePersonalRecord,
  deletePersonalRecord, calculatePersonBalance, addCustomType,
} from '../lib/personalStore';
import { localDate } from '../lib/accountsStore';
import { exportMultipleSheets } from '../lib/excelExport';
import { PersonalKpiCards } from '../components/PersonalKpiCards';
import { PersonalSummaryTable } from '../components/PersonalSummaryTable';
import { PersonalTransactionsView } from '../components/PersonalTransactionsView';
import { PersonalContactForm } from '../components/PersonalContactForm';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { ContactProfileModal } from '../components/ContactProfileModal';

const emptyPersonForm = {
  name: '', phone: '', relation: 'Friend / Family', address: '',
  nidNumber: '', passportNumber: '', documents: {},
  openingType: 'receivable', openingAmount: '', note: '',
};

const PersonalLedgerPage = () => {
  const { persons, records, customTypes = [] } = usePersonalState();
  const [activeTab, setActiveTab] = useState('summary');
  const [search, setSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('all');

  const [previewData, setPreviewData] = useState(null);
  const [profilePerson, setProfilePerson] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [personForm, setPersonForm] = useState(emptyPersonForm);

  const [editingTxnId, setEditingTxnId] = useState(null);
  const [txnForm, setTxnForm] = useState({
    personId: '', date: localDate(), dueDate: '', type: 'given',
    amount: '', method: 'Cash', bankOrWalletDetails: '', note: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const stats = useMemo(() => {
    let totalReceivable = 0, totalPayable = 0, receivableCount = 0, payableCount = 0, settledCount = 0;
    persons.forEach((p) => {
      const bal = calculatePersonBalance(p, records, customTypes);
      if (bal > 0) { totalReceivable += bal; receivableCount += 1; }
      else if (bal < 0) { totalPayable += Math.abs(bal); payableCount += 1; }
      else { settledCount += 1; }
    });
    return { totalReceivable, totalPayable, net: totalReceivable - totalPayable, receivableCount, payableCount, settledCount };
  }, [persons, records, customTypes]);

  const handleSavePerson = (e) => {
    e.preventDefault();
    try {
      savePerson({ ...personForm, id: editingPersonId });
      setPersonForm(emptyPersonForm);
      setEditingPersonId(null);
      setMessage(editingPersonId ? 'Contact person updated successfully.' : 'Contact person added successfully.');
      setIsError(false);
      setActiveTab('summary');
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  const handleEditPerson = (person) => {
    setEditingPersonId(person.id);
    setPersonForm({
      name: person.name, phone: person.phone || '', relation: person.relation || 'Friend / Family',
      address: person.address || '', nidNumber: person.nidNumber || '', passportNumber: person.passportNumber || '',
      documents: person.documents || {}, openingType: person.openingType || 'receivable',
      openingAmount: person.openingAmount || '', note: person.note || '',
    });
    setActiveTab('persons');
  };

  const handleSaveTxn = (e) => {
    e.preventDefault();
    try {
      if (editingTxnId) {
        updatePersonalRecord(editingTxnId, txnForm);
        setMessage('Personal transaction updated successfully.');
      } else {
        addPersonalRecord(txnForm);
        setMessage('Personal transaction recorded successfully.');
      }
      setTxnForm({ personId: '', date: localDate(), dueDate: '', type: 'given', amount: '', method: 'Cash', bankOrWalletDetails: '', note: '' });
      setEditingTxnId(null);
      setIsError(false);
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  const handleEditTxn = (record) => {
    setEditingTxnId(record.id);
    setTxnForm({
      personId: record.personId, date: record.date, dueDate: record.dueDate || '',
      type: record.type, amount: record.amount, method: record.method || 'Cash',
      bankOrWalletDetails: record.bankOrWalletDetails || '', note: record.note || '',
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleExportExcel = () => {
    if (!persons.length && !records.length) { alert('No data available to export.'); return; }
    const summaryData = persons.map((p) => {
      const bal = calculatePersonBalance(p, records, customTypes);
      return {
        'Contact Name': p.name, 'Phone': p.phone || 'N/A', 'Relationship': p.relation || 'Personal',
        'Address': p.address || 'N/A', 'NID Number': p.nidNumber || 'N/A', 'Passport Number': p.passportNumber || 'N/A',
        'Opening Balance': p.openingAmount || 0, 'Net Balance (BDT)': Math.abs(bal),
        'Status': bal > 0 ? 'To Receive (Receivable)' : bal < 0 ? 'To Pay (Payable)' : 'Settled',
      };
    });
    const txnsData = records.map((r) => ({
      'Date': r.date, 'Contact Name': r.personName, 'Transaction Type': r.type,
      'Method': r.method, 'Amount (BDT)': r.amount, 'Promised Return Date': r.dueDate || 'N/A', 'Notes': r.note || '',
    }));
    exportMultipleSheets({ 'Summary Balances': summaryData, 'Transaction Log': txnsData }, 'Personal_Ledger');
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {previewData && (
        <DocumentPreviewModal doc={previewData.doc} title={previewData.title} onClose={() => setPreviewData(null)} />
      )}
      {profilePerson && (
        <ContactProfileModal
          person={profilePerson}
          records={records}
          customTypes={customTypes}
          onClose={() => setProfilePerson(null)}
          onSelectPerson={(id) => { setTxnForm((curr) => ({ ...curr, personId: id })); setActiveTab('transaction'); }}
          onEditPerson={handleEditPerson}
          onPreviewDoc={(doc, title) => setPreviewData({ doc, title })}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-indigo-600" size={26} /> Personal Ledger & Loan Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personal borrowings, lendings, and dues outside company operations (Friends, Family & Associates).
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors">
            <FileSpreadsheet size={15} className="text-emerald-600" /> Export Excel
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors">
            <Printer size={15} className="text-slate-600" /> Print
          </button>
        </div>
      </div>

      <PersonalKpiCards stats={stats} />

      {message && (
        <div className={`p-3 rounded-lg text-xs sm:text-sm font-medium ${isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {message}
        </div>
      )}

      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
        <button type="button" onClick={() => setActiveTab('summary')} className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Balances by Contact ({persons.length})
        </button>
        <button type="button" onClick={() => setActiveTab('transaction')} className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'transaction' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Transaction History & Entries ({records.length})
        </button>
        <button type="button" onClick={() => setActiveTab('persons')} className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'persons' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          {editingPersonId ? '✏️ Edit Contact' : '+ Add New Contact'}
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contact by name, phone, NID or passport..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <PersonalSummaryTable
            persons={persons}
            records={records}
            customTypes={customTypes}
            search={search}
            onSelectPerson={(id) => { setTxnForm((curr) => ({ ...curr, personId: id })); setActiveTab('transaction'); }}
            onEditPerson={handleEditPerson}
            onPreviewDoc={(doc, title) => setPreviewData({ doc, title })}
            onViewProfile={(p) => setProfilePerson(p)}
          />
        </div>
      )}

      {activeTab === 'transaction' && (
        <PersonalTransactionsView
          persons={persons}
          records={records}
          customTypes={customTypes}
          selectedPersonId={selectedPersonId}
          setSelectedPersonId={setSelectedPersonId}
          search={search}
          txnForm={txnForm}
          setTxnForm={setTxnForm}
          editingTxnId={editingTxnId}
          onSaveTxn={handleSaveTxn}
          onEditTxn={handleEditTxn}
          onCancelEdit={() => {
            setEditingTxnId(null);
            setTxnForm({ personId: '', date: localDate(), dueDate: '', type: 'given', amount: '', method: 'Cash', bankOrWalletDetails: '', note: '' });
          }}
          onDeleteRecord={deletePersonalRecord}
          onAddCustomType={addCustomType}
        />
      )}

      {activeTab === 'persons' && (
        <PersonalContactForm
          personForm={personForm}
          setPersonForm={setPersonForm}
          onSavePerson={handleSavePerson}
          editingPersonId={editingPersonId}
          onCancelEdit={() => { setEditingPersonId(null); setPersonForm(emptyPersonForm); }}
          onPreviewDoc={(doc, title) => setPreviewData({ doc, title })}
        />
      )}
    </div>
  );
};

export default PersonalLedgerPage;
