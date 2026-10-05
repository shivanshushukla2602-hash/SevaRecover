<div align="center">

<br/>

<img src="https://img.shields.io/badge/AWS-Hackathon-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS Hackathon"/>
<img src="https://img.shields.io/badge/Built_With-Amazon_OpenSearch-005EB8?style=for-the-badge&logo=opensearch&logoColor=white" alt="OpenSearch"/>
<img src="https://img.shields.io/badge/Agent_Framework-AWS_Strands-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Strands"/>
<img src="https://img.shields.io/badge/Auth-Amazon_Verified_Permissions_Cedar-00C7B7?style=for-the-badge" alt="Cedar"/>

# 🛡️ SevaRecover

### **AI-Powered Government Service Failure Recovery**
*Built for the AWS Build-It Hackathon · Powered by Amazon OpenSearch + AWS Strands Agents SDK*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

---

## 🎯 What is SevaRecover?

> **SevaRecover** is an AI-powered platform that helps Indian citizens understand *why* their government scheme applications were rejected — and provides a step-by-step, evidence-backed recovery plan in seconds.

When a citizen's application for PM-KISAN, a scholarship, or a certificate is rejected, they receive a cryptic error code. SevaRecover ingests that rejection notice, cross-references it against official Gazette circulars stored in **Amazon OpenSearch**, runs it through an **AWS Strands Agents** pipeline, enforces **Cedar RBAC authorization**, and outputs:

- ✅ **Plain-language failure explanation** (in 22+ Indian languages)
- 📋 **Step-by-step recovery action plan** with estimated timelines
- 📄 **Auto-drafted resubmission cover note** ready to print & submit
- 🔍 **Evidence citations** from official Gazette circulars & policy documents
- 📊 **Resolution statistics** from similar historical cases

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SevaRecover System Architecture                     │
│                                                                             │
│  ┌──────────────────┐      HTTPS      ┌─────────────────────────────────┐  │
│  │   React Frontend │ ◄──────────────►│     FastAPI Backend (app.py)    │  │
│  │   (Vite + TS)    │                 │     POST /analyze               │  │
│  │                  │                 │     GET  /admin/gazette         │  │
│  │  • Landing Page  │                 │     + Schemes, Cedar, Roles     │  │
│  │  • Dashboard     │                 └────────────┬────────────────────┘  │
│  │  • Failure Input │                              │                       │
│  │  • Results Page  │                              ▼                       │
│  │  • Admin Panel   │           ┌───────────────────────────────────┐      │
│  │  • Auditor Dash  │           │   AWS Strands Agents Pipeline     │      │
│  └──────────────────┘           │   (agent.py — 7 @tool functions)  │      │
│                                 │                                   │      │
│                                 │  1. classify_failure_type()       │      │
│                                 │  2. verify_document_authentic()   │      │
│                                 │  3. retrieve_gazette_clauses()    │      │
│                                 │  4. compare_requirements()        │      │
│                                 │  5. discover_recovery_path()      │      │
│                                 │  6. generate_action_plan()        │      │
│                                 │  7. draft_cover_note()            │      │
│                                 └────────┬──────────────────────────┘      │
│                                          │                                 │
│               ┌──────────────────────────┼──────────────────────────┐      │
│               ▼                          ▼                          ▼      │
│  ┌──────────────────────┐  ┌────────────────────────┐  ┌──────────────┐   │
│  │  Amazon OpenSearch   │  │  Amazon Bedrock         │  │ Cedar RBAC   │   │
│  │  (RAG Knowledge Base)│  │  Claude 3.5 Sonnet      │  │ (Verified    │   │
│  │                      │  │                         │  │  Permissions)│   │
│  │  • Gazette Circulars │  │  k-NN + BM25 Hybrid     │  │  • CITIZEN   │   │
│  │  • Policy Documents  │  │  Vector Search          │  │  • ADMIN     │   │
│  │  • Scheme Guidelines │  │                         │  │  • AUDITOR   │   │
│  └──────────────────────┘  └────────────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🧠 AI Failure Analysis Engine
| Feature | Description |
|---------|-------------|
| **Multi-Domain** | Scholarships, Farmer Schemes (PM-KISAN), Public Certificates |
| **RAG-Powered Evidence** | Cross-references official Gazette circulars via OpenSearch k-NN hybrid search |
| **Strands Agent Pipeline** | 7 specialized tools: classify → verify → retrieve → compare → recover → plan → draft |
| **Confidence Scoring** | High/Medium/Low confidence with evidence chain transparency |
| **Cover Note Generator** | Auto-drafts formal resubmission letter with correct clause citations |

### 🌐 Multi-Language Support
SevaRecover supports **22+ Indian languages** — Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, and more.

### 🛡️ Role-Based Access Control (Cedar)
```cedar
// Example: Citizen can only analyze their own applications
permit(
  principal in Role::"CITIZEN",
  action in [Action::"CreateAnalysis", Action::"ViewOwnAnalysis"],
  resource
) when { resource.citizenId == principal.citizenId };
```

| Role | Capabilities |
|------|-------------|
| `CITIZEN` | Analyze rejections, view dashboard, explore schemes |
| `ADMIN` | Gazette management, scheme config, Cedar policies |
| `AUDITOR` | View all audit logs, export evidence reports |

### 📊 Admin Panel (Full CRUD)
- **Gazette Circular Indexer** — Add/Edit/Delete clauses synced to OpenSearch
- **Scheme Requirement Matrix** — Manage active government schemes
- **Cedar Policy Engine** — Live RBAC policy management
- **Access Management** — Grant/revoke user roles
- **Metrics Dashboard** — Real-time analysis statistics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI Framework |
| TypeScript | 5.6 | Type Safety |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Data Visualization |
| React Router | 7.x | Client-side Routing |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.115 | REST API Framework |
| Python | 3.11+ | Backend Language |
| AWS Strands Agents SDK | Latest | AI Agent Orchestration |
| Amazon OpenSearch | Managed | RAG Knowledge Base |
| Amazon Bedrock | Claude 3.5 | LLM Synthesis |
| Amazon Verified Permissions | Cedar | RBAC Authorization |

### AWS Services Used
```
Amazon OpenSearch Service    → Gazette & Policy Knowledge Base (k-NN hybrid search)
Amazon Bedrock               → Claude 3.5 Sonnet for analysis synthesis
Amazon Verified Permissions  → Cedar RBAC policy enforcement
AWS Lambda                   → Serverless function deployment
AWS SAM                      → Infrastructure as Code
Amazon Cognito               → User Identity & Authentication
AWS Fargate / ECS            → Containerized backend deployment
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS credentials configured (for full AI pipeline)

### 1. Clone & Setup Frontend

```bash
git clone https://github.com/ShivanshShukla/SevaRecover.git
cd SevaRecover

npm install
cp .env.example .env
# Edit VITE_API_BASE_URL to point to your backend

npm run dev
```

### 2. Setup Backend

```bash
cd sevarecover-backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit with your AWS credentials and OpenSearch endpoint

cd api
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Docker Compose (Optional)

```bash
docker-compose up --build
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:8000`

---

## 📡 API Reference

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Main failure analysis — runs Strands Agent pipeline |
| `GET` | `/health` | Backend & OpenSearch health check |
| `GET` | `/stats` | Analysis statistics |
| `POST` | `/auth/login` | User authentication |
| `GET` | `/applications` | User's application list |
| `POST` | `/schemes/eligible` | Get eligible government schemes |

### Admin CRUD APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/admin/gazette` | List/Create gazette clauses |
| `PUT/DELETE` | `/admin/gazette/{id}` | Update/Delete a clause |
| `GET/POST` | `/admin/schemes` | List/Create scheme configs |
| `PUT/DELETE` | `/admin/schemes/{id}` | Update/Delete a scheme |
| `GET/POST` | `/admin/cedar` | List/Create Cedar policies |
| `PUT/DELETE` | `/admin/cedar/{id}` | Update/Delete a policy |
| `POST` | `/admin/reindex` | Trigger OpenSearch re-index |
| `GET/POST` | `/auth/roles` | List/Grant user roles |

> **Swagger UI**: `http://localhost:8000/docs`

---

## 🌊 AI Pipeline Flow

```
User Input (rejection notice + domain)
         │
         ▼ Tool 1: classify_failure_type()      → DOCUMENT_MISSING / DATA_MISMATCH / etc.
         ▼ Tool 2: verify_document_authentic()   → Validates notice format
         ▼ Tool 3: retrieve_gazette_clauses()    → OpenSearch k-NN + BM25 hybrid search
         ▼ Tool 4: compare_requirements()        → Submitted vs Required diff analysis
         ▼ Tool 5: discover_recovery_path()      → Available correction windows & rules
         ▼ Tool 6: generate_action_plan()        → Numbered checklist with timelines
         ▼ Tool 7: draft_cover_note()            → Formal resubmission letter
         │
         ▼ Structured JSON → Frontend Results Page
```

---

## 📁 Project Structure

```
SevaRecover/
├── src/                           # Frontend (React + TypeScript)
│   ├── pages/                     # 15 page components
│   ├── components/                # Shared UI components
│   ├── services/api-client.ts     # All backend API calls + types
│   ├── context/                   # Auth, Theme, Language contexts
│   └── types/                     # Shared TypeScript interfaces
│
├── sevarecover-backend/           # Python Backend
│   ├── api/app.py                 # FastAPI app — all REST endpoints
│   ├── agent.py                   # AWS Strands Agent + 7 @tool functions
│   ├── ingestion/                 # OpenSearch ingestion scripts
│   ├── sample_corpus/             # Gazette circulars + policy docs
│   └── requirements.txt
│
├── authorization/                 # Cedar policy files
├── template.yaml                  # AWS SAM deployment template
├── docker-compose.yml             # Local development orchestration
└── README.md
```

---

## 🔧 Environment Variables

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend `.env`
```env
OPENSEARCH_HOST=your-opensearch-domain.region.es.amazonaws.com
OPENSEARCH_PORT=443
OPENSEARCH_INDEX=sevarecover-kb
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## 🏆 Hackathon Compliance Statement

> *This project was built for the AWS Build-It Hackathon. It uses: **Amazon OpenSearch Service** (RAG knowledge base, k-NN hybrid vector search), **Amazon Bedrock** (Claude 3.5 Sonnet LLM synthesis), **Amazon Verified Permissions** (Cedar RBAC enforcement), **AWS Lambda** (serverless deployment), **AWS SAM** (infrastructure as code), **Amazon Cognito** (user identity), and **Finch** (containerization).*

---

## 👥 Team

| Name | Role |
|------|------|
| **Shivansh Shukla** | Full-Stack Developer, AWS Architecture, AI Pipeline |

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for the 250+ million Indian citizens navigating government services**

*SevaRecover — Because every citizen deserves to understand why.*

</div>
