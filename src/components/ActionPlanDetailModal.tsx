import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileMinus,
  Sparkles,
  FileX,
  FileCheck,
  UploadCloud,
  Building2,
  FileSignature,
  FileWarning,
  ShieldAlert,
  GraduationCap,
  Tractor,
  Award,
  ListFilter,
  SlidersHorizontal,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import { FailureAnalysis } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ActionPlanDetailModalProps {
  analysis: FailureAnalysis;
  onClose: () => void;
  onNewAnalysis?: () => void;
}

export const ActionPlanDetailModal: React.FC<ActionPlanDetailModalProps> = ({
  analysis,
  onClose,
  onNewAnalysis,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [showFullClause, setShowFullClause] = useState<boolean>(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'FOCUSED_STEPPER'>('LIST');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showCoverNoteModal, setShowCoverNoteModal] = useState<boolean>(false);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleCopyCoverNote = () => {
    if (analysis.resubmissionCoverNote) {
      navigator.clipboard.writeText(analysis.resubmissionCoverNote);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  const checklist = analysis.actionChecklist || [];
  const totalSteps = checklist.length || 2;
  const progressPct = Math.round((completedSteps.length / totalSteps) * 100);

  // Confidence gauge theme (80%+ green)
  const getConfidenceTheme = () => {
    let score = 90;
    if (analysis.confidence === 'medium') score = 70;
    if (analysis.confidence === 'low') score = 45;

    if (score >= 80) {
      return {
        score,
        stroke: '#22C55E',
        trackStroke: 'rgba(16, 185, 129, 0.15)',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        label: 'High Confidence',
        Icon: CheckCircle2,
      };
    } else if (score >= 50) {
      return {
        score,
        stroke: '#22C55E',
        trackStroke: 'rgba(245, 158, 11, 0.15)',
        text: 'text-amber-400',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        label: 'Medium Confidence',
        Icon: AlertCircle,
      };
    } else {
      return {
        score,
        stroke: '#EF4444',
        trackStroke: 'rgba(239, 68, 68, 0.15)',
        text: 'text-rose-400',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        label: 'Low Confidence',
        Icon: AlertTriangle,
      };
    }
  };

  const confTheme = getConfidenceTheme();

  const gaugeData = [
    { value: confTheme.score, fill: confTheme.stroke },
    { value: 100 - confTheme.score, fill: confTheme.trackStroke },
  ];

  const getDomainGraphic = () => {
    if (analysis.domain === 'farmer') return <Tractor className="w-6 h-6 text-[#22C55E]" />;
    if (analysis.domain === 'certificate') return <Award className="w-6 h-6 text-[#22C55E]" />;
    return <GraduationCap className="w-6 h-6 text-[#22C55E]" />;
  };

  const getFailureIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT_MISSING':
        return <FileWarning className="w-3.5 h-3.5 text-red-400" />;
      case 'DATA_MISMATCH':
        return <FileX className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  const getStepIcon = (index: number, action: any) => {
    if (action.locationType === 'ONLINE') return <UploadCloud className="w-4 h-4 text-[#22C55E]" />;
    if (index === 0) return <FileSignature className="w-4 h-4 text-[#22C55E]" />;
    return <Building2 className="w-4 h-4 text-[#22C55E]" />;
  };

  const documentsList = [
    {
      name: 'Income Certificate (FY 2025-26)',
      status: 'Missing',
      statusType: 'missing',
      IconComp: FileX,
    },
    {
      name: 'College Fee Receipt & Identity Card',
      status: 'In Possession',
      statusType: 'have',
      IconComp: FileCheck,
    },
    {
      name: 'e-Attestation Officer Verification Slip',
      status: 'Required',
      statusType: 'required',
      IconComp: FileText,
    },
    {
      name: 'Aadhaar Endorsement Record',
      status: 'Verified',
      statusType: 'have',
      IconComp: FileCheck,
    },
  ];

  const fullGazetteClause = `Income certificates submitted for post-matric fee reimbursement must be issued on or after April 1 of the current financial year (FY 2024-25). Certificates issued prior to April 1 of the preceding year are deemed invalid for scholarship disbursal under Section 4.2 of the Maharashtra State Higher Education Gazette Notification No. 884-C.`;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn font-body"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="bg-[#141416] rounded-3xl border border-[rgba(34,197,94,0.25)] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(34,197,94,0.2)] max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh] relative text-[#F2F1EC]"
      >
        {/* Header Bar with Header Visual Emblem */}
        <div className="p-6 bg-[#0A0A0B] text-[#F2F1EC] border-b border-[rgba(34,197,94,0.15)] relative flex-shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-[#A8ABB3] font-medium">
              <span>My Analyses</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#22C55E]/60" />
              <span className="text-[#A8ABB3] capitalize">{analysis.domain}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#22C55E]/60" />
              <span className="text-[#4ADE80] font-bold">{analysis.serviceName}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A8ABB3] hover:text-[#F2F1EC] hover:bg-[#1C1C1F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 max-w-2xl">
              {/* Header Visual Graphic Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-[#22C55E]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                {getDomainGraphic()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                    {getFailureIcon(analysis.failureType)}
                    {analysis.failureType}
                  </span>
                  <span className="text-xs text-[#9A9A9E] font-mono">
                    Ref: {analysis.applicationReference || 'MAH-NMS-2026-884102'}
                  </span>
                </div>

                <h2 className="text-2xl font-heading font-extrabold text-[#F2F1EC]">
                  {analysis.serviceName}
                </h2>
              </div>
            </div>

            {/* OpenSearch RAG Confidence Badge (Green 90%) */}
            <div className={`flex items-center gap-3 p-3 rounded-2xl border shrink-0 ${confTheme.badge}`}>
              <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                <PieChart width={48} height={48}>
                  <Pie
                    data={gaugeData}
                    dataKey="value"
                    cx={24}
                    cy={24}
                    innerRadius={14}
                    outerRadius={22}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
                <div className={`absolute inset-0 flex items-center justify-center font-heading font-extrabold text-xs ${confTheme.text}`}>
                  {confTheme.score}%
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8ABB3] block">
                  OpenSearch RAG
                </span>
                <span className={`text-xs font-bold flex items-center gap-1 ${confTheme.text}`}>
                  <confTheme.Icon className="w-3.5 h-3.5" /> {confTheme.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: Collapsed Diagnosis & Gazette Rule Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0A0A0B] rounded-2xl border border-[rgba(34,197,94,0.2)] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#22C55E]" />
                <h3 className="font-heading font-bold text-sm text-[#F2F1EC]">
                  Diagnosis Summary
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowFullClause(!showFullClause)}
                className="text-xs font-bold text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1.5 cursor-pointer bg-[#141416] px-3 py-1.5 rounded-xl border border-[#22C55E]/30 transition-all shadow-sm"
              >
                <Eye size={13} />
                <span>{showFullClause ? 'Hide Gazette Clause' : 'View Retrieved Gazette Clause'}</span>
                {showFullClause ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <p className="text-xs text-[#A8ABB3] leading-relaxed font-medium">
              {analysis.whyFailedPlainLanguage?.en ||
                'Missing 12th semester marksheet endorsement from College Principal.'}
            </p>

            {/* Smooth Collapsible Gazette Rule Clause */}
            <AnimatePresence>
              {showFullClause && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#141416] text-[#F2F1EC] p-4 rounded-xl border border-[rgba(34,197,94,0.25)] text-xs font-mono border-l-4 border-l-[#22C55E] mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#A8ABB3] font-bold uppercase">
                      <span>Retrieved Official Gazette Clause</span>
                      <span className="text-[#16A34A] dark:text-[#4ADE80] font-bold">SSP Gazette Section 4.2</span>
                    </div>
                    <p className="text-[#16A34A] dark:text-[#4ADE80] leading-relaxed">
                      &quot;{fullGazetteClause}&quot;
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Section 2: Step-by-Step Recovery Pathway (With Stepper View Toggle) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#22C55E]" />
                  Step-by-Step Recovery Pathway
                </h3>
              </div>

              {/* Progress & View Mode Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[rgba(34,197,94,0.2)] text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('LIST')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      viewMode === 'LIST' ? 'bg-[#22C55E] text-[#052E16]' : 'text-[#A8ABB3] hover:text-[#F2F1EC]'
                    }`}
                  >
                    Compact List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('FOCUSED_STEPPER')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      viewMode === 'FOCUSED_STEPPER' ? 'bg-[#22C55E] text-[#052E16]' : 'text-[#A8ABB3] hover:text-[#F2F1EC]'
                    }`}
                  >
                    Focused Stepper
                  </button>
                </div>

                <div className="w-28 sm:w-36 h-2 bg-[#0A0A0B] rounded-full overflow-hidden border border-[rgba(34,197,94,0.2)] shrink-0">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#22C55E] to-[#22C55E] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            </div>

            {/* View Mode A: Compact List with Expandable Rows */}
            {viewMode === 'LIST' ? (
              <div className="space-y-2.5">
                {checklist.map((action, idx) => {
                  const isDone = completedSteps.includes(action.step);
                  const isExpanded = expandedStep === action.step;

                  return (
                    <div
                      key={action.step}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-[#A8ABB3]'
                          : 'bg-[#0A0A0B] border-[rgba(34,197,94,0.2)] hover:border-[#22C55E]/50'
                      }`}
                    >
                      {/* Step Header Bar */}
                      <div
                        onClick={() => setExpandedStep(isExpanded ? null : action.step)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox with Spring Animation */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStep(action.step);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                              isDone
                                ? 'bg-[#22C55E] text-[#052E16] shadow-sm'
                                : 'border border-[#A8ABB3]/50 hover:border-[#22C55E] bg-[#141416]'
                            }`}
                          >
                            {isDone && (
                              <motion.div
                                initial={{ scale: 0.6 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </motion.div>
                            )}
                          </button>

                          <div className="w-7 h-7 rounded-lg bg-[#141416] border border-[rgba(34,197,94,0.2)] flex items-center justify-center shrink-0">
                            {getStepIcon(idx, action)}
                          </div>

                          <h4
                            className={`font-heading font-bold text-xs sm:text-sm truncate ${
                              isDone ? 'line-through text-[#9A9A9E]' : 'text-[#F2F1EC]'
                            }`}
                          >
                            Step {action.step}: {action.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {action.estimatedDays && (
                            <span className="bg-[#22C55E]/15 text-[#16A34A] dark:text-[#4ADE80] px-2.5 py-0.5 rounded text-[10px] font-mono border border-[#22C55E]/30 font-bold">
                              Est. {action.estimatedDays}
                            </span>
                          )}
                          <div className="text-[#A8ABB3] hover:text-[#F2F1EC]">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Step Description & Metadata */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 pt-1 border-t border-[rgba(34,197,94,0.15)] space-y-2 bg-[#141416]/50"
                          >
                            <p className="text-xs text-[#A8ABB3] leading-relaxed">
                              {action.description}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#A8ABB3]">
                              {action.locationType && (
                                <span className="bg-[#141416] px-2 py-0.5 rounded border border-[rgba(34,197,94,0.2)]">
                                  Channel: {action.locationType === 'ONLINE' ? '🌐 Online Portal' : '🏛️ Department Office'}
                                </span>
                              )}
                              {action.evidenceRef && (
                                <span className="text-[#22C55E] font-bold">Ref Clause: {action.evidenceRef}</span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View Mode B: Focused Stepper Interactive Card */
              <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#22C55E]/30 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#22C55E] font-bold">
                    Step {activeStepIndex + 1} of {checklist.length}
                  </span>
                  <span className="text-[#A8ABB3]">
                    {completedSteps.includes(checklist[activeStepIndex]?.step) ? '✓ Completed' : 'Pending Action'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-heading font-extrabold text-base text-[#F2F1EC]">
                    {checklist[activeStepIndex]?.title}
                  </h4>
                  <p className="text-xs text-[#A8ABB3] leading-relaxed">
                    {checklist[activeStepIndex]?.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[rgba(34,197,94,0.15)]">
                  <button
                    type="button"
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      activeStepIndex === 0
                        ? 'opacity-40 cursor-not-allowed text-[#A8ABB3]'
                        : 'bg-[#141416] text-[#F2F1EC] hover:bg-[#22C55E]/10 border border-[rgba(34,197,94,0.2)]'
                    }`}
                  >
                    <ChevronLeft size={14} /> Previous Step
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStep(checklist[activeStepIndex]?.step)}
                    className="px-4 py-1.5 bg-[#22C55E] text-[#052E16] font-bold text-xs rounded-lg shadow cursor-pointer"
                  >
                    {completedSteps.includes(checklist[activeStepIndex]?.step) ? 'Mark Incomplete' : 'Mark Complete ✓'}
                  </button>

                  <button
                    type="button"
                    disabled={activeStepIndex === checklist.length - 1}
                    onClick={() => setActiveStepIndex((prev) => Math.min(checklist.length - 1, prev + 1))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      activeStepIndex === checklist.length - 1
                        ? 'opacity-40 cursor-not-allowed text-[#A8ABB3]'
                        : 'bg-[#141416] text-[#F2F1EC] hover:bg-[#22C55E]/10 border border-[rgba(34,197,94,0.2)]'
                    }`}
                  >
                    Next Step <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Section 3: Required Supporting Documents (Horizontal Scrollable Carousel) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-3 pt-1"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#F2F1EC] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#22C55E]" />
                Required Supporting Documents Checklist
              </h3>
              <span className="text-[10px] text-[#A8ABB3] font-mono">Horizontal Scroll &rarr;</span>
            </div>

            {/* Horizontal Scrollable Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#22C55E]/30 scrollbar-track-transparent">
              {documentsList.map((doc) => {
                const IconComponent = doc.IconComp;
                const isMissing = doc.statusType === 'missing';
                const isHave = doc.statusType === 'have';

                return (
                  <div
                    key={doc.name}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 min-w-[240px] shrink-0 transition-all ${
                      isMissing
                        ? 'bg-red-500/10 border-red-500/30'
                        : isHave
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isMissing
                            ? 'bg-red-500/20 text-red-500'
                            : isHave
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-heading font-bold text-xs text-[#F2F1EC] truncate max-w-[140px]">
                        {doc.name}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                        isMissing
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold'
                          : isHave
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="p-4 bg-[#0A0A0B] border-t border-[rgba(34,197,94,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCoverNoteModal(true)}
              className="cursor-pointer flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#141416] hover:bg-[#1C1C1F] border border-[rgba(34,197,94,0.25)] text-[#F2F1EC] font-heading font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#22C55E]" />
              <span>Preview Resubmission Cover Note</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => alert('Action Plan PDF compiled with official OpenSearch evidence excerpts.')}
              className="cursor-pointer flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-[#0A0A0B] font-heading font-extrabold text-xs shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Action Plan (PDF)</span>
            </motion.button>

            {onNewAnalysis && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onNewAnalysis();
                }}
                className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] font-heading font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Resubmit Application</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Cover Note Preview Modal */}
        <AnimatePresence>
          {showCoverNoteModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#141416] border border-[#22C55E]/40 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-[#22C55E] font-bold text-sm">
                    <FileText size={18} />
                    <span>Auto-Drafted Resubmission Cover Note</span>
                  </div>
                  <button onClick={() => setShowCoverNoteModal(false)} className="text-[#A8ABB3] hover:text-white cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-[#0A0A0B] p-4 rounded-xl border border-white/10 text-xs font-mono text-[#F2F1EC] leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                  {analysis.resubmissionCoverNote || 'To,\nThe Nodal Officer,\n\nSubject: Resubmission of Application with Corrected Endorsement.\n\nRespected Sir/Madam,\nI am resubmitting my application with the required Principal endorsement marksheets as specified under Section 4.2.'}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleCopyCoverNote}
                    className="flex-1 py-2.5 bg-[#22C55E] text-[#0A0A0B] font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {copiedNote ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedNote ? 'Copied to Clipboard!' : 'Copy Cover Note Text'}</span>
                  </button>
                  <button
                    onClick={() => setShowCoverNoteModal(false)}
                    className="px-4 py-2.5 bg-[#1C1C1F] text-[#A8ABB3] hover:text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
