import React, { useState } from 'react';
import { BUILTIN_TXN_TYPES } from '../lib/personalStore';
import { CustomTypeModal } from './CustomTypeModal';
import { PersonalHistoryTable } from './PersonalHistoryTable';
import { Edit, FileText, PlusCircle, X } from 'lucide-react';

export const PersonalTransactionsView = ({
  persons,
  records,
  customTypes = [],
  selectedPersonId,
  setSelectedPersonId,
  search,
  txnForm,
  setTxnForm,
  editingTxnId,
  onSaveTxn,
  onEditTxn,
  onCancelEdit,
  onDeleteRecord,
  onAddCustomType,
}) => {
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <CustomTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onAddCustomType={onAddCustomType}
      />

      {/* Transaction Entry / Edit Form */}
      <form onSubmit={onSaveTxn} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            {editingTxnId ? (
              <>
                <Edit size={18} className="text-amber-600" /> Edit Personal Transaction
              </>
            ) : (
              <>
                <FileText size={18} className="text-indigo-600" /> Record New Personal Transaction
              </>
            )}
          </h3>
          {editingTxnId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person *</label>
            <select
              value={txnForm.personId}
              onChange={(e) => setTxnForm({ ...txnForm, personId: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose Contact Person --</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relation || 'Personal'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Date *</label>
            <input
              type="date"
              value={txnForm.date}
              onChange={(e) => setTxnForm({ ...txnForm, date: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">Transaction Type *</label>
              <button
                type="button"
                onClick={() => setIsTypeModalOpen(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                title="Add custom transaction type"
              >
                <PlusCircle size={12} /> Add Type
              </button>
            </div>
            <select
              value={txnForm.type}
              onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-medium text-slate-800"
            >
              <optgroup label="Standard Types">
                {BUILTIN_TXN_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
              {customTypes.length > 0 && (
                <optgroup label="Custom Added Types">
                  {customTypes.map((t) => (
                    <option key={t.id} value={t.id}>✨ {t.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount (BDT) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={txnForm.amount}
              onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={txnForm.method}
              onChange={(e) => setTxnForm({ ...txnForm, method: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="bKash / Nagad">Mobile Banking (bKash / Nagad / Rocket)</option>
              <option value="Bank">Bank Transfer / Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Promised Return Date (Optional)</label>
            <input
              type="date"
              value={txnForm.dueDate || ''}
              onChange={(e) => setTxnForm({ ...txnForm, dueDate: e.target.value })}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Purpose / Note / Cheque No.</label>
            <input
              type="text"
              value={txnForm.note}
              onChange={(e) => setTxnForm({ ...txnForm, note: e.target.value })}
              placeholder="e.g. Emergency medical assistance, Cheque #49281..."
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          {editingTxnId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`font-medium text-xs sm:text-sm px-6 py-2 rounded-lg transition-colors shadow-sm text-white ${
              editingTxnId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {editingTxnId ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>

      {/* History Table */}
      <PersonalHistoryTable
        persons={persons}
        records={records}
        customTypes={customTypes}
        selectedPersonId={selectedPersonId}
        setSelectedPersonId={setSelectedPersonId}
        search={search}
        onEditTxn={onEditTxn}
        onDeleteRecord={onDeleteRecord}
      />
    </div>
  );
};
