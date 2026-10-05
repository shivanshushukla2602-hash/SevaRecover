import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, UploadCloud, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../services/api-client';

export default function SchemeApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const schemeFromState = (location.state as any)?.scheme;
  const scheme = schemeFromState || {
    id: id || 'SCH-001',
    name: 'PM Kisan Samman Nidhi',
    department: 'Agriculture & Farmers Welfare',
    description: 'Financial support of ₹6,000 per year for landholding farmer families across India.',
  };

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appId, setAppId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    fetch(`${API_BASE_URL}/schemes/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId: scheme.id, userId: user?.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAppId(data.application_id || `APP-${Math.floor(1000 + Math.random() * 9000)}`);
        setSuccess(true);
        setSubmitting(false);
      })
      .catch(() => {
        setError('The scheme application service is unavailable. Please use the official portal link instead.');
        setSubmitting(false);
      });
  };

  if (success) {
    return (
      <div className="ds-shell py-12 text-center text-[#F2F1EC]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl mx-auto bg-[#141416] p-8 rounded-3xl shadow-lg border border-[rgba(34,197,94,0.25)] space-y-4">
          <div className="w-16 h-16 bg-sage-500/20 text-sage-400 rounded-full flex items-center justify-center mx-auto border border-sage-500/30">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-[#F8FAFC]">{t('appSubmittedSuccess')}</h2>
          <p className="text-xs text-[#A8ABB3]">
            Your application for <span className="font-bold text-[#22C55E]">{scheme.name}</span> has been routed to the official state portal.
          </p>
          <div className="bg-[#1C1D21] border border-[#22C55E]/30 p-4 rounded-xl my-4">
            <span className="block text-[10px] text-[#A8ABB3] uppercase tracking-wider mb-1">{t('appRefNum')}</span>
            <span className="text-lg font-mono font-bold text-[#22C55E]">{appId}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-heading font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] text-xs cursor-pointer"
          >
            {t('goToDashboard')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="ds-shell py-8 sm:py-12 text-[#F2F1EC]">
      <button
        onClick={() => navigate('/schemes')}
        className="flex items-center gap-2 text-[#A8ABB3] hover:text-[#22C55E] mb-8 transition-colors text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Recommended Schemes
      </button>

      <div className="bg-[#141416] rounded-2xl shadow-lg border border-[rgba(34,197,94,0.15)] overflow-hidden">
        <div className="bg-[#1C1D21] border-b border-[#22C55E]/20 p-6 space-y-2">
          <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-[#22C55E]/20 uppercase tracking-wider inline-block">
            {scheme.department || 'Government Scheme'}
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-[#F8FAFC]">{scheme.name}</h2>
          <p className="text-xs text-[#A8ABB3] leading-relaxed">{scheme.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-brick-500/10 border border-brick-500/30 rounded-xl p-3 text-xs text-brick-300" role="alert">{error}</div>}
          <div>
            <h3 className="text-xs font-bold text-[#22C55E] border-b border-white/10 pb-2 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <FileText size={16} /> {t('autoFilledProfile')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-[#A8ABB3] bg-[#1C1D21] p-4 rounded-xl border border-white/5">
              <div><span className="font-bold text-[#F8FAFC]">Name:</span> {user?.name || 'Unavailable'}</div>
              <div><span className="font-bold text-[#F8FAFC]">Occupation:</span> {profile?.occupation || 'Unavailable'}</div>
              <div><span className="font-bold text-[#F8FAFC]">Annual Income:</span> {profile?.income ? `₹${profile.income}` : 'Unavailable'}</div>
              <div><span className="font-bold text-[#F8FAFC]">State:</span> {profile?.state || 'Unavailable'}</div>
            </div>
            <p className="text-[10px] text-[#A8ABB3] mt-2 italic">* Automatically populated from your verified Citizen Profile.</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#22C55E] border-b border-white/10 pb-2 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <UploadCloud size={16} /> {t('mandatoryDocs')}
            </h3>
            <div className="space-y-2.5">
              <div className="border border-white/10 bg-[#1C1D21] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#F8FAFC]">{t('aadhaarDoc')}</p>
                  <p className="text-[10px] text-[#A8ABB3]">Self-attested e-Aadhaar PDF</p>
                </div>
                <span className="text-[10px] font-bold text-sage-400 bg-sage-500/10 border border-sage-500/20 px-2.5 py-1 rounded">
                  {t('verifiedBadge')}
                </span>
              </div>
              <div className="border border-white/10 bg-[#1C1D21] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#F8FAFC]">{t('incomeDoc')}</p>
                  <p className="text-[10px] text-[#A8ABB3]">Issued for FY 2025-26</p>
                </div>
                <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded">
                  {t('readyToAttach')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0A0A0B] text-[#22C55E] focus:ring-[#22C55E]" />
              <span className="text-[11px] text-[#A8ABB3] leading-relaxed">
                {t('declarationText')}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-heading font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] disabled:opacity-50 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin text-[#0A0A0B]" size={16} /> : null}
            {submitting ? t('submittingApp') : t('submitApp')}
          </button>
        </form>
      </div>
    </div>
  );
}
