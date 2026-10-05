permit (
    principal in Role::"CITIZEN",
    action in [Action::"CreateAnalysis", Action::"ViewAnalysis", Action::"UploadEvidence"],
    resource
);

permit (
    principal in Role::"ADMIN",
    action in [Action::"ManageKnowledgeBase", Action::"UpdateService", Action::"ViewStats"],
    resource
);

permit (
    principal in Role::"AUDITOR",
    action in [Action::"InspectReasoning", Action::"ReviewEvidence", Action::"ViewStats"],
    resource
);
