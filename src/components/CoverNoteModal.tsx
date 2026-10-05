import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, X, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CoverNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverNoteText: string;
  applicationRef?: string;
}

export const CoverNoteModal: React.FC<CoverNoteModalProps> = ({
  isOpen,
  onClose,
  coverNoteText,
  applicationRef,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [editableNote, setEditableNote] = useState(coverNoteText);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([editableNote], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Resubmission_Cover_Note_${applicationRef || 'SevaRecover'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-civic-lg border border-civic-border max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-brand-900">
                {t('coverNoteTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{t('coverNoteDesc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-hidden space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Editable Representation Draft (Citing Official Clause)
          </label>
          <textarea
            value={editableNote}
            onChange={(e) => setEditableNote(e.target.value)}
            rows={12}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none leading-relaxed resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <span className="text-[11px] text-slate-500 italic">
            Tip: Edit applicant details above before attaching to your resubmission form.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadTxt}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download .TXT</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('copyButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
