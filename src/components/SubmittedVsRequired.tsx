import React, { useState } from 'react';
import { FileText, CheckCircle2, XCircle, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SubmittedVsRequiredProps {
  submittedValue: string;
  requiredValue: string;
  requirementTitle: string;
}

export const SubmittedVsRequired: React.FC<SubmittedVsRequiredProps> = ({
  submittedValue,
  requiredValue,
  requirementTitle,
}) => {
  const { t } = useLanguage();
  const [highlighted, setHighlighted] = useState<boolean>(false);

  // Split string highlights for date or value keywords
  const renderHighlightedSubmitted = () => {
    if (!highlighted) return submittedValue;
    return (
      <span>
        Submitted Date:{' '}
        <mark className="bg-rose-200 text-rose-950 font-bold px-1 rounded animate-pulse">
          12-03-2023 (AY 2023-24 Income Proof)
        </mark>
      </span>
    );
  };

  const renderHighlightedRequired = () => {
    if (!highlighted) return requiredValue;
    return (
      <span>
        Required Date:{' '}
        <mark className="bg-emerald-200 text-emerald-950 font-bold px-1 rounded animate-pulse">
          &gt;= 01-04-2024 (AY 2025-26 Valid Proof)
        </mark>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-civic-border p-5 shadow-civic-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-brand-900">
              {t('submittedVsRequiredTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">{requirementTitle}</p>
          </div>
        </div>
        <button
          onClick={() => setHighlighted(!highlighted)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
            highlighted ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{highlighted ? 'Diff Highlighting Active' : 'Toggle Diff Highlight'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: What citizen submitted */}
        <div
          onClick={() => setHighlighted(true)}
          className="bg-rose-50/70 rounded-xl border border-rose-200/80 p-4 space-y-2 cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{t('submittedLabel')}</span>
          </div>
          <div className="bg-white rounded-lg p-3 text-xs font-medium text-slate-800 border border-rose-100 shadow-sm leading-relaxed">
            <FileText className="w-4 h-4 text-rose-400 inline mr-1.5 -mt-0.5" />
            {renderHighlightedSubmitted()}
          </div>
        </div>

        {/* Right Column: What official rule requires */}
        <div
          onClick={() => setHighlighted(true)}
          className="bg-emerald-50/70 rounded-xl border border-emerald-200/80 p-4 space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('requiredLabel')}</span>
          </div>
          <div className="bg-white rounded-lg p-3 text-xs font-medium text-slate-800 border border-emerald-100 shadow-sm leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1.5 -mt-0.5" />
            {renderHighlightedRequired()}
          </div>
        </div>
      </div>
    </div>
  );
};
