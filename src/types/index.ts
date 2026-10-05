export type Language =
  | 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr' | 'bn' | 'gu'
  | 'ml' | 'pa' | 'or' | 'as' | 'ur' | 'sa'
  | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'pt' | 'ru' | 'zh' | 'ko';
export type LocalizedText = Partial<Record<Language, string>> & { en: string };

export type CedarRole = 'CITIZEN' | 'ADMIN' | 'AUDITOR';

export type FailureType =
  | 'DOCUMENT_MISSING'
  | 'DOCUMENT_EXPIRED'
  | 'DOCUMENT_INVALID'
  | 'DATA_MISMATCH'
  | 'ELIGIBILITY_FAILURE'
  | 'VERIFICATION_FAILURE'
  | 'DEADLINE_FAILURE'
  | 'PROCEDURAL_FAILURE'
  | 'PAYMENT_FAILURE'
  | 'UNKNOWN';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type AuthenticityFlag = 'verified_format' | 'unverified' | 'suspicious';

export type DeadlineProximity = 'urgent' | 'moderate' | 'none';

export interface EvidenceItem {
  id: string;
  source: string;
  section: string;
  excerpt: string;
  url?: string;
  documentType: string;
  effectiveDate: string;
}

export interface ActionStep {
  step: number;
  title: string;
  description: string;
  evidenceRef: string | null;
  locationType?: 'ONLINE' | 'CSC_IN_PERSON' | 'DEPT_OFFICE';
  estimatedDays?: string;
}

export interface ReasoningStep {
  stage: number;
  name: string;
  status: 'pending' | 'active' | 'completed';
  timestamp: string;
  details: string;
  strandsAgentLog?: string;
  opensearchQuery?: string;
  cedarPolicyDecision?: string;
}

export interface FailureAnalysis {
  id: string;
  serviceId: string;
  serviceName: string;
  domain: 'farmer' | 'scholarship' | 'certificate';
  state: string;
  department: string;
  applicationReference?: string;
  submissionDate?: string;
  failureType: FailureType;
  confidence: ConfidenceLevel;
  confidenceExplanation: string;
  whyFailedPlainLanguage: LocalizedText;
  affectedRequirement: string;
  submittedValue: string;
  requiredValue: string;
  authenticityFlag: AuthenticityFlag;
  authenticityReason: string;
  evidence: EvidenceItem[];
  recoveryAvailable: boolean;
  recoverySummary: LocalizedText;
  actionChecklist: ActionStep[];
  deadlineProximity: DeadlineProximity;
  deadlineText?: string;
  resubmissionCoverNote: string;
  resolutionPattern: {
    totalSimilarCases: number;
    resolvedCount: number;
    primarySolutionSummary: string;
  };
  reasoningTrail: ReasoningStep[];
  createdAt: string;
}

export interface ServiceDomainOption {
  id: 'farmer' | 'scholarship' | 'certificate';
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  sampleServices: string[];
}

export interface CommonServiceCentre {
  id: string;
  name: string;
  district: string;
  address: string;
  pincode: string;
  contactNumber: string;
  operatorName: string;
  workingHours: string;
  distanceKm: number;
}
