# SevaRecover Backend (AWS Build It Track)

AI-Powered Digital Public Service Failure Analysis & Evidence-Backed Recovery Pipeline built with **AWS Strands Agents SDK**, **Amazon OpenSearch**, **Cedar**, and **FastAPI**.

---

## 1. Prerequisites

- **Python**: 3.11 or higher
- **Docker**: Docker / Finch for running local single-node OpenSearch 2.11 instance
- **AWS Account & Bedrock Access**: AWS credentials configured with access to Amazon Bedrock models (e.g., Anthropic Claude 3.5 Sonnet / Amazon Titan)

---

## 2. Quick Setup Commands

```bash
# 1. Navigate to backend folder
cd sevarecover-backend

# 2. Create virtual environment & install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Copy environment configuration & set AWS / OpenSearch keys
cp .env.example .env

# 4. Spin up local OpenSearch single-node cluster
docker-compose up -d

# 5. Run idempotent document chunking & indexing script against sample corpus
python ingestion/ingest_documents.py

# 6. Run test suite
pytest tests/

# 7. Start FastAPI web server on port 8000
uvicorn api.app:app --reload --port 8000
```

---

## 3. How to Verify Working Implementation

### Step A: Healthcheck Diagnostic (`/health`)
```bash
curl -X GET http://localhost:8000/health
```
**Expected Response**:
```json
{
  "opensearch_connected": true,
  "index_exists": true,
  "bedrock_model_id": "anthropic.claude-3-5-sonnet-20240620-v1:0",
  "aws_region": "us-east-1",
  "status": "healthy"
}
```

### Step B: Failure Analysis Pipeline (`/analyze`)
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "service": "State Post-Matric Scholarship",
    "text": "My application was rejected. Income certificate discrepancy — certificate is from 2024, application year is 2026."
  }'
```

**Expected Response Shape**:
```json
{
  "status": "success",
  "service": "State Post-Matric Scholarship",
  "failure_type": "DOCUMENT_EXPIRED",
  "confidence": "high",
  "why_failed_plain_language": "Your application failed because the Income Certificate submitted was issued for a prior financial year...",
  "authenticity": {
    "flag": "verified_format",
    "reason": "Header syntax matches authentic state portal digital notification format..."
  },
  "submitted_value": "Certificate Date: 12-03-2023 (FY 2022-23 Proof)",
  "required_value": "Certificate Date: >= 01-04-2024 (AY 2025-26 Proof)",
  "affected_requirement": "Clause 4.2: Mandatory Assessment Year Proof",
  "evidence": [...],
  "recovery_available": true,
  "action_checklist": [...],
  "resubmission_cover_note": "To,\nThe Nodal Officer..."
}
```

---

## 4. Environment Variables Reference (`.env`)

- `BEDROCK_MODEL_ID`: Model identifier in Amazon Bedrock console (e.g. `anthropic.claude-3-5-sonnet-20240620-v1:0`). Enable access in Bedrock Console first.
- `OPENSEARCH_HOST`: Hostname for OpenSearch (default: `localhost`). OpenSearch must be running before running ingestion or queries.
- `OPENSEARCH_PORT`: OpenSearch HTTP port (default: `9200`).
- `OPENSEARCH_INDEX`: Knowledge base index name (default: `sevarecover-kb`).
