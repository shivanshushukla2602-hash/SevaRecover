import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck2 } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-full max-w-lg lg:max-w-none mx-auto select-none py-2 lg:py-0 flex flex-col justify-center">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-[#22C55E]/15 via-[#22C55E]/8 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative rounded-3xl border border-[rgba(34,197,94,0.25)] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.45)] group h-full min-h-[380px] lg:min-h-[460px] flex flex-col bg-[#141416]"
      >
        {/* Relevant Civic Public Services & Application Resolution Image */}
        <div className="relative w-full h-full flex-1 overflow-hidden bg-[#141416]">
          <img
            src="/hero-recovery-civic.jpg"
            alt="Official Indian citizen public service application documents, verified resolution portal, and smart card"
            className="w-full h-full object-cover object-center filter saturate-[0.78] contrast-[1.02] brightness-[0.98] transition-all duration-300 group-hover:scale-[1.015]"
            onError={(e) => {
              e.currentTarget.src = '/hero-rejected-document.jpg';
            }}
          />

          {/* Dark Mode Ambient Shading - Only active in dark mode so light mode stays clean & bright */}
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/80 via-transparent to-[#0A0A0B]/30 pointer-events-none" />
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/50 via-transparent to-[#0A0A0B]/30 pointer-events-none" />

          {/* Floating Civic Trust Badge (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141416]/90 backdrop-blur-md border border-[rgba(34,197,94,0.3)] shadow-lg text-xs text-[#F2F1EC]">
            <div className="w-6 h-6 rounded-lg bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[11px] block leading-tight text-[#F2F1EC]">Evidence-Backed Action Plan</span>
              <span className="text-[10px] text-[#A8ABB3]">Authoritative guidelines matched via OpenSearch</span>
            </div>
          </div>

          {/* Top-Right Resolution Status Badge */}
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416]/90 backdrop-blur-md border border-[rgba(34,197,94,0.3)] shadow-md text-[11px] text-[#22C55E] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resolution Verified</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
