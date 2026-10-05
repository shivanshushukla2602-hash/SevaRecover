import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Search, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface AnalysisExperiencePageProps {
  onComplete: () => void;
}

interface PipelineStage {
  id: number;
  name: string;
  subtext: string;
  icon: React.ElementType;
}

export const AnalysisExperiencePage: React.FC<AnalysisExperiencePageProps> = ({ onComplete }) => {
  const [activeStage, setActiveStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [docCount, setDocCount] = useState(1);

  const stages: PipelineStage[] = [
    { id: 1, name: 'Receiving Information', subtext: 'Ingesting rejection document & text payload', icon: FileText },
    { id: 2, name: 'Verifying Notice Authenticity', subtext: 'Checking letterhead & scam safety signature', icon: ShieldCheck },
    { id: 3, name: 'Searching Authoritative KB', subtext: 'Querying Amazon OpenSearch vector domain', icon: Search },
    { id: 4, name: 'Comparing Requirements', subtext: 'Extracting submitted claim vs gazette rule', icon: Layers },
    { id: 5, name: 'Classifying Failure Code', subtext: 'Categorizing under official error schemas', icon: Cpu },
    { id: 6, name: 'Finding Recovery Path', subtext: 'Retrieving documented rectification circulars', icon: CheckCircle2 },
    { id: 7, name: 'Preparing Action Plan', subtext: 'Auto-drafting cover note & evidence packet', icon: Sparkles },
  ];

  // Document Ticker during OpenSearch retrieval
  useEffect(() => {
    if (activeStage === 3) {
      const interval = setInterval(() => {
        setDocCount((c) => (c < 14 ? c + 2 : 14));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeStage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < 7) {
          setCompletedStages((c) => [...c, prev]);
          return prev + 1;
        } else {
          setCompletedStages([1, 2, 3, 4, 5, 6, 7]);
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 800);
          return 7;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-10 text-[#F2F1EC]">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold animate-pulse">
          <Cpu className="w-4 h-4 text-brand-600" />
          <span>AWS Strands Agents SDK Orchestration Pipeline Active</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-brand-900">
          Analyzing Failure Information
        </h1>
        <p className="text-xs sm:text-sm text-civic-textMuted max-w-md mx-auto">
          Searching Amazon OpenSearch domain for gazette guidelines and matching against official government circulars.
        </p>
      </div>

      {/* Centerpiece Multi-Stage Animated Pipeline */}
      <div className="bg-white rounded-3xl border border-civic-border p-8 shadow-civic-lg space-y-6 relative overflow-hidden">
        
        {/* Active Stage Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4">
          {stages.map((stage) => {
            const isActive = activeStage === stage.id;
            const isDone = completedStages.includes(stage.id);
            const IconComp = stage.icon;

            return (
              <div key={stage.id} className="relative">
                
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    backgroundColor: isActive ? '#F0F3FF' : isDone ? '#F8FAFC' : '#FFFFFF',
                    borderColor: isActive ? '#6366F1' : isDone ? '#CBD5E1' : '#E2E8F0',
                  }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border p-4 flex items-center justify-between shadow-civic-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    
                    {/* Stage Circle with Icon / Checkmark Trail */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isActive
                          ? 'bg-brand-600 text-white shadow-md ring-4 ring-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <IconComp className="w-5 h-5" />}
                    </div>

                    {/* Stage Name & Subtext */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-heading font-bold text-sm ${isActive ? 'text-brand-900' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {stage.name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-200 text-brand-900 animate-pulse">
                            Processing
                          </span>
                        )}
                      </div>
                      
                      {/* Subtext + Live Ticking Document Counter */}
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{stage.subtext}</span>
                        {stage.id === 3 && isActive && (
                          <span className="font-mono text-brand-700 font-bold bg-brand-100 px-1.5 py-0.5 rounded text-[10px]">
                            Scanning {docCount} gazette docs...
                          </span>
                        )}
                      </p>
                    </div>

                  </div>

                  {/* Right Status Indicator */}
                  <div>
                    {isDone && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                    {isActive && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                        <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                </motion.div>

                {/* Connecting Line between stages */}
                {stage.id < 7 && (
                  <div className={`w-0.5 h-3 mx-9 my-0.5 transition-colors ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}

              </div>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Overall Progress</span>
            <span>{Math.round((activeStage / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-brand-600 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeStage / 7) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
