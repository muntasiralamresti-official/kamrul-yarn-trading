import React from 'react';
import { UserPlus, UserCheck, X } from 'lucide-react';
import { ContactDocumentUploader } from './ContactDocumentUploader';

export const PersonalContactForm = ({
  personForm,
  setPersonForm,
  onSavePerson,
  editingPersonId,
  onCancelEdit,
  onPreviewDoc,
}) => {
  return (
    <form onSubmit={onSavePerson} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-3xl shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          {editingPersonId ? (
            <>
              <UserCheck size={18} className="text-amber-600" /> Edit Contact Person
            </>
          ) : (
            <>
              <UserPlus size={18} className="text-indigo-600" /> Add New Contact Person
            </>
          )}
        </h3>
        {editingPersonId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X size={14} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Contact Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={personForm.name}
            onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
            placeholder="Full Name"
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Mobile / Phone Number (Optional)</label>
          <input
            type="text"
            value={personForm.phone || ''}
            onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
            placeholder="017XXXXXXXX"
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
          <select
            value={personForm.relation || 'Friend'}
            onChange={(e) => setPersonForm({ ...personForm, relation: e.target.value })}
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm bg-white"
          >
            <option value="Friend">Friend</option>
            <option value="Family / Relative">Family / Relative</option>
            <option value="Business Associate">Business Associate</option>
            <option value="Neighbor">Neighbor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2 md:col-span-3">
          <label className="block text-xs font-medium text-slate-700 mb-1">Address / Location (Optional)</label>
          <input
            type="text"
            value={personForm.address || ''}
            onChange={(e) => setPersonForm({ ...personForm, address: e.target.value })}
            placeholder="House / Village, Post, Police Station, District..."
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NID Number (Optional)
          </label>
          <input
            type="text"
            value={personForm.nidNumber || ''}
            onChange={(e) => setPersonForm({ ...personForm, nidNumber: e.target.value })}
            placeholder="e.g. 1982736192837"
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Passport Number (Optional)
          </label>
          <input
            type="text"
            value={personForm.passportNumber || ''}
            onChange={(e) => setPersonForm({ ...personForm, passportNumber: e.target.value })}
            placeholder="e.g. A01234567"
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm font-mono uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Opening Balance Type</label>
          <select
            value={personForm.openingType || 'receivable'}
            onChange={(e) => setPersonForm({ ...personForm, openingType: e.target.value })}
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm bg-white"
          >
            <option value="receivable">I am owed (Receivable / My Due)</option>
            <option value="payable">I owe (Payable / My Debt)</option>
          </select>
        </div>

        <div className="sm:col-span-2 md:col-span-3">
          <label className="block text-xs font-medium text-slate-700 mb-1">Opening Amount (BDT, Optional)</label>
          <input
            type="number"
            min="0"
            value={personForm.openingAmount || ''}
            onChange={(e) => setPersonForm({ ...personForm, openingAmount: e.target.value })}
            placeholder="0"
            className="w-full rounded border border-slate-300 p-2 text-xs sm:text-sm font-mono"
          />
        </div>
      </div>

      {/* Optimized Document & Photo Upload Component */}
      <ContactDocumentUploader
        documents={personForm.documents || {}}
        onChange={(docs) => setPersonForm({ ...personForm, documents: docs })}
        onPreview={onPreviewDoc}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        {editingPersonId && (
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
          className={`text-white font-medium text-xs sm:text-sm px-6 py-2 rounded-lg transition-colors shadow-sm ${
            editingPersonId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {editingPersonId ? 'Update Contact' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};
