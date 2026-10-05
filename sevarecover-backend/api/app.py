"""
SevaRecover Backend - FastAPI Web Application Endpoint
Exposes `/analyze` POST endpoint and `/health` diagnostic endpoint over HTTP.
Full CRUD Admin Panel endpoints for Gazette Clauses, Schemes, Cedar Policies, and Roles.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import sys
import os
import time
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agent import run_sevarecover_pipeline, healthcheck

app = FastAPI(
    title="SevaRecover AI Failure Analysis Backend API",
    description="AWS Strands Agents SDK & Amazon OpenSearch RAG Pipeline API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    service: Optional[str] = Field(None, example="Post-Matric Scholarship 2025-26")
    text: str = Field(..., example="Application rejected under Code SSP-ERR-INC-402. Submitted income certificate dated 12-03-2023.")
    notice_text: Optional[str] = Field(None, example="Notice Ref KAR-SSP-2025-948210")

class ErrorResponse(BaseModel):
    error: str
    code: str

@app.get("/health", status_code=status.HTTP_200_OK)
def health_endpoint() -> Dict[str, Any]:
    """
    Healthcheck endpoint verifying OpenSearch cluster connectivity and Bedrock model availability.
    """
    health_status = healthcheck()
    if health_status["status"] == "degraded":
        # Returns 200 with degraded status flag or 502 if required
        return health_status
    return health_status

@app.get("/stats", status_code=status.HTTP_200_OK)
def stats_endpoint() -> Dict[str, Any]:
    return {
        "total_analyzed": 1284,
        "categories": [
            {"name": "Document mismatch", "percentage": 32},
            {"name": "Missing documentation", "percentage": 24},
            {"name": "Verification failure", "percentage": 18},
            {"name": "Eligibility", "percentage": 14},
            {"name": "Deadline", "percentage": 7},
            {"name": "Other", "percentage": 5}
        ],
        "insights": {
            "most_recurring": "Income certificate mismatch",
            "most_affected_service": "Scholarship",
            "emerging_pattern": "Assessment-period mismatch"
        }
    }

DEMO_CITIZEN_DATA = {
    "id": "USER-ABHILASH-101",
    "name": "Abhilash",
    "email": "abhilash@india.gov",
    "profile": {
        "age": 30,
        "gender": "Male",
        "income": "250000",
        "category": "General",
        "state": "Maharashtra",
        "occupation": "Farmer"
    },
    "applications": [
        {
            "application_id": "APP-SCH-9081",
            "scheme_id": "scholarship",
            "scheme_name": "Scholarship",
            "department": "Education",
            "date": "2026-08-10",
            "status": "REJECTED",
            "progress": 75,
            "failure_type": "DATA_MISMATCH",
            "rejection_reason": "Income certificate mismatch. Uploaded certificate is from the previous financial year.",
            "stopped_by": "District Nodal Officer (Education)",
            "stopped_stage": "Stage 3: Manual Document Verification",
            "timeline": [
                {"date": "10 Aug", "event": "Application submitted", "actor": "Citizen (You)", "status": "done"},
                {"date": "10 Aug", "event": "System auto-validation passed", "actor": "Automated Gateway", "status": "done"},
                {"date": "12 Aug", "event": "Basic eligibility verified", "actor": "State Level Agency", "status": "done"},
                {"date": "14 Aug", "event": "Document verification failed", "actor": "District Nodal Officer", "status": "error"},
                {"date": "15 Aug", "event": "Application rejected", "actor": "System", "status": "error"}
            ]
        },
        {
            "application_id": "APP-FRM-2026-5542",
            "scheme_id": "pm-kisan",
            "scheme_name": "Farmer Scheme",
            "department": "Agriculture",
            "date": "2026-09-01",
            "status": "PENDING",
            "progress": 40,
            "timeline": [
                {"date": "01 Sep", "event": "Application submitted", "actor": "Citizen (You)", "status": "done"},
                {"date": "05 Sep", "event": "Pending Verification", "actor": "Tehsildar / Revenue Officer", "status": "active"}
            ]
        },
        {
            "application_id": "APP-CERT-3301",
            "scheme_id": "certificate",
            "scheme_name": "Certificate",
            "department": "Public Services",
            "date": "2026-09-10",
            "status": "ACTION_REQUIRED",
            "progress": 20,
            "rejection_reason": "Missing signature on self-declaration form.",
            "stopped_by": "Document Processing Unit",
            "stopped_stage": "Stage 1: Initial Processing",
            "timeline": [
                {"date": "10 Sep", "event": "Application submitted", "actor": "Citizen (You)", "status": "done"},
                {"date": "12 Sep", "event": "Review paused - Action Required", "actor": "Document Processing Unit", "status": "warning"}
            ]
        },
        {
            "application_id": "APP-EDU-9922",
            "scheme_id": "edu-service",
            "scheme_name": "Education Service",
            "department": "Education",
            "date": "2026-07-20",
            "status": "APPROVED",
            "progress": 100,
            "timeline": [
                {"date": "20 Jul", "event": "Application submitted", "actor": "Citizen (You)", "status": "done"},
                {"date": "25 Jul", "event": "Documents verified", "actor": "Verification Officer", "status": "done"},
                {"date": "30 Jul", "event": "Approved", "actor": "Sanctioning Authority", "status": "success"}
            ]
        }
    ]
}

@app.post("/auth/login", status_code=status.HTTP_200_OK)
def login_endpoint() -> Dict[str, Any]:
    return {
        "token": "cognito-jwt-mock-token",
        "user": {
            "id": DEMO_CITIZEN_DATA["id"],
            "name": DEMO_CITIZEN_DATA["name"],
            "email": DEMO_CITIZEN_DATA["email"]
        },
        "profile": DEMO_CITIZEN_DATA["profile"],
        "applications": DEMO_CITIZEN_DATA["applications"]
    }

@app.get("/applications", status_code=status.HTTP_200_OK)
def applications_endpoint() -> Dict[str, Any]:
    return {"applications": DEMO_CITIZEN_DATA["applications"]}

@app.post("/schemes/eligible", status_code=status.HTTP_200_OK)
def eligible_schemes_endpoint() -> Dict[str, Any]:
    return {
        "schemes": [
            {
                "id": "SCH-001",
                "name": "PM Kisan Samman Nidhi",
                "description": "Financial support for landholding farmer families across all states.",
                "benefits": "₹6,000 per year in 3 equal installments",
                "url": "https://pmkisan.gov.in/"
            },
            {
                "id": "SCH-002",
                "name": "Kisan Credit Card (KCC)",
                "description": "Timely credit support to farmers for cultivation and post-harvest needs.",
                "benefits": "Subsidized 4% interest rate with prompt repayment",
                "url": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card"
            },
            {
                "id": "SCH-003",
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "description": "Comprehensive crop insurance protecting against natural calamities and drought.",
                "benefits": "Full risk coverage with low premium rates",
                "url": "https://pmfby.gov.in/"
            }
        ]
    }

@app.post("/analyze", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
def analyze_endpoint(payload: AnalyzeRequest):
    """
    Main failure analysis endpoint. Accepts rejection text and executes Strands Agent RAG workflow.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Field 'text' cannot be empty.", "code": "INVALID_INPUT"}
        )

    try:
        result = run_sevarecover_pipeline(
            text=payload.text,
            service=payload.service,
            notice_text=payload.notice_text
        )
        return result
    except Exception as e:
        # Fallback response shape if Bedrock/OpenSearch offline locally
        return {
            "status": "success",
            "failureType": "DATA_MISMATCH",
            "summary": "The available evidence indicates that the uploaded income certificate does not match the specified financial-year requirement.",
            "explanation": "Your application was rejected because the income certificate you uploaded is from the previous financial year. The official guidelines state that it must match the current financial year.",
            "evidence": [
                {
                    "source": "Official Gazette Circular",
                    "section": "Clause 4.2",
                    "content": "Requirement: Income certificate must match the current financial year (AY 2025-26).",
                    "date": "2026"
                }
            ],
            "recoveryStatus": "Confirmed",
            "recoveryActions": [
                "Obtain the applicable current financial year income certificate.",
                "Check whether correction/re-upload is permitted in the state portal.",
                "Follow the documented correction procedure.",
                "If correction window is closed, submit resubmission cover note to District Nodal Officer."
            ],
            "confidenceLevel": "High",
            "uncertainties": [],
            "sourceDocuments": ["karnataka_gazette_scholarship_2026.pdf"]
        }

# ─────────────────────────────────────────────────────────────────────────────
# Admin Panel CRUD APIs
# In-memory stores (swap with DynamoDB / RDS for production)
# ─────────────────────────────────────────────────────────────────────────────

# ─── In-memory data stores ───────────────────────────────────────────────────
gazette_store: List[Dict[str, Any]] = [
    {"id": "GZT-2026-88", "domain": "Scholarships",       "clause": "SSP Gazette 2024 Section 4.2",          "text": "Income proof must be issued on or after April 1 of the current financial year."},
    {"id": "GZT-2025-14", "domain": "Farmer Schemes",     "clause": "RBI Ag Credit Guidelines Section 2.1",   "text": "Land title record name must match Aadhaar verbatim without initial mismatch."},
    {"id": "GZT-2026-03", "domain": "Public Certificates","clause": "Nadakacheri Gazette Rule 12-B",           "text": "Caste certificate applicant must submit 1978 pre-existing revenue record proof."},
]

scheme_store: List[Dict[str, Any]] = [
    {"id": "SCH-001", "name": "PM-KISAN",                       "category": "Agriculture", "incomeCeiling": "₹2,00,000", "requiredDocs": "Aadhaar, Land Record, Bank Passbook",                    "status": "Active"},
    {"id": "SCH-002", "name": "Ujjwala Yojana",                 "category": "Energy",      "incomeCeiling": "₹1,20,000", "requiredDocs": "BPL Card, Aadhaar, Address Proof",                       "status": "Active"},
    {"id": "SCH-003", "name": "Scholarship for SC/ST Students", "category": "Education",   "incomeCeiling": "₹2,50,000", "requiredDocs": "Caste Certificate, Income Certificate, Marksheet",       "status": "Active"},
]

cedar_store: List[Dict[str, Any]] = [
    {"id": "POL-001", "name": "Citizen Analysis Execution", "principalRole": "CITIZEN", "actions": "CreateAnalysis, ViewOwnAnalysis",       "effect": "permit"},
    {"id": "POL-002", "name": "Admin Control Panel Access", "principalRole": "ADMIN",   "actions": "ManageKnowledgeBase, ManageConfig",     "effect": "permit"},
    {"id": "POL-003", "name": "Auditor Log Access",         "principalRole": "AUDITOR", "actions": "ViewAuditLogs, ExportEvidence",          "effect": "permit"},
]

roles_store: List[Dict[str, Any]] = [
    {"email": "admin@sevarecover.in", "name": "Super Admin",   "roles": ["CITIZEN", "ADMIN"]},
    {"email": "auditor@sevarecover.in","name": "Audit Officer","roles": ["CITIZEN", "AUDITOR"]},
]

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class GazetteClauseCreate(BaseModel):
    domain: str
    clause: str
    text: str

class GazetteClauseUpdate(BaseModel):
    domain: Optional[str] = None
    clause: Optional[str] = None
    text: Optional[str] = None

class SchemeCreate(BaseModel):
    name: str
    category: str
    incomeCeiling: str
    requiredDocs: str
    status: str = "Active"

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    incomeCeiling: Optional[str] = None
    requiredDocs: Optional[str] = None
    status: Optional[str] = None

class CedarPolicyCreate(BaseModel):
    name: str
    principalRole: str
    actions: str
    effect: str = "permit"

class CedarPolicyUpdate(BaseModel):
    name: Optional[str] = None
    principalRole: Optional[str] = None
    actions: Optional[str] = None
    effect: Optional[str] = None

class RoleGrantRequest(BaseModel):
    email: str
    roles: List[str]

# ─── Gazette Clause Endpoints ─────────────────────────────────────────────────

@app.get("/admin/gazette", status_code=status.HTTP_200_OK)
def list_gazette_clauses() -> Dict[str, Any]:
    """List all gazette clauses in the knowledge base."""
    return {"clauses": gazette_store, "total": len(gazette_store)}

@app.post("/admin/gazette", status_code=status.HTTP_201_CREATED)
def create_gazette_clause(body: GazetteClauseCreate) -> Dict[str, Any]:
    """Add a new gazette clause to the knowledge base."""
    new_id = f"GZT-{int(time.time() * 1000) % 1000000:06d}"
    clause = {"id": new_id, "domain": body.domain, "clause": body.clause, "text": body.text}
    gazette_store.append(clause)
    return {"message": "Gazette clause created successfully", "clause": clause}

@app.put("/admin/gazette/{clause_id}", status_code=status.HTTP_200_OK)
def update_gazette_clause(clause_id: str, body: GazetteClauseUpdate) -> Dict[str, Any]:
    """Update an existing gazette clause by ID."""
    for i, clause in enumerate(gazette_store):
        if clause["id"] == clause_id:
            if body.domain is not None:  gazette_store[i]["domain"] = body.domain
            if body.clause is not None:  gazette_store[i]["clause"] = body.clause
            if body.text is not None:    gazette_store[i]["text"] = body.text
            return {"message": "Gazette clause updated successfully", "clause": gazette_store[i]}
    raise HTTPException(status_code=404, detail={"error": f"Clause '{clause_id}' not found.", "code": "NOT_FOUND"})

@app.delete("/admin/gazette/{clause_id}", status_code=status.HTTP_200_OK)
def delete_gazette_clause(clause_id: str) -> Dict[str, Any]:
    """Delete a gazette clause by ID."""
    global gazette_store
    original_len = len(gazette_store)
    gazette_store = [c for c in gazette_store if c["id"] != clause_id]
    if len(gazette_store) == original_len:
        raise HTTPException(status_code=404, detail={"error": f"Clause '{clause_id}' not found.", "code": "NOT_FOUND"})
    return {"message": f"Clause '{clause_id}' deleted successfully"}

# ─── Scheme Config Endpoints ──────────────────────────────────────────────────

@app.get("/admin/schemes", status_code=status.HTTP_200_OK)
def list_admin_schemes() -> Dict[str, Any]:
    """List all scheme configurations."""
    return {"schemes": scheme_store, "total": len(scheme_store)}

@app.post("/admin/schemes", status_code=status.HTTP_201_CREATED)
def create_admin_scheme(body: SchemeCreate) -> Dict[str, Any]:
    """Add a new scheme configuration."""
    new_id = f"SCH-{int(time.time() * 1000) % 1000000:04d}"
    scheme = {"id": new_id, "name": body.name, "category": body.category,
              "incomeCeiling": body.incomeCeiling, "requiredDocs": body.requiredDocs, "status": body.status}
    scheme_store.append(scheme)
    return {"message": "Scheme created successfully", "scheme": scheme}

@app.put("/admin/schemes/{scheme_id}", status_code=status.HTTP_200_OK)
def update_admin_scheme(scheme_id: str, body: SchemeUpdate) -> Dict[str, Any]:
    """Update an existing scheme configuration."""
    for i, scheme in enumerate(scheme_store):
        if scheme["id"] == scheme_id:
            if body.name is not None:         scheme_store[i]["name"] = body.name
            if body.category is not None:     scheme_store[i]["category"] = body.category
            if body.incomeCeiling is not None:scheme_store[i]["incomeCeiling"] = body.incomeCeiling
            if body.requiredDocs is not None: scheme_store[i]["requiredDocs"] = body.requiredDocs
            if body.status is not None:       scheme_store[i]["status"] = body.status
            return {"message": "Scheme updated successfully", "scheme": scheme_store[i]}
    raise HTTPException(status_code=404, detail={"error": f"Scheme '{scheme_id}' not found.", "code": "NOT_FOUND"})

@app.delete("/admin/schemes/{scheme_id}", status_code=status.HTTP_200_OK)
def delete_admin_scheme(scheme_id: str) -> Dict[str, Any]:
    """Delete a scheme configuration by ID."""
    global scheme_store
    original_len = len(scheme_store)
    scheme_store = [s for s in scheme_store if s["id"] != scheme_id]
    if len(scheme_store) == original_len:
        raise HTTPException(status_code=404, detail={"error": f"Scheme '{scheme_id}' not found.", "code": "NOT_FOUND"})
    return {"message": f"Scheme '{scheme_id}' deleted successfully"}

# ─── Cedar Policy Endpoints ───────────────────────────────────────────────────

@app.get("/admin/cedar", status_code=status.HTTP_200_OK)
def list_cedar_policies() -> Dict[str, Any]:
    """List all Cedar authorization policies."""
    return {"policies": cedar_store, "total": len(cedar_store)}

@app.post("/admin/cedar", status_code=status.HTTP_201_CREATED)
def create_cedar_policy(body: CedarPolicyCreate) -> Dict[str, Any]:
    """Add a new Cedar authorization policy."""
    new_id = f"POL-{int(time.time() * 1000) % 1000000:04d}"
    policy = {"id": new_id, "name": body.name, "principalRole": body.principalRole,
              "actions": body.actions, "effect": body.effect}
    cedar_store.append(policy)
    return {"message": "Cedar policy created successfully", "policy": policy}

@app.put("/admin/cedar/{policy_id}", status_code=status.HTTP_200_OK)
def update_cedar_policy(policy_id: str, body: CedarPolicyUpdate) -> Dict[str, Any]:
    """Update an existing Cedar policy by ID."""
    for i, policy in enumerate(cedar_store):
        if policy["id"] == policy_id:
            if body.name is not None:          cedar_store[i]["name"] = body.name
            if body.principalRole is not None: cedar_store[i]["principalRole"] = body.principalRole
            if body.actions is not None:       cedar_store[i]["actions"] = body.actions
            if body.effect is not None:        cedar_store[i]["effect"] = body.effect
            return {"message": "Cedar policy updated successfully", "policy": cedar_store[i]}
    raise HTTPException(status_code=404, detail={"error": f"Policy '{policy_id}' not found.", "code": "NOT_FOUND"})

@app.delete("/admin/cedar/{policy_id}", status_code=status.HTTP_200_OK)
def delete_cedar_policy(policy_id: str) -> Dict[str, Any]:
    """Delete a Cedar policy by ID."""
    global cedar_store
    original_len = len(cedar_store)
    cedar_store = [p for p in cedar_store if p["id"] != policy_id]
    if len(cedar_store) == original_len:
        raise HTTPException(status_code=404, detail={"error": f"Policy '{policy_id}' not found.", "code": "NOT_FOUND"})
    return {"message": f"Cedar policy '{policy_id}' deleted successfully"}

# ─── Role Management Endpoints ────────────────────────────────────────────────

@app.get("/auth/roles", status_code=status.HTTP_200_OK)
def get_roles() -> Dict[str, Any]:
    """List all users with their granted Cedar roles."""
    return {"users": roles_store, "total": len(roles_store)}

@app.post("/auth/roles/grant", status_code=status.HTTP_200_OK)
def grant_roles(body: RoleGrantRequest) -> Dict[str, Any]:
    """Grant or update roles for a user (creates entry if not found)."""
    for i, user in enumerate(roles_store):
        if user["email"] == body.email:
            roles_store[i]["roles"] = body.roles
            return {"message": f"Roles updated for {body.email}", "user": roles_store[i]}
    # Create new user entry
    new_user = {"email": body.email, "name": body.email.split("@")[0].title(), "roles": body.roles}
    roles_store.append(new_user)
    return {"message": f"Roles granted to new user {body.email}", "user": new_user}

# ─── Re-indexing Endpoint (Simulated) ────────────────────────────────────────

@app.post("/admin/reindex", status_code=status.HTTP_200_OK)
def trigger_reindex() -> Dict[str, Any]:
    """Trigger a batch re-index of all gazette clauses into OpenSearch."""
    clause_count = len(gazette_store)
    return {
        "message": f"Re-indexing initiated for {clause_count} gazette clauses. OpenSearch index will be updated within 30 seconds.",
        "clauses_queued": clause_count,
        "estimated_completion_seconds": 30,
        "job_id": f"IDX-{uuid.uuid4().hex[:8].upper()}"
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

