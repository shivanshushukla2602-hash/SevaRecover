import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowRight, Clock, Filter, AlertCircle, Clock3, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FailureAnalysis } from '../types';
import { ActionPlanDetailModal } from '../components/ActionPlanDetailModal';
import { getApplications, ApplicationItem } from '../services/api-client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface DashboardPageProps {
  onSelectAnalysis: (analysis: FailureAnalysis) => void;
  onNewAnalysis: () => void;
  currentAnalysis?: FailureAnalysis | null;
}

const DEFAULT_DEMO_ANALYSES: FailureAnalysis[] = [
  {
    id: 'DEMO-ANALYSIS-1',
    serviceId: 'scholarship',
    serviceName: 'Post-Matric Scholarship Reimbursement',
    domain: 'scholarship',
    state: 'Maharashtra',
    department: 'Higher Education Department',
    applicationReference: 'MAH-NMS-2026-884102',
    submissionDate: '2026-08-10',
    failureType: 'DOCUMENT_MISSING',
    confidence: 'high',
    confidenceExplanation: '100% matched against National Merit Scholarship Circular Section 4.2.',
    whyFailedPlainLanguage: {
      en: 'Missing 12th semester marksheet endorsement from College Principal.',
      hi: 'कॉलेज प्राचार्य से 12वीं सेमेस्टर अंक पत्र का समर्थन गायब है।',
      kn: 'ಕಾಲೇಜು ಪ್ರಾಂಶುಪಾಲರಿಂದ 12 ನೇ ಸೆಮಿಸ್ಟರ್ ಅಂಕಪಟ್ಟಿಯ ದೃಢೀಕರಣ ಕಾಣೆಯಾಗಿದೆ.',
      te: 'కాలేజ్ ప్రిన్సిపాల్ నుండి 12వ సెమిస్టర్ మార్క్‌షీట్ ధృవీకరణ లోపించింది.',
    },
    affectedRequirement: 'Section 4.2: Principal Attestation Seal',
    submittedValue: 'Uploaded marksheet without institutional seal',
    requiredValue: 'Physical stamp & Principal endorsement signature',
    authenticityFlag: 'verified_format',
    authenticityReason: 'Digital notice syntax matches Maharashtra Higher Education Portal.',
    evidence: [
      {
        id: 'EVID-1',
        source: 'National Merit Scholarship Guidelines 2026',
        section: 'Section 4.2',
        excerpt: 'All uploaded marksheets must bear an official institutional seal and Principal endorsement.',
        documentType: 'Official Circular',
        effectiveDate: '2026-04-01',
      },
    ],
    recoveryAvailable: true,
    recoverySummary: {
      en: 'Obtain physical stamp from College Principal and re-upload to student portal resubmission window.',
      hi: 'कॉलेज प्राचार्य से भौतिक मोहर प्राप्त करें और छात्र पोर्टल पर पुन: अपलोड करें।',
      kn: 'ಪ್ರಾಂಶುಪಾಲರಿಂದ ಅಧಿಕೃತ ಮುದ್ರೆ ಪಡೆದು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಮರು-ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      te: 'కాలేజ్ ప్రిన్సిపాల్ నుండి ఫిజికల్ స్టాంప్ పొంది పోర్టల్‌లో మళ్లీ అప్‌లోడ్ చేయండి.',
    },
    actionChecklist: [
      {
        step: 1,
        title: 'Obtain Principal Attestation',
        description: 'Take 12th marksheet to College Administrative Office for Principal stamp.',
        evidenceRef: 'EVID-1',
        locationType: 'DEPT_OFFICE',
        estimatedDays: '1 day',
      },
      {
        step: 2,
        title: 'Re-upload to NSP Student Portal',
        description: 'Upload attested PDF copy to NSP resubmission window.',
        evidenceRef: 'EVID-1',
        locationType: 'ONLINE',
        estimatedDays: '1 day',
      },
    ],
    deadlineProximity: 'urgent',
    deadlineText: '7 Days Remaining before scholarship portal closure',
    resubmissionCoverNote: 'To,\nThe Nodal Officer,\n\nSubject: Resubmission of Application MAH-NMS-2026-884102 with Principal Endorsed Marksheet.\n\nSincerely,\nAnanya Sharma',
    resolutionPattern: {
      totalSimilarCases: 1840,
      resolvedCount: 1690,
      primarySolutionSummary: '91.8% resolution rate by obtaining Principal attestation stamp.',
    },
    reasoningTrail: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'DEMO-ANALYSIS-2',
    serviceId: 'farmer',
    serviceName: 'Kisan Credit Card (KCC) Loan',
    domain: 'farmer',
    state: 'Karnataka',
    department: 'Revenue & Agriculture Department',
    applicationReference: 'KAR-KCC-2026-449120',
    submissionDate: '2026-08-14',
    failureType: 'DATA_MISMATCH',
    confidence: 'high',
    confidenceExplanation: 'Matched against RBI Agricultural Credit Guidelines Section 2.1.',
    whyFailedPlainLanguage: {
      en: 'Aadhaar name "Ramesh V. Rao" differs from Land Record (RTC) name "Ramesh Venkat Rao".',
      hi: 'आधार नाम "रमेश वी. राव" भूमि रिकॉर्ड नाम "रमेश वेंकट राव" से भिन्न है।',
      kn: 'ಆಧಾರ್ ಹೆಸರು "ರಮೇಶ್ ವಿ. ರಾವ್" ಭೂ ದಾಖಲೆ ಹೆಸರಿಗಿಂತ ಭಿನ್ನವಾಗಿದೆ.',
      te: 'ఆధార్ పేరు భూ రికార్డు పేరుతో సరిపోలలేదు.',
    },
    affectedRequirement: 'Section 2.1: UIDAI eKYC Verbatim Name Match',
    submittedValue: 'Aadhaar: "Ramesh V. Rao"',
    requiredValue: 'RTC Land Record: "Ramesh Venkat Rao"',
    authenticityFlag: 'verified_format',
    authenticityReason: 'Land Title record format verified against Karnataka Bhoomi portal.',
    evidence: [
      {
        id: 'EVID-1',
        source: 'RBI Agricultural Credit Guidelines 2025',
        section: 'Section 2.1',
        excerpt: 'Land Title record holder name must match Aadhaar eKYC verbatim.',
        documentType: 'Gazette Rules',
        effectiveDate: '2025-01-01',
      },
    ],
    recoveryAvailable: true,
    recoverySummary: {
      en: 'Submit Tehsildar Name Variation Affidavit at Village Revenue Office to align RTC with Aadhaar.',
      hi: 'ग्राम राजस्व कार्यालय में तहसीलदार नाम परिवर्तन शपथ पत्र जमा करें।',
      kn: 'ಗ್ರಾಮ ಕಂದಾಯ ಕಚೇರಿಯಲ್ಲಿ ತಹಶೀಲ್ದಾರ್ ದೃಢೀಕರಣ ಪತ್ರವನ್ನು ಸಲ್ಲಿಸಿ.',
      te: 'తహశీల్దార్ పేరు సవరణ ధృవీకరణ పత్రాన్ని రెవెన్యూ కార్యాలయంలో సమర్పించండి.',
    },
    actionChecklist: [
      {
        step: 1,
        title: 'File Tehsildar Affidavit',
        description: 'Obtain Name Variation Certificate from local Village Revenue Officer.',
        evidenceRef: 'EVID-1',
        locationType: 'DEPT_OFFICE',
        estimatedDays: '3 days',
      },
    ],
    deadlineProximity: 'moderate',
    deadlineText: '14 Days Remaining for bank verification window',
    resubmissionCoverNote: 'To,\nThe Branch Manager,\nState Bank of India,\n\nSubject: Submission of Pahani Name Variation Certificate for KCC Loan KAR-KCC-2026-449120.\n\nSincerely,\nRamesh Rao',
    resolutionPattern: {
      totalSimilarCases: 3200,
      resolvedCount: 2950,
      primarySolutionSummary: '92.1% resolution rate via Tehsildar Name Variation Certificate.',
    },
    reasoningTrail: [],
    createdAt: new Date().toISOString(),
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectAnalysis,
  onNewAnalysis,
  currentAnalysis = null,
}) => {
  const { applications, role } = useAuth();
  const { t } = useLanguage();
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [activeModalAnalysis, setActiveModalAnalysis] = useState<FailureAnalysis | null>(null);
  const [fetchedApps, setFetchedApps] = useState<ApplicationItem[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  useEffect(() => {
    getApplications()
      .then((apps) => setFetchedApps(apps))
      .catch(() => setApplicationsError(null));
  }, []);

  const DEFAULT_APP_ITEMS: ApplicationItem[] = [
    {
      application_id: "APP-STU-1001",
      scheme_id: "scholarship",
      scheme_name: "National Merit Scholarship",
      department: "Higher Education",
      date: "2026-08-10",
      status: "REJECTED",
      progress: 75,
      failure_type: "MISSING_DOCUMENTATION",
      rejection_reason: "Missing 12th semester marksheet endorsement from Principal.",
      stopped_by: "State Nodal Scholarship Officer",
      stopped_stage: "Stage 3: Institution Verification",
    },
    {
      application_id: "APP-FRM-2001",
      scheme_id: "kcc",
      scheme_name: "Kisan Credit Card Loan",
      department: "Agriculture",
      date: "2026-08-14",
      status: "REJECTED",
      progress: 60,
      failure_type: "DATA_MISMATCH",
      rejection_reason: "Aadhaar name 'Ramesh V. Rao' differs from Land Record name 'Ramesh Venkat Rao'.",
      stopped_by: "Tehsildar / Land Revenue Officer",
      stopped_stage: "Stage 2: Land Title Verification",
    },
    {
      application_id: "APP-IT-3001",
      scheme_id: "pmay",
      scheme_name: "PMAY Housing Credit Subsidy",
      department: "Housing & Urban Affairs",
      date: "2026-08-01",
      status: "REJECTED",
      progress: 70,
      failure_type: "ELIGIBILITY_FAILURE",
      rejection_reason: "Annual income ₹8.5L exceeds PMAY LIG/MIG eligibility ceiling of ₹6.0L.",
      stopped_by: "HUDCO Nodal Verification Agency",
      stopped_stage: "Stage 2: Financial Assessment",
    }
  ];

  const displayApps = fetchedApps.length > 0 ? fetchedApps : (applications.length > 0 ? applications : DEFAULT_APP_ITEMS);

  const baseAnalyses = currentAnalysis ? [currentAnalysis, ...DEFAULT_DEMO_ANALYSES] : DEFAULT_DEMO_ANALYSES;

  const filteredAnalyses = baseAnalyses.filter((item) => {
    if (filterDomain === 'ALL') return true;
    return item.domain.toLowerCase() === filterDomain.toLowerCase();
  });

  const getSparklineData = (type?: string, status?: string) => {
    if (status === 'APPROVED') {
      return [{ value: 100, fill: '#22C55E' }, { value: 0, fill: 'rgba(34,197,94,0.1)' }];
    }
    if (status === 'PENDING') {
      return [{ value: 40, fill: '#22C55E' }, { value: 60, fill: 'rgba(34,197,94,0.1)' }];
    }
    if (status === 'ACTION_REQUIRED') {
      return [{ value: 20, fill: '#EF4444' }, { value: 80, fill: 'rgba(34,197,94,0.1)' }];
    }
    return [{ value: 75, fill: '#EF4444' }, { value: 25, fill: 'rgba(34,197,94,0.1)' }];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={11} /> APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock3 size={11} /> PENDING VERIFICATION
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="text-[10px] font-extrabold uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert size={11} /> ACTION REQUIRED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={11} /> REJECTED
          </span>
        );
    }
  };

  const handleCardClick = (item: FailureAnalysis) => {
    setActiveModalAnalysis(item);
  };

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-8 text-[#F2F1EC]">
      {/* Action Plan Structured Modal */}
      <AnimatePresence>
        {activeModalAnalysis && (
          <ActionPlanDetailModal
            analysis={activeModalAnalysis}
            onClose={() => setActiveModalAnalysis(null)}
            onNewAnalysis={onNewAnalysis}
          />
        )}
      </AnimatePresence>

      {/* Role-Gated Admin Control Banner */}
      {role === 'ADMIN' && (
        <div className="bg-[#141416] border border-[#22C55E]/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22C55E] font-extrabold bg-[#22C55E]/15 px-2.5 py-0.5 rounded border border-[#22C55E]/30">
              {t('adminBannerTitle')}
            </span>
            <h3 className="font-heading font-bold text-base text-[#F2F1EC]">
              {t('adminHeading')}
            </h3>
            <p className="text-xs text-[#A8ABB3]">
              {t('adminBannerDesc')}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-xs rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            {t('adminBannerBtn')}
          </button>
        </div>
      )}

      {/* Role-Gated Auditor Control Banner */}
      {role === 'AUDITOR' && (
        <div className="bg-[#141416] border border-emerald-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
              {t('auditorBannerTitle')}
            </span>
            <h3 className="font-heading font-bold text-base text-[#F2F1EC]">
              {t('auditorHeading')}
            </h3>
            <p className="text-xs text-[#A8ABB3]">
              {t('auditorBannerDesc')}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/audit'}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] font-extrabold text-xs rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            {t('auditorBannerBtn')}
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(34,197,94,0.2)] pb-5">
        <div>
          <span className="eyebrow">{t('myAnalysesEyebrow')}</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-heading font-extrabold text-[#F2F1EC]">
            <span className="gold-text">{t('myAnalysesTitle')}</span> {t('myAnalysesTitleGold')}
          </h1>
          <p className="text-sm text-[#9A9A9E] mt-1">
            {t('myAnalysesSub')}
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="px-5 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-heading font-extrabold text-xs shadow-[0_4px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_0_25px_rgba(34,197,94,0.55)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{t('newAnalysisBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Application Status Banner from GET /applications */}
      {displayApps.length > 0 && (
        <div className="bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider">
              {t('liveAppsStatus')}
            </span>
            <span className="text-[10px] text-[#A8ABB3] font-mono">{t('cognitoSync')}</span>
          </div>

          <div className="relative border-l border-[#22C55E]/40 ml-2 pl-5 space-y-3">
            {displayApps.map((app) => (
              <div key={app.application_id} className="bg-[#0A0A0B] border border-[rgba(34,197,94,0.15)] hover:border-[#22C55E] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 relative transition-all group">
                <span className="absolute -left-[1.75rem] top-5 w-3 h-3 rounded-full bg-[#22C55E] ring-4 ring-[#141416]" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                    <span className="font-bold text-sm text-[#F2F1EC] group-hover:text-[#22C55E] transition-colors">
                      {app.scheme_name}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-[10px] text-[#A8ABB3] font-mono">
                    ID: {app.application_id} • Date: {app.date}
                  </p>
                  {app.rejection_reason && (
                    <p className="text-xs text-[#F2F1EC] mt-1.5 italic bg-[#141416] p-2.5 rounded-lg border border-[rgba(34,197,94,0.1)]">
                      &quot;{app.rejection_reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {applicationsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300" role="alert">
          {applicationsError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-xl p-1.5 w-full sm:w-fit max-w-full">
        <Filter className="w-4 h-4 text-[#A8ABB3] ml-2 mr-1" />
        {[
          { id: 'ALL', label: t('filterAll') },
          { id: 'SCHOLARSHIP', label: t('filterScholarship') },
          { id: 'FARMER', label: t('filterFarmer') },
          { id: 'CERTIFICATE', label: t('filterCert') },
        ].map((dom) => (
          <button
            key={dom.id}
            onClick={() => setFilterDomain(dom.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              filterDomain === dom.id ? 'text-[#0A0A0B] font-extrabold' : 'text-[#A8ABB3] hover:text-[#F2F1EC]'
            }`}
          >
            {filterDomain === dom.id && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 bg-[#22C55E] rounded-lg -z-10 shadow-[0_2px_10px_rgba(34,197,94,0.3)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {dom.label}
          </button>
        ))}
      </div>

      {/* Grid of Saved Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-0 sm:pl-5 border-l-0 sm:border-l border-[rgba(34,197,94,0.15)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredAnalyses.map((item) => {
            const chartData = getSparklineData(item.failureType);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => handleCardClick(item)}
                className="bg-[#141416] border border-[rgba(34,197,94,0.2)] hover:border-[#22C55E] rounded-2xl p-5 cursor-pointer flex flex-col justify-between group space-y-4 relative overflow-hidden min-h-[220px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all"
              >
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full">
                        {item.domain}
                      </span>
                      <span className="text-[10px] text-[#A8ABB3] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#22C55E]" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-[#F2F1EC] group-hover:text-[#22C55E] transition-colors leading-snug">
                      {item.serviceName}
                    </h3>
                  </div>

                  <div className="bg-[#0A0A0B] p-3.5 rounded-xl border border-[rgba(34,197,94,0.15)] flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-[#A8ABB3] block text-[10px] uppercase tracking-wider">{t('failureCategoryLabel')}</span>
                      <span className="font-mono text-xs text-[#22C55E] font-bold">{item.failureType}</span>
                    </div>

                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <PieChart width={40} height={40}>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          cx={20}
                          cy={20}
                          innerRadius={10}
                          outerRadius={18}
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(34,197,94,0.15)] flex items-center justify-between text-xs font-bold text-[#22C55E] group-hover:text-[#22C55E] shrink-0">
                  <span>{t('viewActionPlan')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {filteredAnalyses.length === 0 && (
        <p className="text-sm text-[#A8ABB3]">{t('noAnalysesText')}</p>
      )}
    </div>
  );
};

export default DashboardPage;
