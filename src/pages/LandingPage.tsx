import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, FileX, Search, CheckCircle2, ShieldCheck, Cpu, Sparkles, Check, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCountUp } from '../hooks/useCountUp';
import { StatBreakdownModal } from '../components/StatBreakdownModal';
import { FlowConnector } from '../components/FlowConnector';
import { HeroIllustration } from '../components/HeroIllustration';

interface LandingPageProps {
  onStartAnalysis?: () => void;
  onExploreHowItWorks?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreHowItWorks,
}) => {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  // Active step state for the Workflow Stage Details Panel (0 = Domain, 1 = Notice, 2 = RAG, 3 = Recovery)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [statModalType, setStatModalType] = useState<'applications' | 'pathways' | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');

  const detailsPanelRef = useRef<HTMLDivElement>(null);

  // Scroll ref & count up animation for counter strip
  const counterRef = useRef<HTMLDivElement>(null);
  const isCounterInView = useInView(counterRef, { once: true });
  const countApplications = useCountUp(1284, 2200, isCounterInView);
  const countRecoveries = useCountUp(1160, 2200, isCounterInView);

  const stepsData = [
    {
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: Shield,
      example: t('step1Ex')
    },
    {
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: FileX,
      example: t('step2Ex')
    },
    {
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: Search,
      example: t('step3Ex')
    },
    {
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: CheckCircle2,
      example: t('step4Ex')
    }
  ];

  // Monospace typing reveal effect when active step changes
  useEffect(() => {
    const text = stepsData[activeStep].example;
    if (prefersReducedMotion) {
      setTypedText(text);
      return;
    }
    setTypedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 12);
    return () => clearInterval(timer);
  }, [activeStep, prefersReducedMotion, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 },
    },
  };

  const cardEntranceVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.35,
        delay: prefersReducedMotion ? 0 : i * 0.1,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <div className="space-y-20 pb-16 bg-[#0A0A0B] text-[#F2F1EC]">
      
      {/* Hero Section */}
      <section className="relative pt-8 lg:pt-12 pb-12 lg:pb-16 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#22C55E]/15 via-[#22C55E]/5 to-transparent pointer-events-none -z-10 rounded-3xl" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="ds-shell"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-stretch">
            
            {/* LEFT COLUMN: Interactive AI Document Analysis & Recovery Graphic */}
            <motion.div variants={itemVariants} className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6 relative h-full flex flex-col justify-center">
              <HeroIllustration />
            </motion.div>

            {/* RIGHT COLUMN: Hero Copy, CTAs & Counter Cards */}
            <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 space-y-6 text-left flex flex-col justify-center">
              {/* Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416] border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span>{t('heroBadge')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A9B7E] animate-pulse" />
              </motion.div>

              {/* Heading */}
              <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-[#F2F1EC] leading-[1.15] tracking-tight">
                {t('heroTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#22C55E] to-[#A8ABB3]">
                  {t('heroTitleGold')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-[#9A9A9E] leading-relaxed font-normal">
                {t('heroSubtitle')}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <button
                  onClick={onStartAnalysis}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-heading font-bold text-base shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_28px_rgba(34,197,94,0.35)] transition-all duration-200 flex items-center justify-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2"
                >
                  <span>{t('analyzeCta')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreHowItWorks}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1C1C1F] text-[#F2F1EC] font-heading font-semibold text-base border border-[rgba(34,197,94,0.25)] shadow-civic-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 flex items-center justify-center"
                >
                  {t('exploreCta')}
                </button>
              </motion.div>

              {/* Trust Statement */}
              <motion.div variants={itemVariants} className="pt-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141416] text-[#A8ABB3] text-xs font-medium border border-[rgba(34,197,94,0.15)]">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>{t('trustNotice')}</span>
                </div>
              </motion.div>

              {/* Live Count-Up Counter Strip / Interactive Stat Cards */}
              <motion.div
                ref={counterRef}
                variants={itemVariants}
                className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              >
                <div
                  tabIndex={0}
                  onClick={() => setStatModalType('applications')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setStatModalType('applications');
                    }
                  }}
                  className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.15)] hover:border-[#22C55E]/40 p-3.5 shadow-civic-sm hover:shadow-[0_0_24px_rgba(34,197,94,0.2)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#22C55E]">
                      <span>{t('demoDataTag')}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#F2F1EC]">
                      {countApplications.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9A9A9E] block">{t('appsAnalyzedInspect')}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center group-hover:bg-[#22C55E]/20 transition-colors border border-[#22C55E]/20 shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>

                <div
                  tabIndex={0}
                  onClick={() => setStatModalType('pathways')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setStatModalType('pathways');
                    }
                  }}
                  className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.15)] hover:border-[#7A9B7E]/40 p-3.5 shadow-civic-sm hover:shadow-[0_0_24px_rgba(122,155,126,0.2)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7A9B7E]">
                      <span>{t('demoDataTag')}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#7A9B7E]">
                      {countRecoveries.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9A9A9E] block">{t('pathwaysFoundInspect')}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#7A9B7E]/10 text-[#7A9B7E] flex items-center justify-center group-hover:bg-[#7A9B7E]/20 transition-colors border border-[#7A9B7E]/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Stat Breakdown Modal */}
      <AnimatePresence>
        {statModalType && (
          <StatBreakdownModal
            type={statModalType}
            onClose={() => setStatModalType(null)}
            onNavigateToAnalyze={onStartAnalysis}
          />
        )}
      </AnimatePresence>

      {/* Redesigned Node Diagram Cards */}
      <section className="ds-shell relative overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] space-y-10 relative z-10"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-heading font-bold text-[#F2F1EC]">
              {t('nodeDiagramTitle')}
            </h2>
            <p className="text-sm text-[#9A9A9E] max-w-xl mx-auto">
              {t('nodeDiagramSub')}
            </p>
          </div>

          {/* Continuous Pipeline Layout */}
          <div className="relative mt-12 md:mt-16">
            {/* Background Track Line */}
            <div className="absolute top-1/2 left-[5%] right-[5%] h-[3px] bg-[#22C55E]/20 -translate-y-1/2 hidden md:block rounded-full" />
            <div className="absolute top-[5%] bottom-[5%] left-1/2 w-[3px] bg-[#22C55E]/20 -translate-x-1/2 md:hidden rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
              
              {/* Node 1: Failure Input */}
              <motion.div
                custom={0}
                variants={cardEntranceVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                tabIndex={0}
                onClick={() => setActiveStep(1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(1);
                  }
                }}
                className={`bg-[#141416] rounded-2xl border cursor-pointer transition-all duration-300 group relative flex flex-col justify-between min-h-[200px] overflow-hidden ${
                  activeStep === 1
                    ? 'border-[#22C55E] ring-1 ring-[#22C55E] z-20'
                    : 'border-white/10 hover:border-[#22C55E]/50'
                }`}
              >
                {/* Large Background Step Number */}
                <div 
                  className={`absolute -right-4 -bottom-6 text-9xl font-black transition-colors duration-300 pointer-events-none font-heading ${activeStep === 1 ? 'text-[#22C55E]/10' : 'text-[#052E16]/[0.02]'}`}
                >
                  1
                </div>

                <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-6">
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      activeStep === 1 
                        ? 'bg-[#22C55E] text-[#052E16]' 
                        : 'bg-[#1C1C1F] border border-white/10 text-[#22C55E] group-hover:bg-[#22C55E]/10'
                    }`}
                  >
                    <FileX className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-xl transition-colors duration-300 ${activeStep === 1 ? 'text-[#22C55E]' : 'text-[#F2F1EC] group-hover:text-[#22C55E]'}`}>
                      {t('node1Title')}
                    </h3>
                    <p className="text-sm text-[#9A9A9E] leading-relaxed mt-2 group-hover:text-[#A8ABB3]">
                      {t('node1Desc')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Node 2: OpenSearch RAG */}
              <motion.div
                custom={1}
                variants={cardEntranceVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                tabIndex={0}
                onClick={() => setActiveStep(2)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(2);
                  }
                }}
                className={`bg-[#141416] rounded-2xl border cursor-pointer transition-all duration-300 group relative flex flex-col justify-between min-h-[200px] overflow-hidden ${
                  activeStep === 2
                    ? 'border-[#22C55E] ring-1 ring-[#22C55E] z-20'
                    : 'border-white/10 hover:border-[#22C55E]/50'
                }`}
              >
                {/* Large Background Step Number */}
                <div 
                  className={`absolute -right-4 -bottom-6 text-9xl font-black transition-colors duration-300 pointer-events-none font-heading ${activeStep === 2 ? 'text-[#22C55E]/10' : 'text-[#052E16]/[0.02]'}`}
                >
                  2
                </div>

                <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-6">
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      activeStep === 2 
                        ? 'bg-[#22C55E] text-[#052E16]' 
                        : 'bg-[#1C1C1F] border border-white/10 text-[#22C55E] group-hover:bg-[#22C55E]/10'
                    }`}
                  >
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-xl transition-colors duration-300 ${activeStep === 2 ? 'text-[#22C55E]' : 'text-[#F2F1EC] group-hover:text-[#22C55E]'}`}>
                      {t('node2Title')}
                    </h3>
                    <p className="text-sm text-[#9A9A9E] leading-relaxed mt-2 group-hover:text-[#A8ABB3]">
                      {t('node2Desc')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Node 3: Recovery */}
              <motion.div
                custom={2}
                variants={cardEntranceVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                tabIndex={0}
                onClick={() => setActiveStep(3)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(3);
                  }
                }}
                className={`bg-[#141416] rounded-2xl border cursor-pointer transition-all duration-300 group relative flex flex-col justify-between min-h-[200px] overflow-hidden ${
                  activeStep === 3
                    ? 'border-[#22C55E] ring-1 ring-[#22C55E] z-20'
                    : 'border-white/10 hover:border-[#22C55E]/50'
                }`}
              >
                {/* Large Background Step Number */}
                <div 
                  className={`absolute -right-4 -bottom-6 text-9xl font-black transition-colors duration-300 pointer-events-none font-heading ${activeStep === 3 ? 'text-[#22C55E]/10' : 'text-[#052E16]/[0.02]'}`}
                >
                  3
                </div>

                <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-6">
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      activeStep === 3 
                        ? 'bg-[#22C55E] text-[#052E16]' 
                        : 'bg-[#1C1C1F] border border-white/10 text-[#22C55E] group-hover:bg-[#22C55E]/10'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-xl transition-colors duration-300 ${activeStep === 3 ? 'text-[#22C55E]' : 'text-[#F2F1EC] group-hover:text-[#22C55E]'}`}>
                      {t('node3Title')}
                    </h3>
                    <p className="text-sm text-[#9A9A9E] leading-relaxed mt-2 group-hover:text-[#A8ABB3]">
                      {t('node3Desc')}
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* Horizontal Interactive Stepper with Sequence Connector Track */}
      <section className="ds-shell space-y-12 relative overflow-hidden">

        <div className="text-center space-y-3 relative z-10">
          <h2 className="text-3xl font-heading font-black text-[#F2F1EC] tracking-tight">
            {t('stepperTitle')}
          </h2>
          <p className="text-base text-[#9A9A9E] max-w-xl mx-auto">
            {t('stepperSub')}
          </p>
        </div>

        {/* Horizontal Segmented Progress Bar */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-8 z-10">
          {/* Connector Line Track */}
          <div className="absolute top-[56px] left-[10%] right-[10%] h-[3px] bg-white/5 -z-10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#22C55E] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(activeStep / (stepsData.length - 1)) * 100}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>

          <div className="flex justify-between items-start gap-4">
            {stepsData.map((step, idx) => {
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 relative group">
                  <button
                    onClick={() => setActiveStep(idx)}
                    className="flex flex-col items-center w-full focus:outline-none"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 z-10 ${
                        isActive
                          ? 'bg-[#22C55E] text-[#052E16]'
                          : isPast
                          ? 'bg-[#1C1C1F] text-[#22C55E] border border-[#22C55E]/30'
                          : 'bg-[#141416] text-[#A8ABB3] border border-white/10 group-hover:border-white/30'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="mt-6 text-center">
                      <span className={`text-[10px] uppercase tracking-widest font-bold mb-1.5 block transition-colors duration-300 ${
                        isActive ? 'text-[#22C55E]' : 'text-[#9A9A9E]'
                      }`}>
                        Step {idx + 1}
                      </span>
                      <span className={`text-sm font-bold transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-[#A8ABB3] group-hover:text-white'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrated Workflow Stage Details Panel */}
        <div
          ref={detailsPanelRef}
          aria-live="polite"
          className="bg-gradient-to-br from-[#141416] to-[#0A0A0B] rounded-2xl border border-[rgba(34,197,94,0.2)] p-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] mx-auto max-w-4xl relative overflow-hidden mt-4"
        >
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-6 sm:p-8 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReducedMotion ? 0 : 10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-full inline-block">
                    {t('workflowStageDetails')}
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#F2F1EC]">
                    {stepsData[activeStep].title}
                  </h3>
                  <p className="text-sm text-[#9A9A9E] leading-relaxed max-w-lg">
                    {stepsData[activeStep].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Code Snippet Box */}
            <div className="p-6 sm:p-8 md:w-[380px] bg-white/5 backdrop-blur-sm flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] text-[#F2F1EC] uppercase font-bold mb-3">
                <span>{t('codeSnippetLabel')}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(stepsData[activeStep].example);
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[10px] text-[#F2F1EC] hover:text-[#22C55E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] rounded px-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? t('copiedText') : t('copyText')}</span>
                </button>
              </div>
              <div className="bg-[#1C1C1F] text-[#22C55E] p-4 rounded-xl border border-[#22C55E]/15 font-mono text-xs shadow-inner relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22C55E]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="leading-relaxed block min-h-[40px]">
                  {typedText}
                  <span className="inline-block w-1.5 h-3.5 bg-[#22C55E] ml-0.5 animate-pulse" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
