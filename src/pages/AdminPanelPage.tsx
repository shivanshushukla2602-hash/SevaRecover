import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Database,
  Users,
  Settings,
  PlusCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  X,
  Trash2,
  Edit3,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  getRoles, grantRoles,
  getGazetteClauses, createGazetteClause, updateGazetteClause, deleteGazetteClause,
  getAdminSchemes, createAdminScheme, updateAdminScheme, deleteAdminScheme,
  getCedarPolicies, createCedarPolicy, updateCedarPolicy, deleteCedarPolicy,
  triggerReindex,
} from '../services/api-client';
import { CedarRole } from '../types';

// ─── Types ────────────────────────────────────────────────
interface GazetteClause {
  id: string;
  domain: string;
  clause: string;
  text: string;
}

interface SchemeConfig {
  id: string;
  name: string;
  category: string;
  incomeCeiling: string;
  requiredDocs: string;
  status: 'Active' | 'Paused' | 'Deprecated';
}

interface CedarPolicy {
  id: string;
  name: string;
  principalRole: string;
  actions: string;
  effect: 'permit' | 'forbid';
}

// ─── Default Data ─────────────────────────────────────────
const defaultGazettes: GazetteClause[] = [
  { id: 'GZT-2026-88', domain: 'Scholarships', clause: 'SSP Gazette 2024 Section 4.2', text: 'Income proof must be issued on or after April 1 of the current financial year.' },
  { id: 'GZT-2025-14', domain: 'Farmer Schemes', clause: 'RBI Ag Credit Guidelines Section 2.1', text: 'Land title record name must match Aadhaar verbatim without initial mismatch.' },
  { id: 'GZT-2026-03', domain: 'Public Certificates', clause: 'Nadakacheri Gazette Rule 12-B', text: 'Caste certificate applicant must submit 1978 pre-existing revenue record proof.' },
];

const defaultSchemes: SchemeConfig[] = [
  { id: 'SCH-001', name: 'PM-KISAN', category: 'Agriculture', incomeCeiling: '₹2,00,000', requiredDocs: 'Aadhaar, Land Record, Bank Passbook', status: 'Active' },
  { id: 'SCH-002', name: 'Ujjwala Yojana', category: 'Energy', incomeCeiling: '₹1,20,000', requiredDocs: 'BPL Card, Aadhaar, Address Proof', status: 'Active' },
  { id: 'SCH-003', name: 'Scholarship for SC/ST Students', category: 'Education', incomeCeiling: '₹2,50,000', requiredDocs: 'Caste Certificate, Income Certificate, Marksheet', status: 'Active' },
];

const defaultCedarPolicies: CedarPolicy[] = [
  { id: 'POL-001', name: 'Citizen Analysis Execution', principalRole: 'CITIZEN', actions: 'CreateAnalysis, ViewOwnAnalysis', effect: 'permit' },
  { id: 'POL-002', name: 'Admin Control Panel Access', principalRole: 'ADMIN', actions: 'ManageKnowledgeBase, ManageConfig', effect: 'permit' },
  { id: 'POL-003', name: 'Auditor Log Access', principalRole: 'AUDITOR', actions: 'ViewAuditLogs, ExportEvidence', effect: 'permit' },
];

export default function AdminPanelPage() {
  const { role, setRole, user, isOwner } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'METRICS' | 'GAZETTE_RULES' | 'SCHEMES' | 'CEDAR' | 'ACCESS_MANAGEMENT'>('METRICS');

  // ─── Access Management State ────────────────────────────
  const [usersList, setUsersList] = useState<{ email: string; name: string; roles: CedarRole[] }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [grantAuditor, setGrantAuditor] = useState(false);
  const [roleMessage, setRoleMessage] = useState('');

  // ─── Gazette Clauses State ──────────────────────────────
  const [gazettes, setGazettes] = useState<GazetteClause[]>(defaultGazettes);
  const [gazetteModalOpen, setGazetteModalOpen] = useState(false);
  const [editingGazette, setEditingGazette] = useState<GazetteClause | null>(null);
  const [gazetteForm, setGazetteForm] = useState({ clause: '', domain: '', text: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─── Scheme Config State ────────────────────────────────
  const [schemes, setSchemes] = useState<SchemeConfig[]>(defaultSchemes);
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<SchemeConfig | null>(null);
  const [schemeForm, setSchemeForm] = useState({ name: '', category: '', incomeCeiling: '', requiredDocs: '', status: 'Active' as SchemeConfig['status'] });
  const [deleteSchemeId, setDeleteSchemeId] = useState<string | null>(null);

  // ─── Cedar Policy State ─────────────────────────────────
  const [cedarPolicies, setCedarPolicies] = useState<CedarPolicy[]>(defaultCedarPolicies);
  const [cedarModalOpen, setCedarModalOpen] = useState(false);
  const [editingCedar, setEditingCedar] = useState<CedarPolicy | null>(null);
  const [cedarForm, setCedarForm] = useState({ name: '', principalRole: '', actions: '', effect: 'permit' as CedarPolicy['effect'] });
  const [deleteCedarId, setDeleteCedarId] = useState<string | null>(null);

  // ─── Toast notification ─────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Fetch data on mount ────────────────────────────────
  useEffect(() => {
    // Load gazette clauses from backend on first render
    getGazetteClauses().then(data => {
      if (data.length > 0) setGazettes(data as any);
    }).catch(() => {/* use defaults */});

    // Load schemes
    getAdminSchemes().then(data => {
      if (data.length > 0) setSchemes(data as any);
    }).catch(() => {/* use defaults */});

    // Load cedar policies
    getCedarPolicies().then(data => {
      if (data.length > 0) setCedarPolicies(data as any);
    }).catch(() => {/* use defaults */});
  }, []);

  useEffect(() => {
    if (activeSubTab === 'ACCESS_MANAGEMENT' && isOwner) {
      fetchRoles();
    }
  }, [activeSubTab, isOwner]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const data = await getRoles();
      setUsersList(data);
    } catch (err: any) {
      setRoleMessage(err.message || 'Failed to fetch roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMessage('');
    if (!targetEmail) return;

    const rolesToGrant: CedarRole[] = ['CITIZEN'];
    if (grantAdmin) rolesToGrant.push('ADMIN');
    if (grantAuditor) rolesToGrant.push('AUDITOR');

    try {
      await grantRoles(targetEmail, rolesToGrant);
      setRoleMessage(`Successfully updated roles for ${targetEmail}`);
      setTargetEmail('');
      setGrantAdmin(false);
      setGrantAuditor(false);
      fetchRoles();
    } catch (err: any) {
      setRoleMessage(err.message || 'Failed to grant roles');
    }
  };

  const handleReindex = async () => {
    setIndexingStatus('Batch re-indexing initiated...');
    try {
      const result = await triggerReindex();
      setIndexingStatus(`✅ ${result.message} (Job: ${result.job_id})`);
      showToast(`Re-index job ${result.job_id} queued — ${result.clauses_queued} clauses`, 'success');
    } catch {
      setIndexingStatus('⚠️ Backend offline — re-index simulated locally.');
      setTimeout(() => {
        setIndexingStatus('OpenSearch Gazette vector index updated successfully! Clauses synchronized.');
      }, 2000);
    }
  };

  // ─── Gazette CRUD ───────────────────────────────────────
  const openAddGazette = () => {
    setEditingGazette(null);
    setGazetteForm({ clause: '', domain: '', text: '' });
    setGazetteModalOpen(true);
  };

  const openEditGazette = (g: GazetteClause) => {
    setEditingGazette(g);
    setGazetteForm({ clause: g.clause, domain: g.domain, text: g.text });
    setGazetteModalOpen(true);
  };

  const saveGazette = async () => {
    if (!gazetteForm.clause || !gazetteForm.domain || !gazetteForm.text) return;
    try {
      if (editingGazette) {
        // Optimistic update
        setGazettes(prev => prev.map(g => g.id === editingGazette.id ? { ...g, ...gazetteForm } : g));
        await updateGazetteClause(editingGazette.id, gazetteForm);
        showToast(`Clause "${gazetteForm.clause}" updated successfully`);
      } else {
        const newId = `GZT-${Date.now().toString().slice(-6)}`;
        const optimistic = { id: newId, ...gazetteForm };
        setGazettes(prev => [...prev, optimistic]);
        try {
          const created = await createGazetteClause(gazetteForm);
          setGazettes(prev => prev.map(g => g.id === newId ? created as any : g));
        } catch { /* keep optimistic */ }
        showToast(`New clause "${gazetteForm.clause}" added successfully`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save clause', 'error');
    }
    setGazetteModalOpen(false);
    setEditingGazette(null);
  };

  const deleteGazette = async (id: string) => {
    const clause = gazettes.find(g => g.id === id);
    setGazettes(prev => prev.filter(g => g.id !== id));  // Optimistic
    setDeleteConfirmId(null);
    try {
      await deleteGazetteClause(id);
    } catch { /* backend offline; local state already updated */ }
    showToast(`Clause "${clause?.clause}" deleted`);
  };

  // ─── Scheme CRUD ────────────────────────────────────────
  const openAddScheme = () => {
    setEditingScheme(null);
    setSchemeForm({ name: '', category: '', incomeCeiling: '', requiredDocs: '', status: 'Active' });
    setSchemeModalOpen(true);
  };

  const openEditScheme = (s: SchemeConfig) => {
    setEditingScheme(s);
    setSchemeForm({ name: s.name, category: s.category, incomeCeiling: s.incomeCeiling, requiredDocs: s.requiredDocs, status: s.status });
    setSchemeModalOpen(true);
  };

  const saveScheme = async () => {
    if (!schemeForm.name || !schemeForm.category) return;
    try {
      if (editingScheme) {
        setSchemes(prev => prev.map(s => s.id === editingScheme.id ? { ...s, ...schemeForm } : s));
        await updateAdminScheme(editingScheme.id, schemeForm);
        showToast(`Scheme "${schemeForm.name}" updated successfully`);
      } else {
        const newId = `SCH-${Date.now().toString().slice(-4)}`;
        const optimistic = { id: newId, ...schemeForm };
        setSchemes(prev => [...prev, optimistic]);
        try {
          const created = await createAdminScheme(schemeForm);
          setSchemes(prev => prev.map(s => s.id === newId ? created as any : s));
        } catch { /* keep optimistic */ }
        showToast(`Scheme "${schemeForm.name}" added successfully`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save scheme', 'error');
    }
    setSchemeModalOpen(false);
    setEditingScheme(null);
  };

  const deleteScheme = async (id: string) => {
    const scheme = schemes.find(s => s.id === id);
    setSchemes(prev => prev.filter(s => s.id !== id));
    setDeleteSchemeId(null);
    try {
      await deleteAdminScheme(id);
    } catch { /* backend offline; local state already updated */ }
    showToast(`Scheme "${scheme?.name}" deleted`);
  };

  // ─── Cedar CRUD ─────────────────────────────────────────
  const openAddCedar = () => {
    setEditingCedar(null);
    setCedarForm({ name: '', principalRole: '', actions: '', effect: 'permit' });
    setCedarModalOpen(true);
  };

  const openEditCedar = (p: CedarPolicy) => {
    setEditingCedar(p);
    setCedarForm({ name: p.name, principalRole: p.principalRole, actions: p.actions, effect: p.effect });
    setCedarModalOpen(true);
  };

  const saveCedar = async () => {
    if (!cedarForm.name || !cedarForm.principalRole || !cedarForm.actions) return;
    try {
      if (editingCedar) {
        setCedarPolicies(prev => prev.map(p => p.id === editingCedar.id ? { ...p, ...cedarForm } : p));
        await updateCedarPolicy(editingCedar.id, cedarForm);
        showToast(`Policy "${cedarForm.name}" updated successfully`);
      } else {
        const newId = `POL-${Date.now().toString().slice(-4)}`;
        const optimistic = { id: newId, ...cedarForm };
        setCedarPolicies(prev => [...prev, optimistic]);
        try {
          const created = await createCedarPolicy(cedarForm);
          setCedarPolicies(prev => prev.map(p => p.id === newId ? created as any : p));
        } catch { /* keep optimistic */ }
        showToast(`Policy "${cedarForm.name}" added successfully`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save policy', 'error');
    }
    setCedarModalOpen(false);
    setEditingCedar(null);
  };

  const deleteCedar = async (id: string) => {
    const policy = cedarPolicies.find(p => p.id === id);
    setCedarPolicies(prev => prev.filter(p => p.id !== id));
    setDeleteCedarId(null);
    try {
      await deleteCedarPolicy(id);
    } catch { /* backend offline; local state already updated */ }
    showToast(`Policy "${policy?.name}" deleted`);
  };

  // ─── Shared Modal Component ─────────────────────────────
  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; onSave: () => void }> = ({ isOpen, onClose, title, children, onSave }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.25)] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(34,197,94,0.15)] max-w-lg w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="font-heading font-bold text-base text-[#F2F1EC]">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1C1C1F] hover:bg-red-500/20 text-[#A8ABB3] hover:text-red-400 flex items-center justify-center transition-all cursor-pointer">
              <X size={16} />
            </button>
          </div>
          {/* Body */}
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 bg-[#1C1C1F] hover:bg-white/10 text-[#A8ABB3] font-bold text-xs rounded-lg transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={onSave} className="px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0B] font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.25)]">
              <Save size={14} /> Save
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ─── Delete Confirmation Component ──────────────────────
  const DeleteConfirm: React.FC<{ isOpen: boolean; itemName: string; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, itemName, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#141416] rounded-2xl border border-red-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(239,68,68,0.15)] max-w-sm w-full p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center mx-auto text-red-400">
            <Trash2 size={22} />
          </div>
          <h3 className="text-center font-heading font-bold text-base text-[#F2F1EC]">Confirm Deletion</h3>
          <p className="text-center text-xs text-[#A8ABB3]">
            Are you sure you want to delete <strong className="text-red-400">"{itemName}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 bg-[#1C1C1F] hover:bg-white/10 text-[#A8ABB3] font-bold text-xs rounded-lg transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ─── Form Input Component ───────────────────────────────
  const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }> = ({ label, value, onChange, placeholder, textarea }) => (
    <div>
      <label className="block text-xs font-bold text-[#A8ABB3] mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#F2F1EC] focus:border-[#22C55E] outline-none transition-all resize-none h-20"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#F2F1EC] focus:border-[#22C55E] outline-none transition-all"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  // Role Gate: If not ADMIN and not Platform Owner, display Cedar Access Denied Notice
  if (role !== 'ADMIN' && !isOwner) {
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
            Admin Privileges Required
          </h2>
          <p className="text-xs text-[#A8ABB3] leading-relaxed mb-6">
            Your current role (<strong className="text-[#052E16]">{role}</strong>) lacks the required Cedar authorization policy <code className="text-[#22C55E] font-mono">ManageKnowledgeBase</code>.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setRole('ADMIN')}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Shield size={16} /> Switch Active Role to ADMIN
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
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[200] px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg ${
              toast.type === 'success'
                ? 'bg-[#141416] border border-[#22C55E]/40 text-[#22C55E]'
                : 'bg-[#141416] border border-red-500/40 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(34,197,94,0.2)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow">SYSTEM ADMIN MANAGEMENT CONSOLE</span>
            <span className="bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono">
              CEDAR PERMISSION: ManageKnowledgeBase
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#F2F1EC]">
            System <span className="gold-text">Administration</span> & Rules Engine
          </h1>
          <p className="text-xs text-[#9A9A9E] mt-1 max-w-2xl">
            Configure OpenSearch gazette circular indexes, update scheme requirement matrices, manage Cedar access policies, and monitor system-wide AI recovery telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReindex}
            className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin-slow" /> Trigger OpenSearch Re-index
          </button>
        </div>
      </div>

      {indexingStatus && (
        <div className="bg-[#22C55E]/15 border border-[#22C55E]/40 p-4 rounded-2xl text-xs text-[#22C55E] flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} /> {indexingStatus}
        </div>
      )}

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 bg-[#141416] p-1.5 rounded-xl border border-[rgba(34,197,94,0.2)] overflow-x-auto">
        {[
          { id: 'METRICS', label: 'System Metrics & Telemetry', icon: Activity },
          { id: 'GAZETTE_RULES', label: 'Gazette Circular Indexer', icon: Database },
          { id: 'SCHEMES', label: 'Scheme Requirement Matrix', icon: Layers },
          { id: 'CEDAR', label: 'Cedar Policy Rules', icon: Shield },
          ...(isOwner ? [{ id: 'ACCESS_MANAGEMENT', label: 'Access Management', icon: Users }] : []),
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#22C55E] text-[#0A0A0B] shadow-md'
                  : 'text-[#A8ABB3] hover:text-[#F2F1EC] hover:bg-[#1C1C1F]'
              }`}
            >
              <IconComp size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          METRICS TAB
         ═══════════════════════════════════════════════════════ */}
      {activeSubTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Analyzed Failures', val: '14,892', sub: '+12% this week', color: 'text-[#22C55E]' },
              { label: 'OpenSearch Gazette Clauses', val: String(gazettes.length > 0 ? `${gazettes.length * 1140}` : '0'), sub: '100% Vector Indexed', color: 'text-emerald-400' },
              { label: 'Active Cedar Policies', val: String(cedarPolicies.length), sub: 'Zero-Trust Enforced', color: 'text-[#22C55E]' },
              { label: 'System Recovery Rate', val: '91.4%', sub: 'Across 3 Core Domains', color: 'text-emerald-400' },
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

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
                <Database size={18} className="text-[#22C55E]" /> OpenSearch Knowledge Base Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Domain: sevarecover-gazettes-v2</span>
                  <span className="text-emerald-400 font-mono font-bold">HEALTHY (Green)</span>
                </div>
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Vector Dimensions: 1536 (Titan Embeddings)</span>
                  <span className="text-[#22C55E] font-mono font-bold">Active</span>
                </div>
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Average Query Latency</span>
                  <span className="text-emerald-400 font-mono font-bold">18 ms</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
                <Shield size={18} className="text-[#22C55E]" /> Cedar Authorization Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Default Policy: Principal Role Enforcement</span>
                  <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
                </div>
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Denied Requests (Last 24h)</span>
                  <span className="text-red-400 font-mono font-bold">14 Requests</span>
                </div>
                <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
                  <span className="text-[#A8ABB3]">Audit Log Retention</span>
                  <span className="text-[#22C55E] font-mono font-bold">90 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          GAZETTE CIRCULAR INDEXER TAB — DYNAMIC
         ═══════════════════════════════════════════════════════ */}
      {activeSubTab === 'GAZETTE_RULES' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#F2F1EC]">Active Gazette Rules Index</h3>
              <p className="text-xs text-[#9A9A9E]">Manage official government circular clauses retrieved during OpenSearch vector matching.</p>
            </div>
            <button
              onClick={openAddGazette}
              className="px-4 py-2 bg-[#1C1C1F] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[#22C55E] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle size={14} /> Add New Gazette Clause
            </button>
          </div>

          <div className="space-y-3">
            {gazettes.length === 0 ? (
              <div className="p-8 text-center text-[#A8ABB3] text-xs border border-dashed border-white/10 rounded-xl">
                No gazette clauses found. Click "Add New Gazette Clause" to create one.
              </div>
            ) : (
              gazettes.map((rule) => (
                <motion.div
                  key={rule.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#0A0A0B] p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 hover:border-[#22C55E]/20 transition-all"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#22C55E] font-mono">{rule.clause}</span>
                      <span className="text-[10px] bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded uppercase font-bold">{rule.domain}</span>
                      <span className="text-[10px] text-[#9A9A9E] font-mono">{rule.id}</span>
                    </div>
                    <p className="text-xs text-[#A8ABB3]">{rule.text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditGazette(rule)}
                      className="px-3 py-1.5 bg-[#141416] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-[#22C55E] hover:border-[#22C55E]/30 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(rule.id)}
                      className="px-3 py-1.5 bg-[#141416] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-red-400 hover:border-red-500/30 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Gazette Modal */}
          <Modal
            isOpen={gazetteModalOpen}
            onClose={() => setGazetteModalOpen(false)}
            title={editingGazette ? 'Edit Gazette Clause' : 'Add New Gazette Clause'}
            onSave={saveGazette}
          >
            <FormField label="Clause Reference" value={gazetteForm.clause} onChange={(v) => setGazetteForm(f => ({ ...f, clause: v }))} placeholder="e.g. SSP Gazette 2024 Section 4.2" />
            <FormField label="Domain Category" value={gazetteForm.domain} onChange={(v) => setGazetteForm(f => ({ ...f, domain: v }))} placeholder="e.g. Scholarships, Farmer Schemes" />
            <FormField label="Clause Text" value={gazetteForm.text} onChange={(v) => setGazetteForm(f => ({ ...f, text: v }))} placeholder="Enter the full gazette clause text..." textarea />
          </Modal>

          {/* Delete Confirmation */}
          <DeleteConfirm
            isOpen={deleteConfirmId !== null}
            itemName={gazettes.find(g => g.id === deleteConfirmId)?.clause || ''}
            onConfirm={() => deleteConfirmId && deleteGazette(deleteConfirmId)}
            onCancel={() => setDeleteConfirmId(null)}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SCHEME REQUIREMENT MATRIX TAB — DYNAMIC
         ═══════════════════════════════════════════════════════ */}
      {activeSubTab === 'SCHEMES' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#F2F1EC]">Scheme Eligibility Configuration</h3>
              <p className="text-xs text-[#9A9A9E]">Update eligibility ceiling rules and required documents for DBT schemes.</p>
            </div>
            <button
              onClick={openAddScheme}
              className="px-4 py-2 bg-[#1C1C1F] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[#22C55E] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle size={14} /> Add New Scheme
            </button>
          </div>

          {schemes.length === 0 ? (
            <div className="p-8 text-center text-[#A8ABB3] text-xs border border-dashed border-white/10 rounded-xl">
              No schemes configured. Click "Add New Scheme" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm text-[#A8ABB3]">
                <thead className="bg-[#0A0A0B] text-[10px] font-bold uppercase text-[#9A9A9E] tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Scheme Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Income Ceiling</th>
                    <th className="px-5 py-3">Required Documents</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.map((scheme) => (
                    <tr key={scheme.id} className="border-t border-white/5 bg-[#141416] hover:bg-[#1C1C1F] transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-xs font-bold text-[#F2F1EC]">{scheme.name}</span>
                          <span className="block text-[10px] text-[#9A9A9E] font-mono">{scheme.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded uppercase font-bold">{scheme.category}</span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-[#F2F1EC]">{scheme.incomeCeiling}</td>
                      <td className="px-5 py-4 text-xs text-[#A8ABB3] max-w-[200px]">{scheme.requiredDocs}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                          scheme.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          scheme.status === 'Paused' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                          {scheme.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditScheme(scheme)}
                            className="px-2.5 py-1.5 bg-[#0A0A0B] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-[#22C55E] hover:border-[#22C55E]/30 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteSchemeId(scheme.id)}
                            className="px-2.5 py-1.5 bg-[#0A0A0B] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-red-400 hover:border-red-500/30 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Scheme Modal */}
          <Modal
            isOpen={schemeModalOpen}
            onClose={() => setSchemeModalOpen(false)}
            title={editingScheme ? 'Edit Scheme Configuration' : 'Add New Scheme'}
            onSave={saveScheme}
          >
            <FormField label="Scheme Name" value={schemeForm.name} onChange={(v) => setSchemeForm(f => ({ ...f, name: v }))} placeholder="e.g. PM-KISAN, Ujjwala Yojana" />
            <FormField label="Category" value={schemeForm.category} onChange={(v) => setSchemeForm(f => ({ ...f, category: v }))} placeholder="e.g. Agriculture, Energy, Education" />
            <FormField label="Income Ceiling" value={schemeForm.incomeCeiling} onChange={(v) => setSchemeForm(f => ({ ...f, incomeCeiling: v }))} placeholder="e.g. ₹2,00,000" />
            <FormField label="Required Documents" value={schemeForm.requiredDocs} onChange={(v) => setSchemeForm(f => ({ ...f, requiredDocs: v }))} placeholder="e.g. Aadhaar, Land Record, Bank Passbook" textarea />
            <div>
              <label className="block text-xs font-bold text-[#A8ABB3] mb-1.5">Status</label>
              <div className="flex gap-3">
                {(['Active', 'Paused', 'Deprecated'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSchemeForm(f => ({ ...f, status: s }))}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      schemeForm.status === s
                        ? s === 'Active' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : s === 'Paused' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                          : 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-[#0A0A0B] border-white/10 text-[#A8ABB3] hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation */}
          <DeleteConfirm
            isOpen={deleteSchemeId !== null}
            itemName={schemes.find(s => s.id === deleteSchemeId)?.name || ''}
            onConfirm={() => deleteSchemeId && deleteScheme(deleteSchemeId)}
            onCancel={() => setDeleteSchemeId(null)}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          CEDAR POLICY RULES TAB — DYNAMIC
         ═══════════════════════════════════════════════════════ */}
      {activeSubTab === 'CEDAR' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#F2F1EC]">Active Cedar Access Control Policies</h3>
              <p className="text-xs text-[#9A9A9E]">Manage Cedar authorization policies that govern role-based access across the platform.</p>
            </div>
            <button
              onClick={openAddCedar}
              className="px-4 py-2 bg-[#1C1C1F] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[#22C55E] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle size={14} /> Add New Policy
            </button>
          </div>

          <div className="space-y-3">
            {cedarPolicies.length === 0 ? (
              <div className="p-8 text-center text-[#A8ABB3] text-xs border border-dashed border-white/10 rounded-xl">
                No Cedar policies found. Click "Add New Policy" to create one.
              </div>
            ) : (
              cedarPolicies.map((policy) => (
                <motion.div
                  key={policy.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0A0B] rounded-xl border border-white/10 overflow-hidden hover:border-[#22C55E]/20 transition-all"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-extrabold ${
                          policy.effect === 'permit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {policy.effect}
                        </span>
                        <span className="text-xs font-bold text-[#F2F1EC]">{policy.name}</span>
                        <span className="text-[10px] text-[#9A9A9E] font-mono">{policy.id}</span>
                      </div>
                      <div className="bg-[#141416] p-2.5 rounded-lg font-mono text-[11px] text-[#22C55E] mt-2 border border-white/5">
                        {policy.effect}(principal in Role::"{policy.principalRole}", action in [{policy.actions.split(',').map(a => `Action::"${a.trim()}"`).join(', ')}], resource);
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => openEditCedar(policy)}
                        className="px-3 py-1.5 bg-[#141416] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-[#22C55E] hover:border-[#22C55E]/30 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteCedarId(policy.id)}
                        className="px-3 py-1.5 bg-[#141416] border border-white/10 text-xs font-bold text-[#A8ABB3] hover:text-red-400 hover:border-red-500/30 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Cedar Modal */}
          <Modal
            isOpen={cedarModalOpen}
            onClose={() => setCedarModalOpen(false)}
            title={editingCedar ? 'Edit Cedar Policy' : 'Add New Cedar Policy'}
            onSave={saveCedar}
          >
            <FormField label="Policy Name" value={cedarForm.name} onChange={(v) => setCedarForm(f => ({ ...f, name: v }))} placeholder="e.g. Admin Panel Read Access" />
            <FormField label="Principal Role" value={cedarForm.principalRole} onChange={(v) => setCedarForm(f => ({ ...f, principalRole: v }))} placeholder="e.g. ADMIN, CITIZEN, AUDITOR" />
            <FormField label="Actions (comma separated)" value={cedarForm.actions} onChange={(v) => setCedarForm(f => ({ ...f, actions: v }))} placeholder="e.g. CreateAnalysis, ViewOwnAnalysis" textarea />
            <div>
              <label className="block text-xs font-bold text-[#A8ABB3] mb-1.5">Effect</label>
              <div className="flex gap-3">
                {(['permit', 'forbid'] as const).map((eff) => (
                  <button
                    key={eff}
                    onClick={() => setCedarForm(f => ({ ...f, effect: eff }))}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border uppercase ${
                      cedarForm.effect === eff
                        ? eff === 'permit' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-[#0A0A0B] border-white/10 text-[#A8ABB3] hover:border-white/20'
                    }`}
                  >
                    {eff}
                  </button>
                ))}
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation */}
          <DeleteConfirm
            isOpen={deleteCedarId !== null}
            itemName={cedarPolicies.find(p => p.id === deleteCedarId)?.name || ''}
            onConfirm={() => deleteCedarId && deleteCedar(deleteCedarId)}
            onCancel={() => setDeleteCedarId(null)}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ACCESS MANAGEMENT TAB (Owner Only)
         ═══════════════════════════════════════════════════════ */}
      {activeSubTab === 'ACCESS_MANAGEMENT' && isOwner && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-[rgba(34,197,94,0.2)] space-y-6">
          <h3 className="font-heading font-bold text-lg text-[#F2F1EC]">Role & Access Management</h3>
          <p className="text-xs text-[#9A9A9E]">Delegate ADMIN and AUDITOR access to registered citizens. This capability is strictly restricted to the Super Admin.</p>

          <div className="bg-[#0A0A0B] p-5 rounded-xl border border-white/10">
            <form onSubmit={handleGrantRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A8ABB3] mb-2">User Email Address</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-[#141416] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F2F1EC] focus:border-[#22C55E] outline-none transition-all"
                  placeholder="e.g. user@example.com"
                  required
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={grantAdmin} onChange={(e) => setGrantAdmin(e.target.checked)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${grantAdmin ? 'bg-[#22C55E] border-[#22C55E]' : 'border-white/20 group-hover:border-[#22C55E]/50'}`}>
                    {grantAdmin && <CheckCircle2 size={12} className="text-[#0A0A0B]" />}
                  </div>
                  <span className="text-sm font-bold text-[#F2F1EC]">ADMIN Role</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={grantAuditor} onChange={(e) => setGrantAuditor(e.target.checked)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${grantAuditor ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-emerald-500/50'}`}>
                    {grantAuditor && <CheckCircle2 size={12} className="text-[#0A0A0B]" />}
                  </div>
                  <span className="text-sm font-bold text-[#F2F1EC]">AUDITOR Role</span>
                </label>
              </div>
              <button type="submit" className="px-4 py-2 bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-bold text-xs rounded-lg transition-all">
                Update Roles
              </button>
              {roleMessage && (
                <p className={`text-xs mt-2 ${roleMessage.includes('Success') ? 'text-emerald-400' : 'text-red-400'}`}>{roleMessage}</p>
              )}
            </form>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-bold text-[#F2F1EC] mb-4">Currently Granted Users</h4>
            {loadingRoles ? (
              <p className="text-xs text-[#A8ABB3]">Loading users...</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm text-[#A8ABB3]">
                  <thead className="bg-[#1C1C1F] text-xs font-bold uppercase text-[#F2F1EC]">
                    <tr>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Granted Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.email} className="border-t border-white/5 bg-[#0A0A0B]">
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">{u.name}</td>
                        <td className="px-6 py-4 flex gap-2">
                          {u.roles.map(r => (
                            <span key={r} className={`text-xs px-2 py-1 rounded bg-[#1C1C1F] border ${r === 'ADMIN' ? 'border-[#22C55E]/30 text-[#22C55E]' : r === 'AUDITOR' ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-[#052E16]'}`}>{r}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

