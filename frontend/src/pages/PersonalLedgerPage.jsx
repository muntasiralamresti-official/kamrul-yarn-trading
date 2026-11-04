import React, { useState, useMemo } from 'react';
import { Wallet, Search } from 'lucide-react';
import { usePersonalState, savePerson, addPersonalRecord, deletePersonalRecord, calculatePersonBalance } from '../lib/personalStore';
import { formatMoney, localDate } from '../lib/accountsStore';
import { PersonalSummaryTable } from '../components/PersonalSummaryTable';
import { PersonalTransactionsView } from '../components/PersonalTransactionsView';

const PersonalLedgerPage = () => {
  const { persons, records } = usePersonalState();
  const [activeTab, setActiveTab] = useState('summary');
  const [search, setSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('all');

  const [personForm, setPersonForm] = useState({ name: '', phone: '', relation: 'বন্ধু/আত্মীয়', address: '', openingType: 'receivable', openingAmount: '', note: '' });
  const [txnForm, setTxnForm] = useState({ personId: '', date: localDate(), type: 'given', amount: '', method: 'Cash', bankOrWalletDetails: '', note: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const stats = useMemo(() => {
    let totalReceivable = 0;
    let totalPayable = 0;
    persons.forEach((p) => {
      const bal = calculatePersonBalance(p, records);
      if (bal > 0) totalReceivable += bal;
      if (bal < 0) totalPayable += Math.abs(bal);
    });
    return { totalReceivable, totalPayable, net: totalReceivable - totalPayable };
  }, [persons, records]);

  const handleSavePerson = (e) => {
    e.preventDefault();
    try {
      savePerson(personForm);
      setPersonForm({ name: '', phone: '', relation: 'বন্ধু/আত্মীয়', address: '', openingType: 'receivable', openingAmount: '', note: '' });
      setMessage('ব্যক্তি সফলভাবে যুক্ত হয়েছে।');
      setIsError(false);
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  const handleSaveTxn = (e) => {
    e.preventDefault();
    try {
      addPersonalRecord(txnForm);
      setTxnForm({ personId: '', date: localDate(), type: 'given', amount: '', method: 'Cash', bankOrWalletDetails: '', note: '' });
      setMessage('ব্যক্তিগত লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে।');
      setIsError(false);
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-indigo-600" size={26} /> ব্যক্তিগত দেনা-পাওনা ও ধার-দেনা হিসাব
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ব্যবসার বাইরে বন্ধু, আত্মীয় বা পরিচিতদের ব্যক্তিগত লেনদেন (কার থেকে নিলাম, কাকে দিলাম, কে কত পাবে)।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">আমি মোট পাবো (পাওনা টাকা)</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">{formatMoney(stats.totalReceivable)}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">আমি মোট দেবো (আমার দেনা / ধার)</span>
          <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1 font-mono">{formatMoney(stats.totalPayable)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">মোট নেট ব্যালেন্স</span>
          <p className={`text-xl sm:text-2xl font-bold mt-1 font-mono ${stats.net >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
            {formatMoney(Math.abs(stats.net))} {stats.net >= 0 ? '(উদ্বৃত্ত)' : '(দেনা)'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs sm:text-sm font-medium ${isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {message}
        </div>
      )}

      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          কার কাছে কত পাই / কে কত পাবে ({persons.length})
        </button>
        <button
          onClick={() => setActiveTab('transaction')}
          className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'transaction' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          নতুন লেনদেন এন্ট্রি ও ইতিহাস ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('persons')}
          className={`pb-2.5 transition-colors border-b-2 ${activeTab === 'persons' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          + নতুন ব্যক্তি যোগ করুন
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
              placeholder="ব্যক্তির নাম বা ফোন দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none"
            />
          </div>
          <PersonalSummaryTable
            persons={persons}
            records={records}
            search={search}
            onSelectPerson={(id) => {
              setTxnForm((curr) => ({ ...curr, personId: id }));
              setActiveTab('transaction');
            }}
          />
        </div>
      )}

      {activeTab === 'transaction' && (
        <PersonalTransactionsView
          persons={persons}
          records={records}
          selectedPersonId={selectedPersonId}
          setSelectedPersonId={setSelectedPersonId}
          search={search}
          txnForm={txnForm}
          setTxnForm={setTxnForm}
          onSaveTxn={handleSaveTxn}
          onDeleteRecord={deletePersonalRecord}
        />
      )}

      {activeTab === 'persons' && (
        <form onSubmit={handleSavePerson} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-2xl">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2">নতুন ব্যক্তি যোগ করুন</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">ব্যক্তির নাম *</label>
              <input
                type="text"
                value={personForm.name}
                onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                placeholder="নাম"
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">মোবাইল নম্বর</label>
              <input
                type="text"
                value={personForm.phone}
                onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                placeholder="017..."
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">সম্পর্ক</label>
              <select
                value={personForm.relation}
                onChange={(e) => setPersonForm({ ...personForm, relation: e.target.value })}
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm bg-white"
              >
                <option value="বন্ধু">বন্ধু</option>
                <option value="আত্মীয়">আত্মীয়</option>
                <option value="ব্যবসায়িক পরিচিত">ব্যবসায়িক পরিচিত</option>
                <option value="প্রতিবেশী">প্রতিবেশী</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">ঠিকানা</label>
              <input
                type="text"
                value={personForm.address}
                onChange={(e) => setPersonForm({ ...personForm, address: e.target.value })}
                placeholder="ঠিকানা"
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">পূর্বের কোনো হিসাব থাকলে</label>
              <select
                value={personForm.openingType}
                onChange={(e) => setPersonForm({ ...personForm, openingType: e.target.value })}
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm bg-white"
              >
                <option value="receivable">আমি পাবো (পাওনা)</option>
                <option value="payable">সে পাবে (আমার দেনা)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">পূর্বের টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                min="0"
                value={personForm.openingAmount}
                onChange={(e) => setPersonForm({ ...personForm, openingAmount: e.target.value })}
                placeholder="0"
                className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm px-6 py-2 rounded-lg">
              ব্যক্তি সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonalLedgerPage;
