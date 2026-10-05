import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

interface StatBreakdownModalProps {
  type: 'applications' | 'pathways';
  onClose: () => void;
  onNavigateToAnalyze?: () => void;
}

export const StatBreakdownModal: React.FC<StatBreakdownModalProps> = ({
  type,
  onClose,
  onNavigateToAnalyze = () => {},
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const applicationBreakdown = [
    { domain: 'Scholarships & Education Grants', count: 541, pct: 42.1, color: 'bg-[#22C55E]' },
    { domain: 'Farmer Schemes & PM-KISAN DBT', count: 412, pct: 32.1, color: 'bg-[#7A9B7E]' },
    { domain: 'Public Certificates & Revenue Records', count: 331, pct: 25.8, color: 'bg-[#A8ABB3]' },
  ];

  const pathwaysList = [
    {
      title: 'Expired Income Certificate Re-verification Pathway',
      domain: 'Scholarships',
      successRate: '92.4%',
      avgDays: '3.2 days',
      clause: 'SSP Gazette 2024 Clause 4.2',
    },
    {
      title: 'PM-KISAN Land Record Initial Mismatch Pathway',
      domain: 'Farmer Schemes',
      successRate: '88.9%',
      avgDays: '4.5 days',
      clause: 'PM-KISAN Operational Guidelines Sec 7.1',
    },
    {
      title: 'Unverified Lekhpal Field Report Re-attestation',
      domain: 'Certificates',
      successRate: '89.7%',
      avgDays: '2.8 days',
      clause: 'Revenue Dept Circular RD-2023-109',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.25)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(34,197,94,0.2)] max-w-xl w-full space-y-6 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                type === 'applications' ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'bg-[#7A9B7E]/10 border-[#7A9B7E]/30 text-[#7A9B7E]'
              }`}
            >
              {type === 'applications' ? <Cpu className="w-5 h-5 text-[#22C55E]" /> : <CheckCircle2 className="w-5 h-5 text-[#7A9B7E]" />}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#F2F1EC]">
                {type === 'applications'
                  ? 'Demonstration Data: 1,284 Applications Breakdown'
                  : 'Demonstration Data: 1,160 Documented Pathways'}
              </h3>
              <p className="text-xs text-[#9A9A9E]">
                {type === 'applications'
                  ? 'Distribution across active digital public service domains'
                  : 'Verified recovery resolution pathways in OpenSearch domain'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8ABB3] hover:text-[#F2F1EC] hover:bg-[#1C1C1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {type === 'applications' ? (
          <div className="space-y-4">
            <div className="bg-[#1C1C1F] p-4 rounded-xl border border-[rgba(34,197,94,0.15)] space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A8ABB3] block">
                Domain Distribution Ratio
              </span>
              <div className="h-3 w-full bg-[#0A0A0B] rounded-full flex overflow-hidden">
                <div className="bg-[#22C55E] h-full w-[42.1%]" title="Scholarships: 42.1%" />
                <div className="bg-[#7A9B7E] h-full w-[32.1%]" title="Farmer Schemes: 32.1%" />
                <div className="bg-[#A8ABB3] h-full w-[25.8%]" title="Certificates: 25.8%" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 font-semibold">
                <div className="flex items-center gap-1.5 text-[#22C55E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                  <span>Scholarships (42%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#7A9B7E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A9B7E] inline-block" />
                  <span>Farmer (32%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A8ABB3]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A8ABB3] inline-block" />
                  <span>Certificates (26%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {applicationBreakdown.map((item) => (
                <div
                  key={item.domain}
                  className="bg-[#1C1C1F] p-3 rounded-xl border border-[rgba(34,197,94,0.15)] flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-[#F2F1EC]">{item.domain}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#A8ABB3]">{item.count} applications</span>
                    <span className="text-[10px] font-extrabold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded">
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pathwaysList.map((path) => (
              <div
                key={path.title}
                className="bg-[#1C1C1F] p-3.5 rounded-xl border border-[rgba(34,197,94,0.15)] shadow-civic-sm space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase bg-[#7A9B7E]/15 text-[#7A9B7E] border border-[#7A9B7E]/30 px-2 py-0.5 rounded-md">
                    {path.domain}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#22C55E]">
                    {path.successRate} Success • {path.avgDays}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-[#F2F1EC]">{path.title}</h4>
                <p className="font-mono text-[10px] text-[#9A9A9E]">Source: {path.clause}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-2 border-t border-[rgba(34,197,94,0.15)] flex items-center justify-between">
          <span className="text-[11px] text-[#A8ABB3] font-mono">OpenSearch Analytics Index</span>
          <button
            onClick={() => {
              onClose();
              onNavigateToAnalyze();
            }}
            className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-heading font-bold text-xs shadow-[0_0_15px_rgba(34,197,94,0.25)] flex items-center gap-1.5 transition-colors"
          >
            <span>Analyze Your Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
