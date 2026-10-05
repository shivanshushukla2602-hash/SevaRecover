import { FailureAnalysis, ServiceDomainOption, CommonServiceCentre } from '../types';

export const MOCK_SERVICE_DOMAINS: ServiceDomainOption[] = [
  {
    id: 'scholarship',
    title: {
      en: 'Scholarships & Education Grants',
      hi: 'छात्रवृत्ति एवं शिक्षा अनुदान',
      kn: 'ಶಿಷ್ಯವೇತನ ಮತ್ತು ಶಿಕ್ಷಣ ಅನುದಾನ',
      te: 'విద్యార్థి వేతనాలు & విద్యా గ్రాంట్లు',
    },
    description: {
      en: 'State Post-Matric, National Merit, NSP, and Pre-Matric financial assistance schemes.',
      hi: 'राज्य पोस्ट-मैट्रिक, राष्ट्रीय योग्यता, एनएसपी एवं प्री-मैट्रिक वित्तीय सहायता योजनाएं।',
      kn: 'ರಾಜ್ಯ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್, ರಾಷ್ಟ್ರೀಯ ಮೆರಿಟ್, ಎನ್‌ಎಸ್‌ಪಿ ಮತ್ತು ಪ್ರಿ-ಮೆಟ್ರಿಕ್ ಧನಸಹಾಯ ಯೋಜನೆಗಳು.',
      te: 'రాష్ట్ర పోస్ట్-మెట్రిక్, నేషనల్ మెరిట్, NSP మరియు ప్రీ-మెట్రిక్ ఆర్థిక సహాయ పథకాలు.',
    },
    icon: 'GraduationCap',
    sampleServices: ['Post-Matric Scholarship FY 2025-26', 'National Means-cum-Merit Scholarship', 'State Girl Child Higher Education Grant']
  },
  {
    id: 'farmer',
    title: {
      en: 'Farmer Schemes & DBTs',
      hi: 'किसान योजनाएं एवं डीबीटी',
      kn: 'ರೈತ ಯೋಜನೆಗಳು ಮತ್ತು ಡಿಬಿಟಿ',
      te: 'రైతు పథకాలు & డిబిటి',
    },
    description: {
      en: 'PM-KISAN Samman Nidhi, Crop Insurance (PMFBY), Solar Pump Subsidies, and Soil Health Support.',
      hi: 'पीएम-किसान सम्मान निधि, फसल बीमा (पीएमएफबीवाई), सौर पंप सब्सिडी एवं मृदा स्वास्थ्य सहायता।',
      kn: 'ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ, ಬೆಳೆ ವಿಮೆ (ಪಿಎಂಎಫ್‌ಬಿವೈ), ಸೌರ ಪಂಪ್ ಸಬ್ಸಿಡಿ.',
      te: 'పిఎం-కిసాన్ సమ్మాన్ నిధి, పంటల బీమా (PMFBY), సోలార్ పంప్ సబ్సిడీలు.',
    },
    icon: 'Sprout',
    sampleServices: ['PM-KISAN 17th Installment Disbursement', 'Pradhan Mantri Fasal Bima Yojana', 'Kisan Credit Card Subsidy']
  },
  {
    id: 'certificate',
    title: {
      en: 'Certificates & Public Services',
      hi: 'प्रमाणपत्र एवं सार्वजनिक सेवाएं',
      kn: 'ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು',
      te: 'ధృవీకరణ పత్రాలు & ప్రజా సేవలు',
    },
    description: {
      en: 'Income Certificates, Caste/Tribe Certificates, Domicile/Residence Proofs, Ration Cards, and Land Records.',
      hi: 'आय प्रमाण पत्र, जाति प्रमाण पत्र, मूल निवास प्रमाण पत्र, राशन कार्ड एवं भू-अभिलेख।',
      kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರಗಳು, ಜಾತಿ ಪ್ರಮಾಣಪತ್ರಗಳು, ವಾಸಸ್ಥಳ ದೃಢೀಕರಣ, ಪಡಿತರ ಚೀಟಿಗಳು.',
      te: 'ఆదాయ ధృవీకరణ పత్రాలు, కుల ధృవీకరణ పత్రాలు, నివాస ధృవీకరణ పత్రాలు, రేషన్ కార్డులు.',
    },
    icon: 'FileCheck',
    sampleServices: ['State E-District Income Certificate', 'Caste & Validity Verification', 'Ration Card Member Inclusion']
  }
];

export const MOCK_FAILURES: Record<string, FailureAnalysis> = {
  'SCHOLARSHIP_001': {
    id: 'SCHOLARSHIP_001',
    serviceId: 'SCHOLARSHIP_POST_MATRIC_2025',
    serviceName: 'Post-Matric Fee Reimbursement & Merit Scholarship 2025-26',
    domain: 'scholarship',
    state: 'Karnataka',
    department: 'Department of Social Welfare & Higher Education',
    applicationReference: 'KAR-SSP-2025-948210',
    submissionDate: '2025-08-14',
    failureType: 'DOCUMENT_EXPIRED',
    confidence: 'high',
    confidenceExplanation: 'Matched rejection code SSP-ERR-INC-402 directly against State Social Welfare Circular No. SWD/88/2024 with 98.4% vector similarity in OpenSearch.',
    whyFailedPlainLanguage: {
      en: 'Your application was rejected because the Income Certificate submitted (No. RD00384912023) was issued on March 12, 2023, for Financial Year 2022-23. State Scholarship regulations require an Income Certificate issued on or after April 1, 2024 (valid for FY 2024-25 / 2025-26).',
      hi: 'आपका आवेदन इसलिए खारिज कर दिया गया क्योंकि जमा किया गया आय प्रमाण पत्र (सं. RD00384912023) 12 मार्च 2023 को वित्तीय वर्ष 2022-23 के लिए जारी किया गया था। छात्रवृत्ति नियमों के अनुसार 1 अप्रैल 2024 के बाद जारी किया गया नया आय प्रमाण पत्र अनिवार्य है।',
      kn: 'ಸಲ್ಲಿಸಿದ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವು (ಸಂ. RD00384912023) ಮಾರ್ಚ್ 12, 2023 ರಂದು ಹಳೆಯ ಆರ್ಥಿಕ ವರ್ಷಕ್ಕೆ ನೀಡಿರುವುದರಿಂದ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಏಪ್ರಿಲ್ 1, 2024 ರ ನಂತರ ನೀಡಲಾದ ಹೊಸ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಕಡ್ಡಾಯವಾಗಿದೆ.',
      te: 'సమర్పించిన ఆదాయ ధృవీకరణ పత్రం (నెం. RD00384912023) పాత ఆర్థిక సంవత్సరానికి చెందినది కావడం వల్ల మీ అప్లికేషన్ తిరస్కరించబడింది. ఏప్రిల్ 1, 2024 తర్వాత జారీ చేసిన కొత్త పత్రం అవసరం.',
    },
    affectedRequirement: 'Clause 4.2: Mandatory Submission of Revenue Certificate Issued for Current Assessment Year (AY 2025-26)',
    submittedValue: 'Certificate Issued Date: 12-03-2023 (AY 2023-24 Income Proof)',
    requiredValue: 'Certificate Issued Date: >= 01-04-2024 (AY 2025-26 Valid Proof)',
    authenticityFlag: 'verified_format',
    authenticityReason: 'Official rejection notice header matches authentic Karnataka Seva Sindhu / SSP portal digital signature format.',
    evidence: [
      {
        id: 'EVID-SSP-01',
        source: 'Karnataka State Scholarship Portal (SSP) Gazette Notification 2024-25',
        section: 'Section 4, Sub-clause 2 (Mandatory Revenue Proofs)',
        excerpt: 'All post-matric scholarship applicants must upload an e-Attested Nadakacheri Income Certificate issued by the competent Revenue Officer (Tahsildar) on or after 1st April of the current financial year. Certificates bearing prior fiscal dates shall be automatically rejected during automated document verification.',
        url: 'https://ssp.karnataka.gov.in/docs/guidelines_2024.pdf',
        documentType: 'Official Government Circular',
        effectiveDate: '2024-04-01'
      },
      {
        id: 'EVID-SSP-02',
        source: 'Department of Revenue Order No. RD 157 LRC 2023',
        section: 'Paragraph 6 (Validity Period of Family Income Certs)',
        excerpt: 'An Income Certificate issued for scholarship entitlement carries a statutory validity of 1 (one) financial year expiring on March 31st of the succeeding calendar year.',
        documentType: 'Revenue Order',
        effectiveDate: '2023-11-15'
      }
    ],
    recoveryAvailable: true,
    recoverySummary: {
      en: 'Obtain a fresh Income Certificate from Nadakacheri/e-District portal (takes 3-5 days) and submit a representation note to your District Social Welfare Officer before the appeal deadline.',
      hi: 'ई-डिस्ट्रिक्ट/नाडाकचेरी पोर्टल से नया आय प्रमाण पत्र प्राप्त करें (3-5 दिन लगेंगे) और अपील की अंतिम तिथि से पहले अपने जिला समाज कल्याण अधिकारी को एक नया आवेदन पत्र जमा करें।',
      kn: 'ನಾಡಕಚೇರಿ/ಇ-ಡಿಸ್ಟ್ರಿಕ್ಟ್ ಪೋರ್ಟಲ್‌ನಿಂದ ಹೊಸ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ (3-5 ದಿನಗಳು) ಮತ್ತು ಜಿಲ್ಲಾ ಸಮಾಜ ಕಲ್ಯಾಣಾಧಿಕಾರಿಗಳಿಗೆ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ.',
      te: 'ఈ-డిస్ట్రిక్ట్ పోర్టల్ నుండి కొత్త ఆదాయ ధృవీకరణ పత్రాన్ని పొంది (3-5 రోజులు) జిల్లా సాంఘిక సంక్షేమాధికారికి విజ్ఞప్తి పత్రం సమర్పించండి.',
    },
    actionChecklist: [
      {
        step: 1,
        title: 'Apply for Fresh Income Certificate Online',
        description: 'Log in to Nadakacheri / e-District portal or visit nearest CSC. Submit recent salary slip/ration card for FY 2024-25.',
        evidenceRef: 'EVID-SSP-02',
        locationType: 'CSC_IN_PERSON',
        estimatedDays: '3 Days'
      },
      {
        step: 2,
        title: 'Perform e-Attestation on SSP Student Portal',
        description: 'Once the RD number for the new certificate is generated, enter the RD number on the SSP e-Attestation portal tab.',
        evidenceRef: 'EVID-SSP-01',
        locationType: 'ONLINE',
        estimatedDays: '1 Day'
      },
      {
        step: 3,
        title: 'Attach Auto-Drafted Cover Note & Resubmit Application',
        description: 'Download the resubmission cover note generated below, sign it, and upload alongside the new RD Certificate.',
        evidenceRef: 'EVID-SSP-01',
        locationType: 'ONLINE',
        estimatedDays: 'Immediate'
      }
    ],
    deadlineProximity: 'urgent',
    deadlineText: 'Grievance submission portal window closes in 6 days (Sept 25, 2026)',
    resubmissionCoverNote: `To,
The District Social Welfare Officer / Member Secretary,
State Scholarship Portal Grievance Cell,
District Collectorate Campus.

Subject: Resubmission of Application No. KAR-SSP-2025-948210 (Post-Matric Scholarship 2025-26) with Corrected Current-FY Income Certificate.

Respected Sir/Madam,

I had submitted an application for the Post-Matric Scholarship 2025-26 under Application Reference KAR-SSP-2025-948210. My application was rejected under Code SSP-ERR-INC-402 due to an outdated Income Certificate.

In strict compliance with Clause 4.2 of SSP Gazette Notification 2024-25, I have now obtained a fresh e-Attested Nadakacheri Income Certificate (RD Number: RD00499212025) issued for FY 2024-25/2025-26. 

I request your good office to kindly reconsider my application and restore my fee reimbursement eligibility.

Thanking You,
Yours faithfully,
[Applicant Name]
Ref: KAR-SSP-2025-948210
Date: 19th September 2026`,
    resolutionPattern: {
      totalSimilarCases: 240,
      resolvedCount: 218,
      primarySolutionSummary: '90.8% of students resolved this issue by uploading a fresh Nadakacheri RD certificate issued after April 1st.'
    },
    reasoningTrail: [
      {
        stage: 1,
        name: 'Input Ingestion',
        status: 'completed',
        timestamp: '11:22:45.102',
        details: 'Received document submission KAR-SSP-2025-948210. Input contains rejection letter screenshot and plain text error code SSP-ERR-INC-402.',
        strandsAgentLog: '[StrandsAgent] Ingested raw input payload. Context identified: Domain=scholarship, State=Karnataka.',
        cedarPolicyDecision: 'PERMITted under Cedar Rule Citizen::UploadEvidence'
      },
      {
        stage: 2,
        name: 'Rejection Notice Authenticity Check',
        status: 'completed',
        timestamp: '11:22:45.310',
        details: 'Verified digital letterhead and reference structure. No fraudulent fee payment demands found.',
        strandsAgentLog: '[Tool:verify_notice_authenticity] Verified format against authentic Karnataka Seva Sindhu template database.',
        cedarPolicyDecision: 'PERMITted under Cedar Rule Auditor::VerifyAuthenticityRules'
      },
      {
        stage: 3,
        name: 'Amazon OpenSearch RAG Retrieval',
        status: 'completed',
        timestamp: '11:22:45.890',
        details: 'Queried OpenSearch index "sevarecover-kb" with metadata filter [service="SSP", state="Karnataka"]. Retrieved 2 matching clause documents.',
        opensearchQuery: 'GET /sevarecover-kb/_search?q=SSP-ERR-INC-402 AND clause:income_certificate',
      },
      {
        stage: 4,
        name: 'Evidence Comparison',
        status: 'completed',
        timestamp: '11:22:46.210',
        details: 'Extracted submitted certificate date (12-03-2023) vs required minimum cutoff date (01-04-2024). Identified 1-year mismatch.',
      },
      {
        stage: 5,
        name: 'Failure Classification & Recovery Synthesis',
        status: 'completed',
        timestamp: '11:22:46.640',
        details: 'Classified failure as DOCUMENT_EXPIRED (Confidence: HIGH). Generated 3-step action checklist and resubmission cover note citing Section 4.2.',
      }
    ],
    createdAt: '2026-09-19T10:15:00Z'
  },
  'FARMER_002': {
    id: 'FARMER_002',
    serviceId: 'PM_KISAN_17TH_INSTALLMENT',
    serviceName: 'PM-KISAN Samman Nidhi Direct Benefit Transfer (17th Installment)',
    domain: 'farmer',
    state: 'Maharashtra',
    department: 'Department of Agriculture & Land Records',
    applicationReference: 'MH-PMK-8839201',
    submissionDate: '2025-07-28',
    failureType: 'DATA_MISMATCH',
    confidence: 'high',
    confidenceExplanation: 'Matched rejection reason "Land Record Name Mismatch / eKYC Unverified" against PM-KISAN Operational Guidelines Section 8.1.',
    whyFailedPlainLanguage: {
      en: 'Your PM-KISAN DBT installment was put on hold because your landholding record (7/12 Extract) lists your name as "Rameshwar B. Patil" whereas your Aadhaar eKYC card lists "Rameshwar Bapurao Patil". The automated PM-KISAN portal system requires an exact string match or a linked land mutation certificate.',
      hi: 'आपकी पीएम-किसान सम्मान निधि की किस्त इसलिए रोक दी गई क्योंकि आपके भू-अभिलेख (7/12 एक्सट्रैक्ट) में आपका नाम "रामेश्वर बी. पाटिल" लिखा है, जबकि आधार कार्ड में "रामेश्वर बापूराव पाटिल" है। नाम में असमानता के कारण सिस्टम ने ई-केवाईसी रोक दिया।',
      kn: 'ನಿಮ್ಮ ಪಿಎಂ-ಕಿಸಾನ್ ಕಂತನ್ನು ತಡೆಹಿಡಿಯಲಾಗಿದೆ ಏಕೆಂದರೆ ನಿಮ್ಮ ಜಮೀನು ದಾಖಲೆಯಲ್ಲಿ (7/12) ಹೆಸರು "ರಾಮೇಶ್ವರ್ ಬಿ. ಪಾಟೀಲ್" ಎಂದಿದೆ, ಆದರೆ ಆಧಾರ್‌ನಲ್ಲಿ "ರಾಮೇಶ್ವರ್ ಬಾಪೂರಾವ್ ಪಾಟೀಲ್" ಎಂದಿದೆ.',
      te: 'మీ భూమి రికార్డు (7/12) లో మీ పేరు "రామేశ్వర్ బి. పాటిల్" అని ఉండగా, ఆధార్‌లో "రామేశ్వర్ బాపూరావు పాటిల్" అని ఉండటం వల్ల పిఎం-కిసాన్ సాయం నిలిపివేయబడింది.',
    },
    affectedRequirement: 'Section 8.1: Mandatory Phonetic & String Matching Between State Land Registry (MahaBhulekh) and UIDAI Aadhaar Vault',
    submittedValue: 'Name on 7/12 Land Record: Rameshwar B. Patil',
    requiredValue: 'Name on Aadhaar Card: Rameshwar Bapurao Patil (Exact Legal Match)',
    authenticityFlag: 'verified_format',
    authenticityReason: 'Rejection SMS/Portal Notice verified against Ministry of Agriculture & Farmers Welfare official notification schema.',
    evidence: [
      {
        id: 'EVID-PMK-01',
        source: 'PM-KISAN Central Operational Guidelines (Revised 2024)',
        section: 'Chapter III, Clause 8 (Land Seeding & Name Reconciliation)',
        excerpt: 'In cases where the landholder name in the State Land Record database differs in initials or spelling from the Aadhaar card name, the farmer may submit a Form-8A Land Name Correction Certificate issued by the jurisdictional Revenue Circle Officer (Talathi/Patwari) to trigger automated DBT release.',
        documentType: 'Central Scheme Directive',
        effectiveDate: '2024-01-10'
      }
    ],
    recoveryAvailable: true,
    recoverySummary: {
      en: 'Request a Name Alignment Affidavit / Form-8A Land Name Linkage from your local Talathi office and upload it on the MahaBhulekh PM-KISAN Correction portal.',
      hi: 'अपने स्थानीय तलाठी कार्यालय से नाम संरेखण हलफनामा / फॉर्म-8ए प्राप्त करें और इसे महाभूलेख पीएम-किसान पोर्टल पर अपलोड करें।',
      kn: 'ತಲಾಠಿ ಕಚೇರಿಯಿಂದ ಹೆಸರು ತಿದ್ದುಪಡಿ ಪ್ರಮಾಣಪತ್ರ (ಫಾರ್ಮ್-8ಎ) ಪಡೆದು ಮಹಾಭೂಲೇಖ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      te: 'మీ తలాటీ కార్యాలయం నుండి పేరు దిద్దుబాటు పత్రం (ఫారమ్-8ఎ) పొంది మహాభూలేఖ్ పోర్టల్‌లో అప్‌లోడ్ చేయండి.',
    },
    actionChecklist: [
      {
        step: 1,
        title: 'Visit Local Talathi / Patwari Revenue Office',
        description: 'Carry 7/12 extract and Aadhaar copy. Request Form-8A Name Reconciliation Certificate.',
        evidenceRef: 'EVID-PMK-01',
        locationType: 'DEPT_OFFICE',
        estimatedDays: '2 Days'
      },
      {
        step: 2,
        title: 'Upload Form-8A on PM-KISAN Farmer Corner Portal',
        description: 'Navigate to PM-KISAN portal -> "Edit Name as per Aadhaar / Update Land Details" tab.',
        evidenceRef: 'EVID-PMK-01',
        locationType: 'ONLINE',
        estimatedDays: '1 Day'
      },
      {
        step: 3,
        title: 'Verify Aadhaar eKYC via OTP',
        description: 'Complete biometric/biometric face-rd or OTP verification on the PM-KISAN mobile application.',
        evidenceRef: 'EVID-PMK-01',
        locationType: 'ONLINE',
        estimatedDays: 'Immediate'
      }
    ],
    deadlineProximity: 'moderate',
    deadlineText: 'Next disbursement processing cycle starts in 18 days',
    resubmissionCoverNote: `To,
The District Agriculture Officer / PM-KISAN Nodal Officer,
Department of Agriculture,
District Collectorate Complex.

Subject: Submission of Form-8A Land Name Reconciliation Certificate for PM-KISAN Reference MH-PMK-8839201.

Respected Sir,

My PM-KISAN installment for beneficiary reference MH-PMK-8839201 was flagged for land record name discrepancy (Rameshwar B. Patil vs Rameshwar Bapurao Patil).

Pursuant to Chapter III, Clause 8 of PM-KISAN Guidelines, I have obtained the official Form-8A Reconciliation Certificate issued by the Circle Talathi validating that both names refer to the same legal titleholder.

I request you to kindly clear the land-seeding hold and approve my pending installment.

Yours faithfully,
Rameshwar Bapurao Patil
Mobile: +91 98XXXXXX12`,
    resolutionPattern: {
      totalSimilarCases: 512,
      resolvedCount: 489,
      primarySolutionSummary: '95.5% of farmers cleared land-seeding holds by submitting Form-8A via the local Talathi revenue office.'
    },
    reasoningTrail: [
      {
        stage: 1,
        name: 'Input Ingestion',
        status: 'completed',
        timestamp: '10:14:02.001',
        details: 'Ingested PM-KISAN portal status text. Extracted initials mismatch in landholding database.',
      },
      {
        stage: 2,
        name: 'OpenSearch Guideline Retrieval',
        status: 'completed',
        timestamp: '10:14:02.450',
        details: 'Retrieved PM-KISAN Central Guidelines Chapter III Clause 8.',
      },
      {
        stage: 3,
        name: 'Action Plan Generation',
        status: 'completed',
        timestamp: '10:14:03.100',
        details: 'Synthesized Form-8A Talathi reconciliation pathway.',
      }
    ],
    createdAt: '2026-09-18T16:30:00Z'
  },
  'CERTIFICATE_003': {
    id: 'CERTIFICATE_003',
    serviceId: 'EDISTRICT_INCOME_CERT_2026',
    serviceName: 'E-District Official Family Income Certificate',
    domain: 'certificate',
    state: 'Uttar Pradesh',
    department: 'Revenue Department (e-District UP)',
    applicationReference: 'UP-EDIST-2026-104928',
    submissionDate: '2026-01-10',
    failureType: 'VERIFICATION_FAILURE',
    confidence: 'high',
    confidenceExplanation: 'Identified rejection notice stating "Incomplete Family Income Source Declaration (Form B)". Matched against UP Revenue Manual Section 12.',
    whyFailedPlainLanguage: {
      en: 'Your Income Certificate application was returned because the agricultural income section in Form B was left blank without a certified Revenue Lekhpal verification stamp.',
      hi: 'आपका आय प्रमाण पत्र आवेदन इसलिए वापस कर दिया गया क्योंकि फॉर्म बी में कृषि आय अनुभाग को लेखपाल सत्यापन की मुहर के बिना खाली छोड़ दिया गया था।',
      kn: 'ಫಾರ್ಮ್ ಬಿ ಯಲ್ಲಿನ ಕೃಷಿ ಆದಾಯದ ವಿಭಾಗವನ್ನು ಲೇಖಪಾಲ್ ಪರಿಶೀಲನೆಯ ಮುದ್ರೆಯಿಲ್ಲದೆ ಖಾಲಿ ಬಿಟ್ಟಿರುವುದರಿಂದ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ.',
      te: 'ఫారమ్ బి లోని వ్యవసాయ ఆదాయ విభాగం లేఖ్‌పాల్ ధృవీకరణ ముద్ర లేకుండా ఖాళీగా వదిలివేయబడినందున మీ అప్లికేషన్ తిరస్కరించబడింది.',
    },
    affectedRequirement: 'Section 12: Mandatory Field Verification of Agricultural Land Income by Area Revenue Officer (Lekhpal)',
    submittedValue: 'Agricultural Income Field: Blank (Unverified)',
    requiredValue: 'Agricultural Income Field: Specified amount with Lekhpal Signature & Seal',
    authenticityFlag: 'verified_format',
    authenticityReason: 'UP e-District portal digital verification seal confirmed authentic.',
    evidence: [
      {
        id: 'EVID-UPD-01',
        source: 'Uttar Pradesh Revenue Board Administrative Order 2024',
        section: 'Section 12, Rule 4 (Lekhpal Field Verification)',
        excerpt: 'No income certificate application carrying agricultural land ownership shall be issued without a physical or digital verification report signed by the jurisdictional Lekhpal detailing seasonal crop returns.',
        documentType: 'Revenue Board Rule',
        effectiveDate: '2024-03-01'
      }
    ],
    recoveryAvailable: true,
    recoverySummary: {
      en: 'Obtain the Lekhpal verification signature on Form B and resubmit via your local Jan Seva Kendra / CSC portal.',
      hi: 'फॉर्म बी पर लेखपाल का सत्यापन हस्ताक्षर प्राप्त करें और अपने स्थानीय जन सेवा केंद्र / सीएससी पोर्टल के माध्यम से पुनः प्रस्तुत करें।',
      kn: 'ಫಾರ್ಮ್ ಬಿ ಮೇಲೆ ಲೇಖಪಾಲ್ ಅವರ ಸಹಿ ಪಡೆದು ಜನ್ ಸೇವಾ ಕೇಂದ್ರದ ಮೂಲಕ ಪುನಃ ಸಲ್ಲಿಸಿ.',
      te: 'ఫారమ్ బి పై లేఖ్‌పాల్ సంతకం పొంది జన్ సేవా కేంద్రం ద్వారా తిరిగి సమర్పించండి.',
    },
    actionChecklist: [
      {
        step: 1,
        title: 'Download Form B Verification Sheet',
        description: 'Print the pending verification sheet from your UP e-District citizen dashboard.',
        evidenceRef: 'EVID-UPD-01',
        locationType: 'ONLINE',
        estimatedDays: 'Immediate'
      },
      {
        step: 2,
        title: 'Get Field Verification Report from Revenue Lekhpal',
        description: 'Visit the local Tehsil or village Lekhpal during public hearing hours (Mon/Thu). Get agricultural income stamped.',
        evidenceRef: 'EVID-UPD-01',
        locationType: 'DEPT_OFFICE',
        estimatedDays: '2 Days'
      },
      {
        step: 3,
        title: 'Resubmit via Jan Seva Kendra (CSC)',
        description: 'Upload the stamped Form B on e-district portal to receive final certificate within 48 hours.',
        evidenceRef: 'EVID-UPD-01',
        locationType: 'CSC_IN_PERSON',
        estimatedDays: '2 Days'
      }
    ],
    deadlineProximity: 'none',
    deadlineText: 'No strict statutory expiration; resubmission can be made anytime within 30 days',
    resubmissionCoverNote: `To,
The Tehsildar / Sub-Divisional Magistrate,
Tehsil Revenue Department, UP e-District.

Subject: Submission of Stamped Lekhpal Verification Report (Form B) for Application UP-EDIST-2026-104928.

Respected Sir,

In response to the verification query raised on my Income Certificate application (UP-EDIST-2026-104928), I hereby submit the completed Form B duly verified and stamped by the Circle Lekhpal.

Kindly approve the application and issue the digital Income Certificate.

Yours faithfully,
[Applicant Name]`,
    resolutionPattern: {
      totalSimilarCases: 890,
      resolvedCount: 845,
      primarySolutionSummary: '94.9% resolved by obtaining Lekhpal stamp on Form B.'
    },
    reasoningTrail: [
      {
        stage: 1,
        name: 'Input Ingestion',
        status: 'completed',
        timestamp: '09:00:10.111',
        details: 'Parsed e-District objection slip.',
      }
    ],
    createdAt: '2026-09-17T09:00:00Z'
  }
};

export const MOCK_CSC_LIST: CommonServiceCentre[] = [
  {
    id: 'CSC-01',
    name: 'Seva Kendra & Common Service Centre #104',
    district: 'Bengaluru Urban',
    address: 'No. 42, 1st Main Road, Near Bus Stand, Vijayanagar, Bengaluru',
    pincode: '560040',
    contactNumber: '+91 98450 12345',
    operatorName: 'Suresh Kumar',
    workingHours: '9:00 AM - 6:30 PM (Mon-Sat)',
    distanceKm: 1.4
  },
  {
    id: 'CSC-02',
    name: 'Gram Panchayat Digital Seva Kendra',
    district: 'Mandya District',
    address: 'Gram Panchayat Office Building, Main Road, Pandavapura',
    pincode: '571434',
    contactNumber: '+91 94481 67890',
    operatorName: 'Lakshmi Gowda',
    workingHours: '10:00 AM - 5:00 PM (Mon-Fri)',
    distanceKm: 3.8
  },
  {
    id: 'CSC-03',
    name: 'Jan Seva Kendra (CSC) #892',
    district: 'Lucknow',
    address: 'Shop 12, Revenue Tehsil Compound, Alambagh, Lucknow',
    pincode: '226005',
    contactNumber: '+91 91200 45678',
    operatorName: 'Amitabh Verma',
    workingHours: '9:30 AM - 7:00 PM (Mon-Sat)',
    distanceKm: 2.1
  },
  {
    id: 'CSC-04',
    name: 'Maha-E-Seva Kendra #440',
    district: 'Pune',
    address: 'Near Talathi Office, Market Yard, Hadapsar, Pune',
    pincode: '411028',
    contactNumber: '+91 97654 32109',
    operatorName: 'Rajesh Patil',
    workingHours: '9:00 AM - 6:00 PM (Mon-Sat)',
    distanceKm: 0.9
  }
];

export const MOCK_INTELLIGENCE_DATA = {
  totalAnalyzed: 14820,
  successfulRecoveries: 13410,
  avgResolutionDays: '4.2 Days',
  topFailureCategories: [
    { category: 'DOCUMENT_EXPIRED', count: 5410, percentage: 36.5, primaryDomain: 'Scholarships' },
    { category: 'DATA_MISMATCH', count: 4120, percentage: 27.8, primaryDomain: 'Farmer Schemes' },
    { category: 'VERIFICATION_FAILURE', count: 2890, percentage: 19.5, primaryDomain: 'Certificates' },
    { category: 'DOCUMENT_MISSING', count: 1400, percentage: 9.4, primaryDomain: 'Scholarships' },
    { category: 'OTHER_PROCEDURAL', count: 1000, percentage: 6.8, primaryDomain: 'Public Services' },
  ],
  mostAffectedServices: [
    { name: 'Post-Matric Fee Reimbursement & Scholarship', state: 'Karnataka', failures: 3420, topReason: 'Expired Income Certificate' },
    { name: 'PM-KISAN Samman Nidhi 17th Installment', state: 'Maharashtra', failures: 2890, topReason: 'Land Record Name Mismatch' },
    { name: 'E-District Income Certificate Verification', state: 'Uttar Pradesh', failures: 2150, topReason: 'Unstamped Form B Lekhpal Report' },
    { name: 'Ayushman Bharat Golden Card Generation', state: 'Madhya Pradesh', failures: 1840, topReason: 'Aadhaar Gender/Age Typo' },
  ],
  emergingPatterns: [
    {
      title: 'Post-March Income Certificate Expiration Wave',
      description: 'Over 4,000 scholarship rejections detected across South Indian states due to students submitting 2023-issued certificates after April 1st.',
      severity: 'HIGH',
      suggestedPolicyFix: 'Automate e-District RD validity auto-renewals for active students.',
      metric: { count: '4,000+', trend: '↑ 18% vs last month', states: ['Karnataka', 'Uttar Pradesh', 'Maharashtra'] },
    },
    {
      title: 'Initial Mismatch in MahaBhulekh 7/12 Extracts',
      description: 'Farmers with legal initials on land records facing automated PM-KISAN holds due to strict full-name Aadhaar matching.',
      severity: 'MEDIUM',
      suggestedPolicyFix: 'Deploy automated Form-8A digital cross-linking via Circle Talathi portal.',
      metric: { count: '1,850+', trend: '↑ 12% vs last month', states: ['Karnataka', 'Madhya Pradesh'] },
    }
  ]
};
