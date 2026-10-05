import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ApplicationDetails({ applications: propApps }: { applications?: any[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications: authApps } = useAuth();

  const applicationsList = propApps || authApps || [];
  const app = applicationsList.find((a: any) => a.application_id === id);

  if (!app) {
    return (
      <div className="ds-shell py-20 text-center text-[#A8ABB3]">
        <p className="text-[#F8FAFC] font-bold text-lg mb-2">Application Not Found</p>
        <p className="text-xs mb-6">No application record matching ID: <span className="font-mono text-[#22C55E]">{id}</span></p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
        >
          Back to My Saved Analyses
        </button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'done' || status === 'success') return <CheckCircle2 className="text-[var(--status-success)] bg-[var(--surface-alt)]" size={22} />;
    if (status === 'error') return <XCircle className="text-[var(--status-error)] bg-[var(--surface-alt)]" size={22} />;
    if (status === 'warning') return <AlertCircle className="text-[var(--status-warning)] bg-[var(--surface-alt)]" size={22} />;
    return <Clock className="text-indigo-400 bg-[#0A0A0B]" size={22} />;
  };

  return (
    <div className="ds-shell py-8 sm:py-12 text-[#F2F1EC]">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-[#A8ABB3] hover:text-[#22C55E] mb-8 transition-colors text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-[#141416] border border-[rgba(34,197,94,0.15)] rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2.5 py-1 rounded-md tracking-wider">
              {app.department || 'State Department'}
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-[#F8FAFC] mt-2">{app.scheme_name}</h1>
            <p className="text-xs text-[#A8ABB3] font-mono mt-1">Application Reference: {app.application_id}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#F8FAFC] block">Submitted Date</span>
            <span className="text-xs font-mono text-[#A8ABB3]">{app.date}</span>
          </div>
        </div>

        {/* Timeline Audit Trail */}
        {app.timeline && app.timeline.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} /> Audit Trail & Event Timeline
            </h3>

            <div className="relative border-l-2 border-white/10 ml-3 pl-6 space-y-6 py-2">
              {app.timeline.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[35px] top-0 bg-[#0A0A0B] p-1 rounded-full border border-white/10">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="bg-[#1C1D21] border border-white/5 p-4 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F8FAFC]">{step.event}</span>
                      <span className="text-[10px] font-mono text-[#A8ABB3]">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-[#A8ABB3]">Actor / Authority: {step.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
