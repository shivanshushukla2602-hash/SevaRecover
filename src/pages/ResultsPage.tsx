import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  MapPin,
  Eye,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Clock,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { FailureAnalysis, EvidenceItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AuthenticityBadge } from '../components/AuthenticityBadge';
import { SubmittedVsRequired } from '../components/SubmittedVsRequired';
import { UrgencyTrafficLight } from '../components/UrgencyTrafficLight';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { CoverNoteModal } from '../components/CoverNoteModal';
import { ResolutionPatternBadge } from '../components/ResolutionPatternBadge';
import { CSCLocatorModal } from '../components/CSCLocatorModal';
import { AuditorEvidenceTrailModal } from '../components/AuditorEvidenceTrailModal';
import { RadialConfidenceGauge } from '../components/RadialConfidenceGauge';

interface ResultsPageProps {
  analysis: FailureAnalysis;
  onNewAnalysis: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ analysis, onNewAnalysis }) => {
  const { language, t } = useLanguage();
  const { role } = useAuth();

  const [coverNoteModalOpen, setCoverNoteModalOpen] = useState(false);
  const [cscModalOpen, setCscModalOpen] = useState(false);
  const [auditorModalOpen, setAuditorModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Expanded accordion steps state
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true });

  const toggleStepAccordion = (stepNo: number) => {
    setExpandedSteps((prev) => ({ ...prev, [stepNo]: !prev[stepNo] }));
  };

  // Download PDF functionality
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('SevaRecover - Failure Analysis & Recovery Plan', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Service: ${analysis.serviceName}`, 14, 28);
    doc.text(`State: ${analysis.state} | Application Ref: ${analysis.applicationReference || 'N/A'}`, 14, 34);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 40);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 44, 196, 44);

    // Why Failed Section
    doc.setFontSize(12);
    doc.setTextColor(49, 46, 129);
    doc.text('Why Application Failed:', 14, 52);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const plainText = analysis.whyFailedPlainLanguage[language] || analysis.whyFailedPlainLanguage['en'];
    const splitExplanation = doc.splitTextToSize(plainText, 180);
    doc.text(splitExplanation, 14, 60);

    let currentY = 60 + splitExplanation.length * 6;

    // Action Checklist
    doc.setFontSize(12);
    doc.setTextColor(5, 150, 105);
    doc.text('Documented Recovery Action Checklist:', 14, currentY + 10);
    currentY += 18;

    analysis.actionChecklist.forEach((step) => {
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Step ${step.step}: ${step.title}`, 14, currentY);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const stepDesc = doc.splitTextToSize(step.description, 175);
      doc.text(stepDesc, 18, currentY + 6);
      currentY += 12 + stepDesc.length * 5;
    });

    // Evidence Citations
    doc.setFontSize(12);
    doc.setTextColor(49, 46, 129);
    doc.text('Official Evidence Citations:', 14, currentY + 10);
    currentY += 18;

    analysis.evidence.forEach((ev) => {
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`[Source] ${ev.source} - ${ev.section}`, 14, currentY);
      currentY += 8;
    });

    doc.save(`SevaRecover_ActionPlan_${analysis.id}.pdf`);
  };

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-8 text-[#F2F1EC]">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            {t('analysisResultId')} {analysis.id}
          </span>
          <h1 className="text-2xl font-heading font-extrabold text-brand-900 mt-1">
            {analysis.serviceName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            State: <strong>{analysis.state}</strong> • Dept: <strong>{analysis.department}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Read Aloud Button with Audio Equalizer */}
          <ReadAloudButton
            textToRead={analysis.whyFailedPlainLanguage[language] || analysis.whyFailedPlainLanguage['en']}
          />

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-civic-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadPdf')}</span>
          </button>

          {/* Start New Analysis */}
          <button
            onClick={onNewAnalysis}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            {t('newAnalysis')}
          </button>
        </div>
      </div>

      {/* Tier 1 #1: Rejection Notice Authenticity Badge */}
      <AuthenticityBadge
        flag={analysis.authenticityFlag}
        reason={analysis.authenticityReason}
      />

      {/* Main Analysis Card: Why Did It Fail? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-2xl border border-civic-border p-6 shadow-civic-md space-y-6"
      >
        {/* Why Failed Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-brand-900">
                {t('whyFailedTitle')}
              </h2>
              <p className="text-xs text-slate-500">{t('whyFailedSub')}</p>
            </div>
          </div>

          {/* Radial Arc Confidence Gauge */}
          <RadialConfidenceGauge
            confidence={analysis.confidence}
            explanation={analysis.confidenceExplanation}
          />
        </div>

        {/* Plain Language Explanation */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-2">
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {analysis.whyFailedPlainLanguage[language] || analysis.whyFailedPlainLanguage['en']}
          </p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">{t('recoverySummaryTitle')}</h3>
          <p className="text-sm text-emerald-950 leading-relaxed font-medium">
            {analysis.recoverySummary[language] || analysis.recoverySummary['en']}
          </p>
        </div>

        {/* Tier 1 #4: Urgency Traffic Light */}
        <UrgencyTrafficLight
          proximity={analysis.deadlineProximity}
          deadlineText={analysis.deadlineText}
        />

        {/* Tier 1 #2: Interactive Side-by-Side Submitted vs Required Comparison */}
        <SubmittedVsRequired
          submittedValue={analysis.submittedValue}
          requiredValue={analysis.requiredValue}
          requirementTitle={analysis.affectedRequirement}
        />

      </motion.div>

      {/* Evidence Panel & Source Quotes */}
      <div className="bg-white rounded-2xl border border-civic-border p-6 shadow-civic-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-brand-900">
                {t('evidencePanelTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{t('evidenceNotice')}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            {analysis.evidence.length} Retrieved Documents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.evidence.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 hover:border-brand-300 transition-colors relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-xs text-brand-900">{ev.source}</h4>
                  <p className="text-[11px] text-brand-700 font-semibold">{ev.section}</p>
                </div>
                <button
                  onClick={() => setSelectedEvidence(ev)}
                  className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm cursor-pointer"
                >
                  <span>{t('viewEvidenceDoc')}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Document Quote Box with Sentence Highlight */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed relative">
                <mark className="bg-amber-100/90 text-amber-950 font-medium px-1 rounded block">
                  &ldquo;{ev.excerpt}&rdquo;
                </mark>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                <span>{t('docTypeLabel')} {ev.documentType}</span>
                <span>{t('effectiveDateLabel')} {ev.effectiveDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 2 #7: Resolution Pattern Benchmark Badge */}
      <ResolutionPatternBadge
        totalSimilarCases={analysis.resolutionPattern.totalSimilarCases}
        resolvedCount={analysis.resolutionPattern.resolvedCount}
        primarySolutionSummary={analysis.resolutionPattern.primarySolutionSummary}
      />

      {/* Scroll-Driven Expandable Recovery Timeline */}
      <div className="bg-white rounded-2xl border border-civic-border p-6 shadow-civic-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-brand-900">
                {t('recoveryPlanTitle')}
              </h3>
              <p className="text-xs text-slate-500">{t('recoveryPlanSub')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Tier 2 #8: CSC Locator Button */}
            <button
              onClick={() => setCscModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t('locateCscBtn')}</span>
            </button>

            {/* Tier 1 #3: Cover Note Modal Button */}
            <button
              onClick={() => setCoverNoteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t('coverNoteTitle')}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Expandable Accordion Timeline */}
        {analysis.recoveryAvailable ? (
          <div className="space-y-4">
            {analysis.actionChecklist.map((action, index) => {
              const isExpanded = !!expandedSteps[action.step];

              return (
                <motion.div
                  key={action.step}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-civic-sm hover:border-emerald-300 transition-all"
                >
                  <div
                    onClick={() => toggleStepAccordion(action.step)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {action.step}
                      </div>
                      <h4 className="font-heading font-bold text-sm text-brand-900">{action.title}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {action.estimatedDays && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {action.estimatedDays}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600"
                      >
                        <p className="leading-relaxed">{action.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                          {action.locationType && (
                            <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-sans">
                              {t('channelLabel')} {action.locationType === 'CSC_IN_PERSON' ? 'Common Service Centre (CSC)' : action.locationType === 'ONLINE' ? 'Online State Portal' : 'Tehsil Office'}
                            </span>
                          )}
                          {action.evidenceRef && (
                            <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                              {t('citationLabel')} {action.evidenceRef}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-600">
            <p className="text-xs font-bold text-slate-800">
              {t('noRecoveryProc')}
            </p>
          </div>
        )}
      </div>

      {/* Tier 2 #9: Cedar Auditor Evidence Trail Trigger */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-civic-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-white text-sm">
                {t('auditorTrailTitle')}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {t('auditorFeatureBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('auditorTrailSub')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setAuditorModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-heading font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>{t('auditorTrailCta')}</span>
        </button>
      </div>

      {/* Persistent Trust Notice Banner */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-start gap-3 text-xs text-brand-900">
        <ShieldCheck className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('assistantNotice')}
        </p>
      </div>

      {/* Modals */}
      <CoverNoteModal
        isOpen={coverNoteModalOpen}
        onClose={() => setCoverNoteModalOpen(false)}
        coverNoteText={analysis.resubmissionCoverNote}
        applicationRef={analysis.applicationReference}
      />

      <CSCLocatorModal
        isOpen={cscModalOpen}
        onClose={() => setCscModalOpen(false)}
      />

      <AuditorEvidenceTrailModal
        isOpen={auditorModalOpen}
        onClose={() => setAuditorModalOpen(false)}
        reasoningTrail={analysis.reasoningTrail}
        serviceName={analysis.serviceName}
      />

      {/* Document-Styled Evidence Detail Card Drawer */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-50/95 border-2 border-amber-200 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-civic-lg relative overflow-hidden text-slate-900"
          >
            {/* Seal Watermark */}
            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none text-amber-900 font-heading font-extrabold text-6xl">
              GAZETTE
            </div>

            <div className="flex items-start justify-between border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Official Document Citation
                </span>
                <h3 className="font-heading font-bold text-base text-amber-950 mt-1">{selectedEvidence.source}</h3>
                <p className="text-xs text-amber-800 font-semibold">{selectedEvidence.section}</p>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/90 p-4 rounded-xl border border-amber-200/80 text-xs font-mono text-slate-900 leading-relaxed shadow-inner">
              <mark className="bg-amber-200 text-amber-950 font-bold px-1 rounded block mb-1">
                EXCERPT:
              </mark>
              &ldquo;{selectedEvidence.excerpt}&rdquo;
            </div>

            <div className="flex items-center justify-between text-[11px] text-amber-900 pt-2 border-t border-amber-200">
              <span>Doc Type: <strong>{selectedEvidence.documentType}</strong></span>
              <span>Effective Date: <strong>{selectedEvidence.effectiveDate}</strong></span>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
