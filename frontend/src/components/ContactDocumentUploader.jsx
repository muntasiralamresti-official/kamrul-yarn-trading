import React, { useState } from 'react';
import { compressImageFile, processPdfFile } from '../lib/fileOptimizer';
import { UploadCloud, Eye, Trash2, CheckCircle2, FileText, Loader2 } from 'lucide-react';

const DOC_SLOTS = [
  { key: 'photo', label: "Person's Photo", icon: '👤', accept: 'image/*' },
  { key: 'passportDoc', label: 'Passport Copy / Photo', icon: '🛂', accept: 'image/*,.pdf' },
  { key: 'visaDoc', label: 'Visa Copy / Photo', icon: '✈️', accept: 'image/*,.pdf' },
  { key: 'nidDoc', label: 'NID Card Copy / Photo', icon: '🪪', accept: 'image/*,.pdf' },
];

export const ContactDocumentUploader = ({ documents = {}, onChange, onPreview }) => {
  const [compressingSlot, setCompressingSlot] = useState(null);
  const [errorSlot, setErrorSlot] = useState({});

  const handleFileUpload = async (slotKey, file) => {
    if (!file) return;
    setCompressingSlot(slotKey);
    setErrorSlot((prev) => ({ ...prev, [slotKey]: null }));

    try {
      let optimized;
      if (file.type === 'application/pdf') {
        optimized = await processPdfFile(file, 800);
      } else if (file.type.startsWith('image/')) {
        optimized = await compressImageFile(file, {
          maxWidth: slotKey === 'photo' ? 600 : 1200,
          maxHeight: slotKey === 'photo' ? 600 : 1200,
          targetMaxKb: slotKey === 'photo' ? 45 : 85,
          initialQuality: 0.72,
        });
      } else {
        throw new Error('Please select an image or PDF file.');
      }

      onChange({
        ...documents,
        [slotKey]: optimized,
      });
    } catch (err) {
      setErrorSlot((prev) => ({ ...prev, [slotKey]: err.message }));
    } finally {
      setCompressingSlot(null);
    }
  };

  const handleRemove = (slotKey) => {
    const updated = { ...documents };
    delete updated[slotKey];
    onChange(updated);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>📁</span> Upload Documents & Photos (Optional)
        </label>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
          ⚡ Auto-Compressed (10-20MB ➔ ~20-60KB)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DOC_SLOTS.map((slot) => {
          const doc = documents[slot.key];
          const isCompressing = compressingSlot === slot.key;
          const error = errorSlot[slot.key];

          return (
            <div
              key={slot.key}
              className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                doc
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>{slot.icon}</span> {slot.label}
                  </span>
                  {doc && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> {doc.sizeKb} KB
                    </span>
                  )}
                </div>

                {doc ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white h-24 flex items-center justify-center my-1.5">
                    {doc.type === 'application/pdf' ? (
                      <div className="flex flex-col items-center gap-1 text-slate-600 p-2">
                        <FileText size={28} className="text-rose-500" />
                        <span className="text-[10px] truncate max-w-[130px] font-mono">{doc.name}</span>
                      </div>
                    ) : (
                      <img
                        src={doc.dataUrl}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreview(doc, slot.label)}
                        className="p-1.5 bg-white text-slate-800 rounded-md hover:bg-slate-100 shadow"
                        title="View Full Document"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(slot.key)}
                        className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow"
                        title="Remove Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-3 my-1.5 flex flex-col items-center justify-center text-center bg-white transition-colors h-24">
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-1 text-indigo-600">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-[10px] font-semibold">Compressing...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-slate-400 mb-1" />
                        <span className="text-[11px] font-medium text-indigo-600 hover:underline">
                          Upload file
                        </span>
                        <span className="text-[9px] text-slate-400">JPG, PNG, PDF</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept={slot.accept}
                      className="hidden"
                      disabled={isCompressing}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot.key, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                {doc && doc.originalSizeKb > doc.sizeKb && (
                  <p className="text-[10px] text-slate-500 truncate">
                    Saved <b className="text-emerald-700">{doc.savedPercent}%</b> (was {doc.originalSizeKb} KB)
                  </p>
                )}
                {error && (
                  <p className="text-[10px] text-rose-600 mt-1 leading-tight">{error}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
