import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck, Cpu, KeyRound, Search, Server, Layers, FileText, CheckCircle2,
  ChevronDown, Info, Copy, Check, Terminal, Box, Lock, Code2, Globe
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [openFaqs, setOpenFaqs] = useState<number[]>([0]);
  const [openTechWhy, setOpenTechWhy] = useState<Record<string, boolean>>({});
  const [copiedStatement, setCopiedStatement] = useState<boolean>(false);

  const toggleFaq = (index: number) => {
    if (openFaqs.includes(index)) {
      setOpenFaqs(openFaqs.filter((i) => i !== index));
    } else {
      setOpenFaqs([...openFaqs, index]);
    }
  };

  const toggleTechWhy = (tech: string) => {
    setOpenTechWhy((prev) => ({ ...prev, [tech]: !prev[tech] }));
  };

  const statementText = `This project was built for the AWS Build It Hackathon using Amazon OpenSearch, AWS Lambda, AWS SAM, Amazon Cognito, and Finch containerization tool.`;

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statementText);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2000);
  };

  const pipelineStages = [
    {
      stage: 'Stage 1',
      title: 'Notice Ingestion & OCR',
      desc: 'Extracted rejection notice text via multi-lingual OCR pipeline.',
      icon: FileText,
      deepDive: 'The user uploads a rejection notice image/PDF. The Python backend processes document layout structures and extracts official rejection clauses into normalized text payloads.',
    },
    {
      stage: 'Stage 2',
      title: 'Amazon OpenSearch RAG Search',
      desc: 'Queried vector/hybrid index of seeded state gazettes and circulars.',
      icon: Search,
      deepDive: 'Executes a k-NN hybrid vector search against Amazon OpenSearch Service. Retrieves the top matching official government circular clauses (e.g. Maharashra SSP 2026 guidelines, PM Kisan Sec 2.1).',
    },
    {
      stage: 'Stage 3',
      title: 'Cedar Policy Engine Authorization',
      desc: 'Evaluates RBAC roles (CITIZEN/ADMIN/AUDITOR) before data synthesis.',
      icon: Lock,
      deepDive: 'Determines fine-grained authorization using Amazon Verified Permissions Cedar policy store. Confirms that principal.citizenId matches resource.citizenId before executing RAG synthesis.',
    },
    {
      stage: 'Stage 4',
      title: 'Strands Agent Action Plan Generation',
      desc: 'Formulates side-by-side comparison & copyable cover note.',
      icon: Code2,
      deepDive: 'AWS Strands Agent aggregates retrieved OpenSearch evidence, builds a side-by-side gap analysis (Submitted vs Required), and generates an auto-drafted resubmission cover note.',
    },
  ];

  const techMapping = [
    {
      tech: 'Amazon OpenSearch Service',
      role: 'Vector database and hybrid retrieval engine for government circulars, gazettes, and guidelines.',
      why: 'Enables high-precision RAG search across thousands of pages of unstructured government policy PDFs with low latency.',
      icon: Search,
      color: 'text-[#22C55E]',
    },
    {
      tech: 'AWS Lambda (Python 3.11)',
      role: 'Serverless compute layer executing OCR ingestion, OpenSearch queries, and Cedar auth checks.',
      why: 'Scales automatically per request without persistent server overhead, maintaining zero standby cost.',
      icon: Cpu,
      color: 'text-[#22C55E]',
    },
    {
      tech: 'AWS SAM (Serverless Application Model)',
      role: 'Infrastructure-as-code template declaring API Gateway, Lambda functions, DynamoDB, and Cognito.',
      why: 'Provides reproducible deployment (`sam deploy`) and local API testing (`sam local start-api`).',
      icon: Terminal,
      color: 'text-[#22C55E]',
    },
    {
      tech: 'Amazon Cognito User Pools',
      role: 'Identity provider issuing JWT bearer tokens with custom claims for citizen authentication.',
      why: 'Enforces secure authentication and injects claims used by Cedar authorization policies.',
      icon: KeyRound,
      color: 'text-[#22C55E]',
    },
    {
      tech: 'Finch Containerization',
      role: 'Local container development and containerization (`finch compose`).',
      why: 'Provides open-source container engine tooling for reproducible microservice builds across macOS ARM/x86 architectures.',
      icon: Box,
      color: 'text-[#22C55E]',
    },
  ];

  const faqList = [
    {
      q: 'Does SevaRecover replace official government portals or grievance cells?',
      a: 'No. SevaRecover is a digital public information assistant layer. It explains rejection codes using authoritative circulars, but official resubmissions must be made on state portals or at Common Service Centres.',
    },
    {
      q: 'Does SevaRecover guarantee application approval or bypass rules?',
      a: 'No. SevaRecover strictly adheres to documented gazette rules retrieved from Amazon OpenSearch. It cannot alter statutory eligibility criteria or grant official approvals.',
    },
    {
      q: 'Are official filing fees or biometric secrets collected by SevaRecover?',
      a: 'Never. SevaRecover does not collect government fees, UPI transactions, Aadhaar OTP secrets, or private bank account details.',
    },
  ];

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-10 text-[#F2F1EC]">
      
      {/* Title Header */}
      <div className="grid lg:grid-cols-[1fr_.8fr] gap-8 items-end">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416] border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Architecture & Governance Guidelines</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-[#F2F1EC] leading-none">
            How <span className="gold-text">SevaRecover</span> Works
          </h1>
          <p className="text-sm text-[#9A9A9E] max-w-xl">
            An evidence-first AI framework designed to explain digital public service application rejections using authoritative government sources.
          </p>
        </div>
        <div className="bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="eyebrow">TRACEABLE BY DESIGN</span>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-3xl font-heading font-extrabold gold-text">04</div>
              <span className="text-[10px] uppercase tracking-wider text-[#9A9A9E]">Evidence stages</span>
            </div>
            <div>
              <div className="text-3xl font-heading font-extrabold gold-text">01</div>
              <span className="text-[10px] uppercase tracking-wider text-[#9A9A9E]">Citizen outcome</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Request Flow Map */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">LIVE REQUEST MAP</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-heading font-extrabold text-[#F2F1EC]">From notice to next move.</h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#9A9A9E]">
            <span className="w-2 h-2 rounded-full bg-[#7A9B7E] animate-pulse" /> authenticated flow
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {[
            { label: 'Citizen', Icon: ShieldCheck, verb: 'submit' },
            { label: 'Cognito', Icon: KeyRound, verb: 'authorize' },
            { label: 'Lambda', Icon: Cpu, verb: 'process' },
            { label: 'OpenSearch', Icon: Search, verb: 'retrieve' },
            { label: 'DynamoDB', Icon: Server, verb: 'persist' },
          ].map(({ label, Icon, verb }, index) => (
            <React.Fragment key={label}>
              <div className="bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] hover:border-[#22C55E] rounded-xl p-4 text-center transition-all group">
                <div className="mx-auto mb-2 w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] border border-[#22C55E]/30 group-hover:scale-105 transition-transform">
                  <Icon size={19} />
                </div>
                <div className="text-xs font-bold text-[#F2F1EC]">{label}</div>
                <div className="mt-1 text-[10px] text-[#A8ABB3] font-mono">{verb}</div>
              </div>
              {index < 4 && <div className="hidden sm:block text-center text-[#22C55E] text-xl font-bold">→</div>}
            </React.Fragment>
          ))}
        </div>
      </motion.section>

      {/* SECTION 1: End-to-End Pipeline Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3">
          <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#22C55E]" />
            End-to-End AWS Build It Agent Pipeline Architecture
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2.5 py-1 rounded-md">
            Click Stage for Deep Dive
          </span>
        </div>

        <div className="relative">
          <div className="hidden sm:block absolute top-9 left-12 right-12 h-1 bg-white/10 -z-10 rounded-full">
            {!prefersReducedMotion && (
              <motion.div
                className="h-full bg-gradient-to-r from-[#22C55E]/30 via-[#22C55E] to-[#22C55E] rounded-full"
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
            {pipelineStages.map((item, idx) => {
              const isSelected = activeStage === idx;
              const StageIcon = item.icon;

              return (
                <motion.div
                  key={item.stage}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  onClick={() => setActiveStage(isSelected ? null : idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-center space-y-2 relative group ${
                    isSelected
                      ? 'bg-[#1C1C1F] border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.2)] ring-1 ring-[#22C55E]'
                      : 'bg-[#0A0A0B] border-[rgba(34,197,94,0.2)] hover:border-[#22C55E]/60 hover:-translate-y-1'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                    <StageIcon aria-hidden="true" className="w-5 h-5 stroke-current" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase text-[#A8ABB3] block tracking-wider">{item.stage}</span>
                  <div className="font-heading font-bold text-xs text-[#F2F1EC] leading-tight group-hover:text-[#22C55E] transition-colors">{item.title}</div>
                  <div className="text-[11px] text-[#9A9A9E] leading-snug">{item.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive Stage Description Drawer */}
        <AnimatePresence>
          {activeStage !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0A0A0B] text-[#F2F1EC] p-4 rounded-xl border border-[#22C55E]/30 text-xs leading-relaxed space-y-1 shadow-inner"
            >
              <div className="flex items-center justify-between text-[10px] text-[#22C55E] font-bold uppercase tracking-wider mb-1">
                <span>Stage Deep-Dive Architecture: {pipelineStages[activeStage].stage}</span>
                <span>AWS Build It Track Spec</span>
              </div>
              <p className="text-[#F2F1EC] font-medium leading-relaxed">
                {pipelineStages[activeStage].deepDive}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SECTION 2: Mandatory AWS Technology Stack Mapping Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.2)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3">
          <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#22C55E]" />
            AWS Build It Track Technology Mapping
          </h3>
          <span className="text-xs font-mono text-[#A8ABB3]">Official Hackathon Architecture</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0B] text-[#22C55E] uppercase tracking-wider font-bold border-b border-[rgba(34,197,94,0.2)]">
              <tr>
                <th className="p-3">Technology</th>
                <th className="p-3">Role in SevaRecover</th>
                <th className="p-3 text-right">AWS Judge Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(34,197,94,0.15)] text-[#F2F1EC] font-medium">
              {techMapping.map((row) => {
                const IconComp = row.icon;
                const isWhyOpen = openTechWhy[row.tech];

                return (
                  <React.Fragment key={row.tech}>
                    <tr className="hover:bg-[#1C1C1F] transition-colors group">
                      <td className="p-3 font-bold text-[#F2F1EC] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0A0A0B] group-hover:bg-[#22C55E]/20 flex items-center justify-center transition-colors border border-[rgba(34,197,94,0.2)]">
                          <IconComp className={`w-4 h-4 ${row.color}`} />
                        </div>
                        <span>{row.tech}</span>
                      </td>
                      <td className="p-3 leading-relaxed text-[#A8ABB3]">{row.role}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleTechWhy(row.tech)}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#22C55E] bg-[#22C55E]/15 hover:bg-[#22C55E]/25 px-2.5 py-1 rounded-lg border border-[#22C55E]/30 transition-colors cursor-pointer"
                        >
                          <Info className="w-3 h-3 text-[#22C55E]" />
                          <span>Why this service</span>
                          <motion.div animate={{ rotate: isWhyOpen ? 180 : 0 }}>
                            <ChevronDown className="w-3 h-3" />
                          </motion.div>
                        </button>
                      </td>
                    </tr>
                    {isWhyOpen && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#0A0A0B]">
                        <td colSpan={3} className="p-4 text-xs text-[#F2F1EC] leading-relaxed border-l-4 border-l-[#22C55E]">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 shrink-0 text-[#22C55E]" />
                            <div>
                              <strong className="text-[#22C55E] block mb-1">Why this service</strong>
                              <p className="text-[#A8ABB3]">{row.why}</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* SECTION 3: Expandable Accordion FAQ with Smooth Height Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.2)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4"
      >
        <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2 border-b border-[rgba(34,197,94,0.15)] pb-3">
          <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
          Civic Trust Scope & Non-Affiliation FAQ Accordion
        </h3>

        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const isOpen = openFaqs.includes(idx);

            return (
              <div key={faq.q} className="border border-[rgba(34,197,94,0.2)] rounded-xl overflow-hidden bg-[#0A0A0B] transition-all">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 text-left font-heading font-bold text-xs sm:text-sm text-[#F2F1EC] flex items-center justify-between hover:bg-[#1C1C1F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[#22C55E]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeInOut' }}
                      className="px-5 pb-5 pt-3 text-sm sm:text-base text-[#F2F1EC] leading-relaxed border-t border-[rgba(34,197,94,0.2)] bg-[#141416]/90 font-sans font-normal overflow-hidden"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* SECTION 4: Mandatory Technology Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#141416] text-[#F2F1EC] rounded-2xl p-6 space-y-3 border border-[rgba(34,197,94,0.3)] border-t-4 border-t-[#22C55E] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#22C55E]">
            Mandatory Technology Statement
          </h4>

          <button
            type="button"
            onClick={handleCopyStatement}
            className="flex items-center gap-1.5 text-xs text-[#22C55E] hover:text-[#F2F1EC] bg-[#0A0A0B] hover:bg-[#1C1C1F] px-3 py-1 rounded-lg transition-colors border border-[#22C55E]/30 shadow-sm cursor-pointer"
          >
            {copiedStatement ? <Check className="w-3.5 h-3.5 text-[#7A9B7E]" /> : <Copy className="w-3.5 h-3.5 text-[#22C55E]" />}
            <span>{copiedStatement ? 'Statement Copied!' : 'Copy Statement'}</span>
          </button>
        </div>

        <blockquote className="text-xs font-mono text-[#A8ABB3] leading-relaxed italic">
          &ldquo;{statementText}&rdquo;
        </blockquote>
      </motion.div>

    </div>
  );
};

export default HowItWorksPage;
