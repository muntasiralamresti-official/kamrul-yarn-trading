import React from 'react';
import { X, Download, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

export const DocumentPreviewModal = ({ doc, title, onClose }) => {
  if (!doc) return null;

  const isPdf = doc.type === 'application/pdf' || doc.dataUrl?.startsWith('data:application/pdf');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name || `${title || 'document'}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    const win = window.open();
    if (win) {
      if (isPdf) {
        win.document.write(
          `<iframe src="${doc.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        win.document.write(`<img src="${doc.dataUrl}" style="max-width:100%; height:auto; margin:auto; display:block;" />`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              {title || doc.name || 'Document Preview'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Optimized: <b className="text-emerald-700">{doc.sizeKb || '~'} KB</b></span>
              {doc.originalSizeKb > doc.sizeKb && (
                <>
                  <span>•</span>
                  <span>Original: <del className="text-slate-400">{doc.originalSizeKb} KB</del></span>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                    <CheckCircle2 size={11} /> {doc.savedPercent}% saved
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink size={16} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Download file"
            >
              <Download size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/5 min-h-[300px]">
          {isPdf ? (
            <iframe
              src={doc.dataUrl}
              title={doc.name}
              className="w-full h-[65vh] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <img
              src={doc.dataUrl}
              alt={doc.name || 'Preview'}
              className="max-h-[65vh] max-w-full rounded-lg shadow-sm object-contain border border-slate-200 bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-md">{doc.name || 'document'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
