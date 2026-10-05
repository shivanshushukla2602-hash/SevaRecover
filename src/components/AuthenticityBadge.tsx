import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { AuthenticityFlag } from '../types';

interface AuthenticityBadgeProps {
  flag: AuthenticityFlag;
  reason: string;
}

export const AuthenticityBadge: React.FC<AuthenticityBadgeProps> = ({ flag, reason }) => {
  if (flag === 'verified_format') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-emerald-900 text-sm">Official Notice Authenticity Verified</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200 text-emerald-900">
              Authentic Format
            </span>
          </div>
          <p className="text-emerald-800 leading-relaxed">{reason}</p>
        </div>
      </div>
    );
  }

  if (flag === 'suspicious') {
    return (
      <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-rose-900 text-sm">Warning: Suspicious Rejection Notice</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-200 text-rose-900">
              Potential Scam
            </span>
          </div>
          <p className="text-rose-800 leading-relaxed">{reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <HelpCircle className="w-5 h-5" />
      </div>
      <div className="space-y-0.5 text-xs">
        <span className="font-heading font-bold text-slate-800 text-sm block">Unverified Notice Format</span>
        <p className="text-slate-600 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
};
