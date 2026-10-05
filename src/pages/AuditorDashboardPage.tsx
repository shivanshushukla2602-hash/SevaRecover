import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  ShieldCheck,
  FileCheck2,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Database,
  ArrowRight,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function AuditorDashboardPage() {
  const { role, setRole, isOwner } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<'ALL' | 'CEDAR_ALLOW' | 'CEDAR_DENY' | 'RAG_MATCH'>('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const MOCK_AUDIT_LOGS = [
    {
      id: 'AUD-90412',
      timestamp: new Date().toLocaleTimeString(),
      principalRole: 'Role::CITIZEN',
      cedarDecision: 'ALLOW',
      action: 'Action::CreateAnalysis',
      domain: 'Scholarship',
      opensearchQuery: 'GET /sevarecover-kb/_search { "query": { "match": { "content": "Income Certificate" } } }',
      clauseMatched: 'SSP Gazette 2024 Section 4.2',
      ragSimilarity: '96.2%',
      anonymizedCitizenHash: '0x8f3...a9b2',
    },
    {
      id: 'AUD-90411',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      principalRole: 'Role::CITIZEN',
      cedarDecision: 'ALLOW',
      action: 'Action::ViewOwnAnalysis',
      domain: 'Farmer',
      opensearchQuery: 'GET /sevarecover-kb/_search { "query": { "match": { "content": "RTC Pahani Name" } } }',
      clauseMatched: 'RBI Ag Credit Guidelines Section 2.1',
      ragSimilarity: '92.8%',
      anonymizedCitizenHash: '0x7c2...e1f4',
    },
    {
      id: 'AUD-90410',
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
      principalRole: 'Role::CITIZEN',
      cedarDecision: 'DENY',
      action: 'Action::ManageKnowledgeBase',
      domain: 'System',
      opensearchQuery: 'N/A — Blocked by Cedar Auth Policy',
      clauseMatched: 'N/A',
      ragSimilarity: '0%',
      anonymizedCitizenHash: '0x3d1...c889',
    },
    {
      id: 'AUD-90409',
      timestamp: new Date(Date.now() - 1200000).toLocaleTimeString(),
      principalRole: 'Role::AUDITOR',
      cedarDecision: 'ALLOW',
      action: 'Action::InspectReasoningTrace',
      domain: 'Certificates',
      opensearchQuery: 'GET /sevarecover-audit/_search',
      clauseMatched: 'Nadakacheri Gazette Rule 12-B',
      ragSimilarity: '88.5%',
      anonymizedCitizenHash: '0x1a9...d442',
    },
  ];

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    if (filterType === 'CEDAR_ALLOW') return log.cedarDecision === 'ALLOW';
    if (filterType === 'CEDAR_DENY') return log.cedarDecision === 'DENY';
    if (filterType === 'RAG_MATCH') return parseFloat(log.ragSimilarity) > 90;
    return true;
  });

  // Role Gate: If CITIZEN and not Platform Owner, display Cedar Authorization Access Denied
  if (role === 'CITIZEN' && !isOwner) {
    return (
      <div className="ds-shell py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#141416] border border-red-500/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
        >
          <div className="w-16 h-16 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock size={32} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 font-bold block mb-2">
            CEDAR AUTHORIZATION: DECISION DENY
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-[#F2F1EC] mb-2">
            Auditor Access Restricted
          </h2>
          <p className="text-xs text-[#A8ABB3] leading-relaxed mb-6">
            Your current role (<strong className="text-[#052E16]">CITIZEN</strong>) lacks the required authorization policy <code className="text-[#22C55E] font-mono">InspectReasoningTrace</code> to view system audit logs.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setRole('AUDITOR')}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Eye size={16} /> Switch Active Role to AUDITOR
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-[#1C1C1F] hover:bg-white/10 text-[#A8ABB3] font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Return to Citizen Portal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-8 text-[#F2F1EC]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(34,197,94,0.2)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow">SYSTEM COMPLIANCE & AUDIT TRAIL</span>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono">
              CEDAR PERMISSION: InspectReasoningTrace
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#F2F1EC]">
            Auditor <span className="gold-text">Compliance Logs</span> & Evidence Replay
          </h1>
          <p className="text-xs text-[#9A9A9E] mt-1 max-w-2xl">
            Inspect real-time Cedar policy enforcement logs, OpenSearch gazette vector similarity scores, and evidence reasoning chains for independent civic compliance auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#141416] p-3 rounded-xl border border-[rgba(34,197,94,0.2)] flex items-center gap-2 text-xs font-mono">
            <Eye size={16} className="text-[#22C55E]" />
            <span className="text-[#22C55E] font-bold">Oversight Mode Active</span>
          </div>
        </div>
      </div>

      {/* Auditor Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cedar Decision Allow Rate', val: '99.1%', sub: '14,878 Allowed', color: 'text-emerald-400' },
          { label: 'Cedar Denied Invocations', val: '14', sub: 'Unauthorized Invocations', color: 'text-red-400' },
          { label: 'Avg Vector Similarity', val: '94.2%', sub: 'Titan Embedding Match', color: 'text-[#22C55E]' },
          { label: 'Evidence Hash Verification', val: '100%', sub: 'Immutable Digest Match', color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141416] p-5 rounded-2xl border border-[rgba(34,197,94,0.2)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8ABB3] block mb-1">
              {stat.label}
            </span>
            <span className={`text-3xl font-heading font-extrabold ${stat.color} block`}>
              {stat.val}
            </span>
            <span className="text-[11px] text-[#9A9A9E] mt-1 block font-mono">
              {stat.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-4 bg-[#141416] p-3 rounded-2xl border border-[rgba(34,197,94,0.2)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A8ABB3]">
          <Filter size={14} className="text-[#22C55E]" /> Filter Audit Feed:
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Logs' },
            { id: 'CEDAR_ALLOW', label: 'Cedar ALLOW' },
            { id: 'CEDAR_DENY', label: 'Cedar DENY' },
            { id: 'RAG_MATCH', label: 'High RAG (>90%)' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === btn.id
                  ? 'bg-[#22C55E] text-[#0A0A0B]'
                  : 'bg-[#1C1C1F] text-[#A8ABB3] hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table Feed */}
      <div className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.2)] overflow-hidden shadow-lg">
        <div className="p-4 bg-[#1C1C1F] border-b border-[rgba(34,197,94,0.15)] flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-[#F2F1EC] flex items-center gap-2">
            <Activity size={16} className="text-[#22C55E]" /> Cedar & OpenSearch Real-Time Verification Trail
          </h3>
          <span className="text-[10px] font-mono text-[#A8ABB3]">{filteredLogs.length} audit entries matching filter</span>
        </div>

        <div className="divide-y divide-[rgba(34,197,94,0.1)]">
          {filteredLogs.map((log) => {
            const isDeny = log.cedarDecision === 'DENY';
            return (
              <div
                key={log.id}
                onClick={() => setSelectedAuditLog(log)}
                className="p-4 hover:bg-[#1C1C1F]/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#22C55E]">{log.id}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        isDeny
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {log.cedarDecision}
                    </span>
                    <span className="text-[10px] font-mono text-[#A8ABB3] bg-[#0A0A0B] px-2 py-0.5 rounded border border-white/5">
                      {log.principalRole}
                    </span>
                    <span className="text-[10px] font-mono text-[#9A9A9E]">{log.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#F2F1EC] font-semibold">
                    {log.action} &bull; Domain: <span className="text-[#22C55E]">{log.domain}</span>
                  </p>

                  <p className="text-[11px] text-[#A8ABB3] font-mono">
                    Clause: {log.clauseMatched} (Similarity: <span className="text-emerald-400 font-bold">{log.ragSimilarity}</span>)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#A8ABB3] font-mono bg-[#0A0A0B] px-2.5 py-1 rounded border border-white/5">
                    Hash: {log.anonymizedCitizenHash}
                  </span>
                  <button className="px-3 py-1.5 bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/30 font-bold text-[11px] rounded-lg cursor-pointer">
                    Inspect Reasoning Trail &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Inspection Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#22C55E]/40 rounded-2xl p-6 max-w-2xl w-full space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-sans">
              <h3 className="font-bold text-base text-[#F2F1EC] flex items-center gap-2">
                <Code2 className="text-[#22C55E]" /> Auditor Trace Inspection: {selectedAuditLog.id}
              </h3>
              <button onClick={() => setSelectedAuditLog(null)} className="text-[#A8ABB3] hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="bg-[#0A0A0B] p-4 rounded-xl space-y-2 border border-white/10">
              <p className="text-emerald-400 font-bold">// Cedar Authorization Decision</p>
              <p className="text-white">DECISION: {selectedAuditLog.cedarDecision} (Principal: {selectedAuditLog.principalRole})</p>
              <p className="text-emerald-400 font-bold mt-3">// OpenSearch Vector Query Executed</p>
              <p className="text-[#22C55E]">{selectedAuditLog.opensearchQuery}</p>
              <p className="text-emerald-400 font-bold mt-3">// Gazette Clause Retrieval Result</p>
              <p className="text-white">Matched Clause: {selectedAuditLog.clauseMatched}</p>
              <p className="text-white">Similarity Score: {selectedAuditLog.ragSimilarity}</p>
            </div>

            <button
              onClick={() => setSelectedAuditLog(null)}
              className="w-full py-2.5 bg-[#1C1C1F] hover:bg-white/10 text-white font-bold text-xs rounded-xl font-sans cursor-pointer"
            >
              Close Auditor Inspection Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
