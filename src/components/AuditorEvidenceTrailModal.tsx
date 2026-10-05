import React, { useEffect } from 'react';
import { Eye, ShieldAlert, CheckCircle2, Code2, Database, KeyRound, X } from 'lucide-react';
import { ReasoningStep } from '../types';

interface AuditorEvidenceTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasoningTrail: ReasoningStep[];
  serviceName: string;
}

export const AuditorEvidenceTrailModal: React.FC<AuditorEvidenceTrailModalProps> = ({
  isOpen,
  onClose,
  reasoningTrail,
  serviceName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#141416] text-[#F2F1EC] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.25)] max-w-4xl w-full p-6 space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(34,197,94,0.15)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-[#F2F1EC]">
                  Cedar Auditor Reasoning & Evidence Replay
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  Role: AUDITOR
                </span>
              </div>
              <p className="text-xs text-[#A8ABB3] font-mono mt-0.5">
                Target Service: {serviceName}
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

        {/* Responsible AI Audit Badge */}
        <div className="bg-[#1C1C1F] border border-[rgba(34,197,94,0.15)] rounded-xl p-3 flex items-center gap-3 text-xs text-[#A8ABB3]">
          <ShieldAlert className="w-5 h-5 text-[#22C55E] shrink-0" />
          <p className="leading-relaxed">
            This replay log provides deterministic, step-by-step auditability for civic trust verification. Every prompt payload, OpenSearch retrieval ID, and Cedar RBAC rule execution is preserved.
          </p>
        </div>

        {/* Steps Traversal */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {reasoningTrail.map((step) => (
            <div
              key={step.stage}
              className="bg-[#0A0A0B] border border-[rgba(34,197,94,0.15)] rounded-xl p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#22C55E] text-[#0A0A0B] font-extrabold text-xs flex items-center justify-center">
                    {step.stage}
                  </span>
                  <span className="font-heading font-bold text-sm text-[#F2F1EC]">{step.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#A8ABB3]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7A9B7E]" />
                  <span>{step.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-[#A8ABB3] leading-relaxed font-sans">{step.details}</p>

              {/* Technical Traces */}
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                {step.strandsAgentLog && (
                  <div className="bg-[#141416] p-2.5 rounded-lg border border-[#22C55E]/20 text-[#22C55E] flex items-start gap-2">
                    <Code2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <div className="overflow-x-auto">
                      <span className="text-[#9A9A9E] font-bold block text-[10px]">AWS STRANDS AGENT LOG</span>
                      <code>{step.strandsAgentLog}</code>
                    </div>
                  </div>
                )}

                {step.opensearchQuery && (
                  <div className="bg-[#141416] p-2.5 rounded-lg border border-[#7A9B7E]/30 text-[#7A9B7E] flex items-start gap-2">
                    <Database className="w-4 h-4 text-[#7A9B7E] shrink-0 mt-0.5" />
                    <div className="overflow-x-auto">
                      <span className="text-[#9A9A9E] font-bold block text-[10px]">AMAZON OPENSEARCH RAG QUERY</span>
                      <code>{step.opensearchQuery}</code>
                    </div>
                  </div>
                )}

                {step.cedarPolicyDecision && (
                  <div className="bg-[#141416] p-2.5 rounded-lg border border-[#D9A74A]/30 text-[#D9A74A] flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-[#D9A74A] shrink-0 mt-0.5" />
                    <div className="overflow-x-auto">
                      <span className="text-[#9A9A9E] font-bold block text-[10px]">CEDAR AUTHORIZATION DECISION</span>
                      <code>{step.cedarPolicyDecision}</code>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(34,197,94,0.15)] pt-3 flex items-center justify-between text-xs text-[#A8ABB3]">
          <span className="font-mono text-[11px]">Audit Hash: 0x8f9a2b7c4d1e3f6a</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-bold text-xs shadow-[0_0_15px_rgba(34,197,94,0.25)] transition-colors"
          >
            Close Audit Replay
          </button>
        </div>

      </div>
    </div>
  );
};
