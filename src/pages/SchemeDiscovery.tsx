import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Wallet, GraduationCap, HeartPulse, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getEligibleSchemes, EligibleScheme } from '../services/api-client';

export default function SchemeDiscovery() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState<EligibleScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getEligibleSchemes(profile)
      .then((data) => {
        if (isMounted) {
          setSchemes(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch eligible schemes:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load eligible schemes. Please retry.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [profile]);

  const getIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('kisan') || nameLower.includes('agri') || nameLower.includes('fasal')) {
      return <Wallet className="text-[#22C55E] w-6 h-6" />;
    }
    if (nameLower.includes('scholarship') || nameLower.includes('edu') || nameLower.includes('vidya')) {
      return <GraduationCap className="text-[#22C55E] w-6 h-6" />;
    }
    if (nameLower.includes('ayushman') || nameLower.includes('health') || nameLower.includes('bima')) {
      return <HeartPulse className="text-[#22C55E] w-6 h-6" />;
    }
    return <CheckCircle2 className="text-[#22C55E] w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="ds-shell py-20 text-center text-[#A8ABB3] space-y-3">
        <div className="w-10 h-10 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Scanning Amazon OpenSearch & state gazette databases for eligible schemes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="ds-shell py-20 text-center text-red-300" role="alert">{error}</div>;
  }

  return (
    <div className="ds-shell py-8 sm:py-12 text-[#F2F1EC]">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416] border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          <span>{t('matchedProfile')} {profile?.occupation || 'Farmer'} • {profile?.state || 'Maharashtra'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#F2F1EC]">
          {t('schemesTitle')} <span className="gold-text">{t('schemesTitleGold')}</span>
        </h2>
        <p className="text-[#9A9A9E] text-sm max-w-2xl">
          {t('schemesSub')}
        </p>
      </div>

      {schemes.length === 0 ? (
        <div className="bg-[#141416] p-10 rounded-2xl border border-[rgba(34,197,94,0.2)] text-center shadow-lg space-y-4">
          <p className="text-[#A8ABB3] text-sm">{t('noSchemesMatch')}</p>
          <button
            onClick={() => navigate('/profile')}
            className="text-[#22C55E] font-bold hover:underline text-xs cursor-pointer"
          >
            {t('updateProfilePref')}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {schemes.map((scheme, i) => (
            <motion.div
              key={scheme.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_24px_rgba(34,197,94,0.2)] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#22C55E]/30 group-hover:scale-105 transition-transform">
                    {getIcon(scheme.name)}
                  </div>
                  <span className="bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#22C55E]/30 uppercase tracking-wider">
                    {t('eligibleBenefitTag')}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-heading font-bold text-[#F2F1EC] group-hover:text-[#22C55E] transition-colors mb-1">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-[#9A9A9E] leading-relaxed">{scheme.description}</p>
                </div>

                <div className="bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] p-3.5 rounded-xl">
                  <span className="text-[10px] text-[#22C55E] font-extrabold uppercase tracking-wider block mb-0.5">
                    {t('benefitAllocation')}
                  </span>
                  <span className="text-xs font-bold text-[#F2F1EC]">{scheme.benefits}</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[rgba(34,197,94,0.15)]">
                <button
                  type="button"
                  onClick={() => {
                    if (scheme.url) {
                      window.open(scheme.url, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/schemes/${scheme.id}/apply`, { state: { scheme } });
                    }
                  }}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-heading font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span>{t('applyOfficialPortal')}</span>
                  {scheme.url ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
