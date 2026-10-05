// ==========================================================
// Cedar Authorization Policy Store for SevaRecover
// Canonical Location: authorization/cedar/policies.cedar
// Roles: CITIZEN, ADMIN, AUDITOR
// ==========================================================

// 1. CITIZEN Role Permissions (Scope: Only own resources where principal.citizenId == resource.citizenId)
permit (
    principal in SevaRecover::Role::"CITIZEN",
    action in [
        SevaRecover::Action::"CreateAnalysis",
        SevaRecover::Action::"UploadEvidence",
        SevaRecover::Action::"ViewOwnAnalysis",
        SevaRecover::Action::"ExportActionPlan"
    ],
    resource
)
when { principal.citizenId == resource.citizenId };

// 2. ADMIN Role Permissions
permit (
    principal in SevaRecover::Role::"ADMIN",
    action in [
        SevaRecover::Action::"ManageKnowledgeBase",
        SevaRecover::Action::"UpdateServiceMetadata",
        SevaRecover::Action::"ManageConfig"
    ],
    resource
);

// 3. AUDITOR Role Permissions
permit (
    principal in SevaRecover::Role::"AUDITOR",
    action in [
        SevaRecover::Action::"InspectReasoningTrace",
        SevaRecover::Action::"ReviewSourceDocuments",
        SevaRecover::Action::"InspectAnonymizedPatterns",
        SevaRecover::Action::"VerifyAuthenticityRules"
    ],
    resource
);
