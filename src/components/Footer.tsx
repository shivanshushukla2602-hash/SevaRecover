import React, { useState } from 'react';
import { ShieldCheck, Info, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [showFullTrust, setShowFullTrust] = useState(false);
  const [showFullTech, setShowFullTech] = useState(false);

  return (
    <footer className="bg-[#0A0A0B] text-[#A8ABB3] border-t border-[rgba(34,197,94,0.2)] mt-auto font-body">
      <div className="ds-shell py-12">
        {/* Cohesive 3-Column Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-10 border-b border-[rgba(34,197,94,0.15)]">
          
          {/* Column 1: SevaRecover Overview & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#141416] border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-lg gold-text">
                {t('appName')}
              </span>
            </div>
            
            <p className="text-xs text-[#A8ABB3] leading-relaxed">
              {t('footerBrandDesc')}
            </p>

            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#22C55E]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 font-bold">
                {t('openCivicTech')}
              </span>
              <span>&bull;</span>
              <span className="text-[#A8ABB3]">{t('digitalIndiaAI')}</span>
            </div>
          </div>

          {/* Column 2: Civic Trust Statement & Non-Affiliation */}
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-[rgba(34,197,94,0.12)] pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#22C55E]" />
              <span>{t('footerTrustTitle')}</span>
            </div>
            
            <p className="text-xs text-[#A8ABB3] leading-relaxed">
              {t('footerTrustText')}
            </p>

            {showFullTrust && (
              <p className="text-xs text-[#E2E8F0] leading-relaxed bg-[#141416] p-3 rounded-xl border border-white/10 mt-2 font-medium">
                {t('fullDisclaimerText')}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowFullTrust(!showFullTrust)}
              className="cursor-pointer text-[11px] font-bold text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 transition-colors pt-1"
            >
              <span>{showFullTrust ? t('showLess') : t('readFullDisclaimer')}</span>
              {showFullTrust ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Column 3: AWS Build It Technology Architecture */}
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-[rgba(34,197,94,0.12)] pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2 text-[#F2F1EC] text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-[#22C55E]" />
              <span>{t('footerTechTitle')}</span>
            </div>
            
            <p className="text-xs text-[#A8ABB3] leading-relaxed">
              {t('footerTechText')}
            </p>

            {showFullTech && (
              <div className="text-[11px] text-[#E2E8F0] leading-relaxed bg-[#141416] p-3 rounded-xl border border-white/10 mt-2 font-mono space-y-1">
                <p>{t('techDetailsText1')}</p>
                <p>{t('techDetailsText2')}</p>
                <p>{t('techDetailsText3')}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowFullTech(!showFullTech)}
              className="cursor-pointer text-[11px] font-bold text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 transition-colors pt-1"
            >
              <span>{showFullTech ? t('showLess') : t('readArchitectureDetails')}</span>
              {showFullTech ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

        </div>

        {/* Bottom Copyright & Telemetry Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B6B70] gap-4">
          <p>{t('footerCopyright')}</p>
          <div className="flex items-center gap-4 font-mono text-[#9A9A9E]">
            <span className="text-[#22C55E] font-bold">AWS Strands Agents SDK</span>
            <span>&bull;</span>
            <span className="text-[#22C55E] font-bold">Amazon OpenSearch RAG</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-bold">Cedar Authorization</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
