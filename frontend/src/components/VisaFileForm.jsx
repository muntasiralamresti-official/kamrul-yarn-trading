import React from 'react';
import { VISA_STATUSES } from '../lib/visaStore';
import { formatMoney } from '../lib/accountsStore';
import { ContactDocumentUploader } from './ContactDocumentUploader';
import { Plane, TrendingUp, X } from 'lucide-react';

export const VisaFileForm = ({
  fileForm,
  setFileForm,
  onSaveFile,
  editingFileId,
  onCancelEdit,
  onPreviewDoc,
}) => {
  const projectedProfit = (Number(fileForm.contractAmount) || 0) - (Number(fileForm.agencyCost) || 0);

  return (
    <form onSubmit={onSaveFile} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-4xl shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Plane size={20} className="text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {editingFileId ? 'Edit Visa & Passport File' : 'Create New Visa & Passport File'}
          </h3>
        </div>
        {editingFileId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X size={14} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Candidate Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            প্যাসেঞ্জার / ক্যান্ডিডেটের নাম *
          </label>
          <input
            type="text"
            value={fileForm.candidateName || ''}
            onChange={(e) => setFileForm({ ...fileForm, candidateName: e.target.value })}
            placeholder="Full Name"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Passport Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            পাসপোর্ট নম্বর *
          </label>
          <input
            type="text"
            value={fileForm.passportNumber || ''}
            onChange={(e) => setFileForm({ ...fileForm, passportNumber: e.target.value })}
            placeholder="e.g. A01234567"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm font-mono uppercase font-bold"
            required
          />
        </div>

        {/* Candidate Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            প্যাসেঞ্জারের মোবাইল নম্বর
          </label>
          <input
            type="text"
            value={fileForm.phone || ''}
            onChange={(e) => setFileForm({ ...fileForm, phone: e.target.value })}
            placeholder="017XXXXXXXX"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm"
          />
        </div>

        {/* Destination Country */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            গন্তব্য দেশ (Country)
          </label>
          <select
            value={fileForm.country || 'Saudi Arabia'}
            onChange={(e) => setFileForm({ ...fileForm, country: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white font-medium"
          >
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia (সৌদি আরব)</option>
            <option value="UAE / Dubai">🇦🇪 UAE / Dubai (দুবাই)</option>
            <option value="Qatar">🇶🇦 Qatar (কাতার)</option>
            <option value="Oman">🇴🇲 Oman (ওমান)</option>
            <option value="Kuwait">🇰🇼 Kuwait (কুয়েত)</option>
            <option value="Malaysia">🇲🇾 Malaysia (মালয়েশিয়া)</option>
            <option value="Italy / Europe">🇮🇹 Italy / Europe (ইউরোপ)</option>
            <option value="Singapore">🇸🇬 Singapore (সিঙ্গাপুর)</option>
            <option value="Other">🌍 Other Country (অন্যান্য)</option>
          </select>
        </div>

        {/* Agency Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            ভিসা প্রসেসিং এজেন্সি / রিক্রুটিং এজেন্সি
          </label>
          <input
            type="text"
            value={fileForm.agencyName || ''}
            onChange={(e) => setFileForm({ ...fileForm, agencyName: e.target.value })}
            placeholder="e.g. Al-Madina Travels & Tours"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm"
          />
        </div>

        {/* Current Visa Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            কাজের বর্তমান অবস্থা (Visa Status)
          </label>
          <select
            value={fileForm.status || 'received'}
            onChange={(e) => setFileForm({ ...fileForm, status: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white font-medium"
          >
            {VISA_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contract Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ক্যান্ডিডেটের সাথে মোট চুক্তি (Package Deal ৳) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={fileForm.contractAmount || ''}
            onChange={(e) => setFileForm({ ...fileForm, contractAmount: e.target.value })}
            placeholder="e.g. 500000"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm font-mono font-bold text-emerald-700"
            required
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">প্যাসেঞ্জারের মোট প্যাকেজ মূল্য</span>
        </div>

        {/* Agency Cost */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            এজেন্সির সাথে মোট খরচ / রেট (Agency Cost ৳) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={fileForm.agencyCost || ''}
            onChange={(e) => setFileForm({ ...fileForm, agencyCost: e.target.value })}
            placeholder="e.g. 420000"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm font-mono font-bold text-rose-700"
            required
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">এজেন্সিকে মোট কত দিতে হবে</span>
        </div>

        {/* Projected Profit Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={13} /> সম্ভাব্য নিট লাভ (Profit)
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-indigo-700 mt-0.5">
            {formatMoney(projectedProfit)}
          </p>
          <span className="text-[10px] text-indigo-600">চুক্তি মূল্য - এজেন্সির খরচ</span>
        </div>
      </div>

      {/* Optimized Documents Uploader */}
      <ContactDocumentUploader
        documents={fileForm.documents || {}}
        onChange={(docs) => setFileForm({ ...fileForm, documents: docs })}
        onPreview={onPreviewDoc}
      />

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">বিশেষ নোট / শর্তাবলী</label>
        <input
          type="text"
          value={fileForm.notes || ''}
          onChange={(e) => setFileForm({ ...fileForm, notes: e.target.value })}
          placeholder="e.g. ড্রাইভিং ভিসা, ২ বছরের চুক্তি, মেডিকেল ফিট..."
          className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        {editingFileId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          {editingFileId ? 'Update Visa File' : 'Save Visa File'}
        </button>
      </div>
    </form>
  );
};
