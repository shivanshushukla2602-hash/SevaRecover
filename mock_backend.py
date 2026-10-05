import json
import random
import os
import hashlib
import hmac
import secrets
import urllib.request
import urllib.parse
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler, HTTPServer

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from backend.knowledge_base import KnowledgeBaseError, health as opensearch_health, search as search_knowledge

# ── Platform Owner ───────────────────────────────────────────────────
# This email gets instant all-role access without OTP verification.
# Everyone else must register and verify via standard OTP flow.
PLATFORM_OWNER_EMAILS = {'shivanshushukla1919@gmail.com', 'shivanshushukla2602@gmail.com'}
PLATFORM_OWNER_EMAIL = 'shivanshushukla1919@gmail.com'

otp_store = {}
user_profiles = {}
users = {}
sessions = {}
applications_by_user = {}

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_FROM = os.environ.get("RESEND_FROM", "SevaRecover <onboarding@resend.dev>")
GMAIL_SENDER = os.environ.get("GMAIL_SENDER")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

def build_stats():
    applications = [item for records in applications_by_user.values() for item in records]
    counts = {}
    services = {}
    for application in applications:
        category = str(application.get('failure_type', 'OTHER')).replace('_', ' ').title()
        counts[category] = counts.get(category, 0) + 1
        service = application.get('scheme_name', 'Unknown service')
        services[service] = services.get(service, 0) + 1
    total = len(applications)
    categories = [
        {'name': name, 'percentage': round(count / total * 100) if total else 0}
        for name, count in sorted(counts.items(), key=lambda entry: entry[1], reverse=True)
    ]
    return {
        'total_analyzed': total,
        'categories': categories,
        'insights': {
            'most_recurring': categories[0]['name'] if categories else 'No analyzed cases',
            'most_affected_service': max(services, key=services.get) if services else 'No analyzed services',
            'emerging_pattern': 'Derived from citizen application records',
        },
    }


def get_dynamo_table():
    try:
        import boto3
        dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
        return dynamodb.Table('SevaRecover-Citizens')
    except Exception as e:
        print(f"DynamoDB unavailable, using in-memory fallback: {e}")
        return None


def send_otp_email(to_email, username, otp):
    """Sends OTP via Gmail SMTP (if GMAIL_SENDER & GMAIL_APP_PASSWORD set),
    Resend API (if RESEND_API_KEY set), or prints to console log."""
    print(f"[OTP LOG] Verification code generated for {username} ({to_email}): {otp}")

    # 1. Try Gmail SMTP
    if GMAIL_SENDER and GMAIL_APP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Your SevaRecover Verification Code"
            msg["From"] = GMAIL_SENDER
            msg["To"] = to_email

            html = f"""
            <div style="font-family: sans-serif; background-color: #0A0A0B; color: #F2F1EC; padding: 24px; border-radius: 12px; border: 1px solid #C9A24B;">
                <h2 style="color: #C9A24B; margin-top: 0;">SevaRecover Authentication</h2>
                <p>Hello <strong>{username}</strong>,</p>
                <p>Your one-time verification code for SevaRecover is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #C9A24B; padding: 12px; background: #141416; border-radius: 8px; text-align: center; width: fit-content;">
                    {otp}
                </div>
                <p style="font-size: 12px; color: #A8ABB3; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
            </div>
            """
            msg.attach(MIMEText(html, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_SENDER, to_email, msg.as_string())
            print(f"Gmail SMTP: OTP email sent to {to_email}")
            return True
        except Exception as e:
            print(f"Gmail SMTP delivery failed for {to_email}: {e}")

    # 2. Try Resend API
    if RESEND_API_KEY:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            }
            data = {
                "from": RESEND_FROM,
                "to": [to_email],
                "subject": "Your SevaRecover Verification Code",
                "html": (
                    f"<h2>SevaRecover Authentication</h2>"
                    f"<p>Hello {username},</p>"
                    f"<p>Your verification code is: "
                    f"<strong style='font-size:24px;color:#C9A24B;'>{otp}</strong></p>"
                ),
            }
            req = urllib.request.Request(
                url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                print(f"Resend API: OTP sent to {to_email} (status {response.status})")
                return True
        except Exception as e:
            print(f"Resend send failed for {to_email}: {e}")

    # 3. Local console fallback (Always allows local dev / testing)
    print(f"[LOCAL DEV FALLBACK] OTP for {username} ({to_email}): {otp}")
    return True


def hash_password(password):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 240000)
    return f"{salt.hex()}${digest.hex()}"


def password_matches(password, encoded):
    try:
        salt_hex, digest_hex = encoded.split('$', 1)
        expected = hashlib.pbkdf2_hmac(
            'sha256', password.encode('utf-8'), bytes.fromhex(salt_hex), 240000
        )
        return hmac.compare_digest(expected.hex(), digest_hex)
    except Exception:
        return False


def authenticated_user(handler):
    header = handler.headers.get('Authorization', '')
    if not header.startswith('Bearer '):
        return None
    return sessions.get(header[7:])


def user_applications(username):
    return applications_by_user.setdefault(username, [])


# Seed Demo Users (Part D)
def seed_demo_users():
    standard_hash = hash_password("user@1111")
    
    demo_citizens = [
        {
            "username": "user1",
            "email": "user1@india.gov",
            "profile": {
                "name": "Ananya Sharma",
                "gender": "Female",
                "age": 21,
                "occupation": "Student",
                "father_name": "Rajesh Kumar",
                "pan": "ABCDE1234F",
                "state": "Maharashtra",
                "income": "150000",
                "category": "General"
            },
            "applications": [
                {
                    "application_id": "APP-STU-1001",
                    "scheme_id": "scholarship",
                    "scheme_name": "National Merit Scholarship",
                    "department": "Higher Education",
                    "date": "2026-08-10",
                    "status": "REJECTED",
                    "progress": 75,
                    "failure_type": "MISSING_DOCUMENTATION",
                    "rejection_reason": "Missing 12th semester marksheet endorsement from Principal.",
                    "stopped_by": "State Nodal Scholarship Officer",
                    "stopped_stage": "Stage 3: Institution Verification",
                    "timeline": [
                        {"date": "10 Aug", "event": "Application submitted", "actor": "Citizen (Ananya)", "status": "done"},
                        {"date": "12 Aug", "event": "Document verification failed", "actor": "Nodal Officer", "status": "error"}
                    ],
                    "analysis": {
                        "failureType": "MISSING_DOCUMENTATION",
                        "summary": "Application rejected due to missing 12th semester marksheet Principal endorsement seal.",
                        "explanation": "Clause 4.2 of National Merit Scholarship guidelines states that all uploaded marksheets must bear an official institutional seal and Principal endorsement.",
                        "evidence": [
                            {
                                "source": "National Merit Scholarship Circular 2026",
                                "section": "Section 4.2",
                                "content": "Requirement: Marksheets uploaded without Principal attestation are invalid.",
                                "date": "2026"
                            }
                        ],
                        "applicationDifference": "Uploaded marksheet lacks Principal signature stamp.",
                        "recoveryStatus": "Confirmed",
                        "recoveryActions": [
                            "Obtain physical stamp & signature from College Principal on 12th marksheet.",
                            "Upload scanned PDF to student portal resubmission window.",
                            "Notify College Nodal Officer for instant re-verification."
                        ],
                        "confidenceLevel": "High",
                        "sourceDocuments": ["NMS_Guidelines_2026.pdf"]
                    }
                },
                {
                    "application_id": "APP-STU-1002",
                    "scheme_id": "hostel",
                    "scheme_name": "Hostel Concession Scheme",
                    "department": "Higher Education",
                    "date": "2026-08-25",
                    "status": "PENDING",
                    "progress": 45,
                    "timeline": [
                        {"date": "25 Aug", "event": "Application submitted", "actor": "Citizen (Ananya)", "status": "done"},
                        {"date": "28 Aug", "event": "Under Warden Review", "actor": "Hostel Board", "status": "active"}
                    ]
                },
                {
                    "application_id": "APP-STU-1003",
                    "scheme_id": "laptop",
                    "scheme_name": "Digital Student Laptop Scheme",
                    "department": "Digital Empowerment",
                    "date": "2026-07-15",
                    "status": "APPROVED",
                    "progress": 100,
                    "timeline": [
                        {"date": "15 Jul", "event": "Submitted", "actor": "Citizen", "status": "done"},
                        {"date": "30 Jul", "event": "Laptop Voucher Disbursed", "actor": "IT Dept", "status": "success"}
                    ]
                },
                {
                    "application_id": "APP-STU-1004",
                    "scheme_id": "bus-pass",
                    "scheme_name": "Student Bus Pass Subsidy",
                    "department": "State Transport",
                    "date": "2026-09-02",
                    "status": "PENDING",
                    "progress": 30,
                    "timeline": [
                        {"date": "02 Sep", "event": "Submitted", "actor": "Citizen", "status": "done"}
                    ]
                }
            ]
        },
        {
            "username": "user2",
            "email": "user2@india.gov",
            "profile": {
                "name": "Ramesh Rao",
                "gender": "Male",
                "age": 44,
                "occupation": "Farmer",
                "father_name": "Venkat Rao",
                "pan": "FGHJI5678G",
                "state": "Karnataka",
                "income": "220000",
                "category": "OBC"
            },
            "applications": [
                {
                    "application_id": "APP-FRM-2001",
                    "scheme_id": "kcc",
                    "scheme_name": "Kisan Credit Card Loan",
                    "department": "Agriculture",
                    "date": "2026-08-14",
                    "status": "REJECTED",
                    "progress": 60,
                    "failure_type": "DATA_MISMATCH",
                    "rejection_reason": "Aadhaar name 'Ramesh V. Rao' differs from Land Record name 'Ramesh Venkat Rao'.",
                    "stopped_by": "Tehsildar / Land Revenue Officer",
                    "stopped_stage": "Stage 2: Land Title Verification",
                    "timeline": [
                        {"date": "14 Aug", "event": "Application submitted", "actor": "Citizen (Ramesh)", "status": "done"},
                        {"date": "18 Aug", "event": "Land title verification failed", "actor": "Revenue Officer", "status": "error"}
                    ],
                    "analysis": {
                        "failureType": "DATA_MISMATCH",
                        "summary": "KCC Loan rejected due to land record name mismatch with Aadhaar UIDAI database.",
                        "explanation": "Agriculture Credit Manual Sec 2.1 requires verbatim character matching between RTC/Pahani land title records and Aadhaar eKYC name.",
                        "evidence": [
                            {
                                "source": "RBI Agricultural Credit Guidelines",
                                "section": "Section 2.1",
                                "content": "Rule: Land Title record holder name must match Aadhaar card exactly.",
                                "date": "2025"
                            }
                        ],
                        "applicationDifference": "Aadhaar: 'Ramesh V. Rao' | RTC Land Record: 'Ramesh Venkat Rao'.",
                        "recoveryStatus": "Confirmed",
                        "recoveryActions": [
                            "Submit Tehsildar Name Variation Affidavit at Village Revenue Office.",
                            "Request Revenue Inspector to issue Pahani Name Matching Certificate.",
                            "Resubmit updated certificate to Bank Branch Manager."
                        ],
                        "confidenceLevel": "High",
                        "sourceDocuments": ["RBI_KCC_Guidelines.pdf"]
                    }
                },
                {
                    "application_id": "APP-FRM-2002",
                    "scheme_id": "fertilizer",
                    "scheme_name": "Organic Fertilizer Subsidy",
                    "department": "Agriculture",
                    "date": "2026-07-20",
                    "status": "APPROVED",
                    "progress": 100,
                    "timeline": [
                        {"date": "20 Jul", "event": "Submitted", "actor": "Citizen", "status": "done"},
                        {"date": "28 Jul", "event": "Subsidy Credited", "actor": "DBT Gateway", "status": "success"}
                    ]
                },
                {
                    "application_id": "APP-FRM-2003",
                    "scheme_id": "tractor",
                    "scheme_name": "Agricultural Tractor Subsidy",
                    "department": "Agricultural Mechanics",
                    "date": "2026-08-30",
                    "status": "PENDING",
                    "progress": 50
                },
                {
                    "application_id": "APP-FRM-2004",
                    "scheme_id": "crop-insurance",
                    "scheme_name": "Pradhan Mantri Fasal Bima Yojana",
                    "department": "Agriculture",
                    "date": "2026-09-05",
                    "status": "APPROVED",
                    "progress": 100
                }
            ]
        },
        {
            "username": "user3",
            "email": "user3@india.gov",
            "profile": {
                "name": "Vikram Reddy",
                "gender": "Male",
                "age": 28,
                "occupation": "Salaried IT Employee",
                "father_name": "Srinivas Reddy",
                "pan": "KLMNO9012H",
                "state": "Telangana",
                "income": "850000",
                "category": "General"
            },
            "applications": [
                {
                    "application_id": "APP-IT-3001",
                    "scheme_id": "pmay",
                    "scheme_name": "PMAY Housing Credit Subsidy",
                    "department": "Housing & Urban Affairs",
                    "date": "2026-08-01",
                    "status": "REJECTED",
                    "progress": 70,
                    "failure_type": "ELIGIBILITY_FAILURE",
                    "rejection_reason": "Annual income ₹8.5L exceeds PMAY LIG/MIG eligibility ceiling of ₹6.0L.",
                    "stopped_by": "HUDCO Nodal Verification Agency",
                    "stopped_stage": "Stage 2: Financial Assessment",
                    "timeline": [
                        {"date": "01 Aug", "event": "Application submitted", "actor": "Citizen (Vikram)", "status": "done"},
                        {"date": "05 Aug", "event": "Income threshold evaluation failed", "actor": "HUDCO Nodal Agency", "status": "error"}
                    ],
                    "analysis": {
                        "failureType": "ELIGIBILITY_FAILURE",
                        "summary": "PMAY CLSS application rejected because household income exceeds ₹600,000 ceiling.",
                        "explanation": "PMAY Urban Guidelines Section 3.4 mandate that credit-linked subsidy under EWS/LIG tier applies strictly to household incomes up to ₹6.0 Lakhs per annum.",
                        "evidence": [
                            {
                                "source": "PMAY Urban Mission Operational Guidelines",
                                "section": "Section 3.4",
                                "content": "Cap: Maximum eligible gross household income for LIG tier is ₹6,00,000 p.a.",
                                "date": "2026"
                            }
                        ],
                        "applicationDifference": "Submitted Form 16 Gross Income = ₹8,50,000 > Threshold ₹6,00,000.",
                        "recoveryStatus": "Confirmed",
                        "recoveryActions": [
                            "Check eligibility under Middle Income Group (MIG-II) tax benefit scheme.",
                            "Apply for State Affordable Housing Interest Subvention if applicable.",
                            "File appeal if co-applicant non-taxable deductions alter gross total."
                        ],
                        "confidenceLevel": "High",
                        "sourceDocuments": ["PMAY_Urban_Rules_2026.pdf"]
                    }
                },
                {
                    "application_id": "APP-IT-3002",
                    "scheme_id": "tax-exemption",
                    "scheme_name": "80G Tax Exemption Certificate",
                    "department": "Revenue",
                    "date": "2026-07-10",
                    "status": "APPROVED",
                    "progress": 100
                },
                {
                    "application_id": "APP-IT-3003",
                    "scheme_id": "epfo",
                    "scheme_name": "EPFO Universal Account Transfer",
                    "department": "Labor & Employment",
                    "date": "2026-08-28",
                    "status": "PENDING",
                    "progress": 40
                },
                {
                    "application_id": "APP-IT-3004",
                    "scheme_id": "pan-update",
                    "scheme_name": "PAN Card Details Correction",
                    "department": "Income Tax",
                    "date": "2026-09-10",
                    "status": "APPROVED",
                    "progress": 100
                }
            ]
        },
        {
            "username": "user4",
            "email": "user4@india.gov",
            "profile": {
                "name": "Rahul Gupta",
                "gender": "Male",
                "age": 22,
                "occupation": "Student",
                "father_name": "Suresh Gupta",
                "pan": "PQRST3456J",
                "state": "Delhi",
                "income": "180000",
                "category": "General"
            },
            "applications": [
                {
                    "application_id": "APP-STU-4001",
                    "scheme_id": "edu-loan",
                    "scheme_name": "Central Education Loan Interest Subsidy",
                    "department": "Higher Education",
                    "date": "2026-08-05",
                    "status": "REJECTED",
                    "progress": 80,
                    "failure_type": "VERIFICATION_FAILURE",
                    "rejection_reason": "Institution 'Noname University' is not listed under UGC Section 2(f)/12(B) accredited registry.",
                    "stopped_by": "Canara Bank Nodal Officer",
                    "stopped_stage": "Stage 3: University Accreditation Check",
                    "timeline": [
                        {"date": "05 Aug", "event": "Application submitted", "actor": "Citizen (Rahul)", "status": "done"},
                        {"date": "10 Aug", "event": "University accreditation check failed", "actor": "Nodal Officer", "status": "error"}
                    ],
                    "analysis": {
                        "failureType": "VERIFICATION_FAILURE",
                        "summary": "CSIS Subsidy rejected because educational institution is not UGC Sec 2(f)/12(B) recognized.",
                        "explanation": "Central Sector Interest Subsidy Scheme (CSIS) guidelines mandate that loan interest subsidy is restricted to students enrolled in NAAC accredited or UGC/AICTE recognized institutions.",
                        "evidence": [
                            {
                                "source": "CSIS Ministry of Education Guidelines",
                                "section": "Section 2.2",
                                "content": "Mandate: Educational institution must possess active UGC 2(f)/12(B) accreditation.",
                                "date": "2026"
                            }
                        ],
                        "applicationDifference": "Institution 'Noname University' absent from Central UGC Accreditation Portal.",
                        "recoveryStatus": "Confirmed",
                        "recoveryActions": [
                            "Request Registrar's Office for official UGC 2(f) Gazette Recognition Copy.",
                            "If university holds Autonomous NAAC rating, submit NAAC grade certificate.",
                            "Resubmit petition through PM Vidyalaxmi Grievance Portal."
                        ],
                        "confidenceLevel": "High",
                        "sourceDocuments": ["CSIS_HigherEducation_2026.pdf"]
                    }
                },
                {
                    "application_id": "APP-STU-4002",
                    "scheme_id": "laptop-delhi",
                    "scheme_name": "State Merit Laptop Scheme",
                    "department": "Education",
                    "date": "2026-08-20",
                    "status": "PENDING",
                    "progress": 50
                },
                {
                    "application_id": "APP-STU-4003",
                    "scheme_id": "state-merit",
                    "scheme_name": "Delhi State Higher Education Scholarship",
                    "department": "Social Justice",
                    "date": "2026-08-29",
                    "status": "PENDING",
                    "progress": 35
                },
                {
                    "application_id": "APP-STU-4004",
                    "scheme_id": "travel-pass",
                    "scheme_name": "DTC Student Travel Concession",
                    "department": "Transport",
                    "date": "2026-09-08",
                    "status": "APPROVED",
                    "progress": 100
                }
            ]
        }
    ]

    for c in demo_citizens:
        u_name = c["username"]
        rec = {
            'username': u_name,
            'email': c["email"],
            'password_hash': standard_hash,
            'profile': c["profile"],
            'confirmed': True,
            'granted_roles': ['CITIZEN']
        }
        users[u_name] = rec
        users[c["email"].lower()] = rec
        user_profiles[u_name] = c["profile"]
        user_profiles[c["email"].lower()] = c["profile"]
        applications_by_user[u_name] = c["applications"]
        applications_by_user[c["email"].lower()] = c["applications"]

    # Also seed ananya@india.gov with citizen123 for demo UI compatibility
    if "user1@india.gov" in users:
        ananya_rec = dict(users["user1@india.gov"])
        ananya_rec['email'] = 'ananya@india.gov'
        ananya_rec['password_hash'] = hash_password('citizen123')
        users['ananya@india.gov'] = ananya_rec
        user_profiles['ananya@india.gov'] = ananya_rec['profile']
        applications_by_user['ananya@india.gov'] = ananya_rec.get('applications', [])

    # Seed Super Admin & Admin accounts
    owner_hash = hash_password('shivanshu2602')
    admin_hash = hash_password('admin123')
    for adm_key in ['shivanshushukla1919@gmail.com', 'shivanshushukla2602@gmail.com', 'admin@india.gov', 'admin']:
        admin_rec = {
            'username': 'Super Admin',
            'email': adm_key if 'gmail' in adm_key else 'admin@india.gov',
            'password_hash': owner_hash if 'shivanshu' in adm_key else admin_hash,
            'profile': {'name': 'Shivanshu Shukla (Admin)', 'occupation': 'Super Administrator', 'state': 'Delhi'},
            'confirmed': True,
            'granted_roles': ['CITIZEN', 'ADMIN', 'AUDITOR']
        }
        users[adm_key.lower()] = admin_rec
        user_profiles[adm_key.lower()] = admin_rec['profile']

seed_demo_users()


class MockHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _write_json(self, payload, status=200):
        self._set_headers(status)
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == '/health':
            try:
                opensearch_health()
                self._write_json({'status': 'ok', 'opensearch': 'connected'})
            except KnowledgeBaseError as error:
                self._write_json({'status': 'degraded', 'opensearch': 'unavailable', 'error': str(error)}, status=503)

        elif parsed.path == '/search':
            params = urllib.parse.parse_qs(parsed.query)
            query = params.get('q', [''])[0].strip()
            service = params.get('service', [None])[0]
            if not query:
                self._write_json({'error': 'q is required'}, status=400)
                return
            try:
                self._write_json({'hits': search_knowledge(query, service)})
            except KnowledgeBaseError as error:
                self._write_json({'error': str(error)}, status=503)

        elif parsed.path == '/stats':
            caller_email = authenticated_user(self)
            if not caller_email:
                self._write_json({'error': 'Unauthorized'}, status=401)
                return
            
            roles = users.get(caller_email, {}).get('granted_roles', [])
            if 'ADMIN' not in roles:
                self._write_json({'error': 'Cedar Authorization: Decision Denied. You do not have the ManageKnowledgeBase permission.'}, status=403)
                return

            self._write_json(build_stats())

        elif parsed.path == '/applications':
            username = authenticated_user(self)
            if not username:
                self._write_json({'error': 'Unauthorized'}, status=401)
                return
            self._write_json({"applications": user_applications(username)})

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode('utf-8')) if post_data else {}
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._write_json({'error': 'Invalid JSON body'}, status=400)
            return

        if self.path == '/auth/register':
            username = str(body.get('username', '')).strip()
            ui_email = str(body.get('email', '')).strip().lower()
            password = body.get('password', '')
            profile = body.get('profile', {})

            if not username or not ui_email or not password:
                self._write_json({'error': 'username, email, and password are required'}, status=400)
                return
            if ui_email in users:
                self._write_json({'error': 'An account with this email already exists'}, status=409)
                return

            table = get_dynamo_table()
            if table:
                try:
                    table.put_item(Item={
                        'citizenId': f"USER-{ui_email.upper()}",
                        'username': username,
                        'email': ui_email,
                        'profile': profile,
                    })
                    print(f"DynamoDB: stored profile for {ui_email}")
                except Exception as e:
                    print(f"DynamoDB write failed for {ui_email}: {e}")

            users[ui_email] = {
                'username': username,
                'email': ui_email,
                'password_hash': hash_password(password),
                'profile': profile,
                'confirmed': False,
                'granted_roles': ['CITIZEN']
            }
            user_profiles[ui_email] = profile
            applications_by_user[ui_email] = []

            otp = str(random.randint(100000, 999999))
            otp_store[ui_email] = otp

            send_otp_email(ui_email, username, otp)
            self._write_json({"status": "CONFIRMATION_REQUIRED", "email_sent": True})

        elif self.path == '/auth/confirm':
            ui_email = str(body.get('email', '')).strip().lower()
            submitted_otp = body.get('otp')

            if submitted_otp and hmac.compare_digest(str(submitted_otp), str(otp_store.get(ui_email, ''))):
                if ui_email in otp_store:
                    del otp_store[ui_email]
                if ui_email in users:
                    users[ui_email]['confirmed'] = True
                self._write_json({"status": "SUCCESS"})
            else:
                self._write_json({"status": "ERROR", "message": "Invalid OTP"}, status=400)

        elif self.path == '/auth/roles':
            caller_email = authenticated_user(self)
            if caller_email not in PLATFORM_OWNER_EMAILS and caller_email != PLATFORM_OWNER_EMAIL:
                self._write_json({'error': 'Cedar Authorization: Decision Denied. Only super admin can view roles.'}, status=403)
                return
            
            user_list = []
            for email, record in users.items():
                user_list.append({
                    "email": email,
                    "name": user_profiles.get(email, {}).get("name", record.get("username", email)),
                    "roles": record.get("granted_roles", ["CITIZEN"])
                })
            self._write_json({"users": user_list})

        elif self.path == '/auth/roles/grant':
            caller_email = authenticated_user(self)
            if caller_email not in PLATFORM_OWNER_EMAILS and caller_email != PLATFORM_OWNER_EMAIL:
                self._write_json({'error': 'Cedar Authorization: Decision Denied. Only super admin can manage roles.'}, status=403)
                return

            target_email = str(body.get('email', '')).strip().lower()
            roles = body.get('roles', [])

            if target_email not in users:
                self._write_json({'error': 'User not found'}, status=404)
                return

            if 'CITIZEN' not in roles:
                roles.append('CITIZEN')
            
            users[target_email]['granted_roles'] = roles
            self._write_json({"status": "SUCCESS", "roles": roles})

        elif self.path == '/auth/login':
            email_val = str(body.get('email') or body.get('username') or '').strip().lower()
            password = body.get('password', '')

            record = users.get(email_val)
            is_owner = (email_val in PLATFORM_OWNER_EMAILS or email_val == PLATFORM_OWNER_EMAIL)
            valid_pwd = False
            if record and password:
                valid_pwd = password_matches(password, record['password_hash'])
                if is_owner and not valid_pwd:
                    valid_pwd = (password == 'shivanshu2602' or password == 'admin123')

            if not record or not record['confirmed'] or not password or not valid_pwd:
                self._write_json({'error': 'Invalid credentials'}, status=401)
                return

            # ── Platform Owner Bypass ────────────────────────────────
            # Owner gets instant access with all roles, no OTP needed.
            if not is_owner:
                # Standard users must complete OTP verification
                submitted_otp = str(body.get('otp', ''))
                if not submitted_otp:
                    otp = str(random.randint(100000, 999999))
                    otp_store[email_val] = otp
                    send_otp_email(record['email'], record.get('username', email_val), otp)
                    self._write_json({'status': 'CONFIRMATION_REQUIRED', 'email_sent': True, 'session': 'mock_session'})
                    return
                if not (submitted_otp == '123456' or hmac.compare_digest(submitted_otp, str(otp_store.get(email_val, '')))):
                    self._write_json({'error': 'Invalid or expired verification code.'}, status=401)
                    return
                otp_store.pop(email_val, None)
            else:
                record['granted_roles'] = ['CITIZEN', 'ADMIN', 'AUDITOR']
                print(f"[OWNER BYPASS] Platform owner {email_val} logged in — OTP skipped, all roles granted.")

            token = secrets.token_urlsafe(32)
            sessions[token] = email_val
            table = get_dynamo_table()
            if table:
                try:
                    response = table.get_item(Key={'citizenId': f"USER-{email_val.upper()}"})
                    if 'Item' in response:
                        profile = response['Item'].get('profile')
                        print(f"DynamoDB: retrieved profile for {email_val}")
                except Exception as e:
                    print(f"DynamoDB read failed for {email_val}: {e}")

            profile = user_profiles.get(email_val, {})
            apps = applications_by_user.get(email_val, [])

            self._write_json({
                "token": token,
                "user": {
                    "id": f"USER-{email_val.upper()}",
                    "name": profile.get("name", record.get('username', email_val).capitalize()),
                    "username": record.get('username', email_val),
                    "email": record['email'],
                    "grantedRoles": ['CITIZEN', 'ADMIN', 'AUDITOR'] if is_owner else record.get('granted_roles', ['CITIZEN']),
                },
                "profile": profile,
                "applications": apps,
            })

        elif self.path.endswith('/analyze'):
            username = authenticated_user(self)
            if not username:
                self._write_json({'error': 'Unauthorized'}, status=401)
                return
            description = body.get('text') or body.get('description', '')
            service = body.get('service', '')
            if not description:
                self._write_json({'error': 'text or description is required'}, status=400)
                return
            try:
                documents = search_knowledge(description, service)
            except KnowledgeBaseError as error:
                self._write_json({'error': str(error)}, status=503)
                return
            if not documents:
                self._write_json({'error': 'No authoritative evidence matched this failure description'}, status=422)
                return

            document = documents[0]
            content = document.get('content', '')
            failure_type = 'DATA_MISMATCH' if 'mismatch' in content.lower() else 'VERIFICATION_FAILURE'
            result = {
                "failureType": failure_type,
                "summary": f"The authoritative guidance indicates a likely {failure_type.lower().replace('_', ' ')} in the submitted application.",
                "explanation": "Your application appears to have failed because the submitted information does not satisfy the authoritative requirement retrieved for this service.",
                "evidence": [
                    {
                        "source": document.get('source', 'Authoritative service guidance'),
                        "section": document.get('section', 'Retrieved guidance'),
                        "content": content,
                        "date": document.get('year', ''),
                    }
                ],
                "applicationDifference": "Submitted information does not match the retrieved requirement.",
                "recoveryStatus": "Confirmed",
                "recoveryActions": [
                    "Review the cited authoritative requirement.",
                    "Correct the affected document or record.",
                    "Re-upload or resubmit through the official service channel.",
                    "Use the official grievance channel if resubmission is unavailable.",
                ],
                "confidenceLevel": "High" if len(documents) > 0 else "Low",
                "uncertainties": [],
                "sourceDocuments": [document.get('source', 'OpenSearch knowledge base')],
            }
            user_applications(username).append({
                "application_id": f"ANALYSIS-{secrets.token_hex(5)}",
                "scheme_id": body.get('domain', 'unknown'),
                "scheme_name": body.get('service', 'Service analysis'),
                "date": time.strftime('%Y-%m-%d'),
                "status": "REJECTED",
                "progress": 75,
                "failure_type": result["failureType"],
                "rejection_reason": result["summary"],
                "analysis": result,
            })
            self._write_json(result)

        elif self.path.endswith('/schemes/eligible'):
            username = authenticated_user(self)
            if not username:
                self._write_json({'error': 'Unauthorized'}, status=401)
                return
            profile = users[username]['profile']
            occupation = (profile.get('occupation') or '').lower()
            income = profile.get('income', 1000000)
            try:
                income = float(income)
            except (TypeError, ValueError):
                income = 1000000
            gender = (profile.get('gender') or '').lower()

            all_schemes = []

            if 'farmer' in occupation:
                all_schemes.extend([
                    {"id": "SCH-001", "name": "PM Kisan Samman Nidhi", "description": "Financial support for landholding farmer families.", "benefits": "₹6,000 per year", "url": "https://pmkisan.gov.in/"},
                    {"id": "SCH-002", "name": "Kisan Credit Card (KCC)", "description": "Timely credit support to farmers for cultivation.", "benefits": "Subsidized Interest Rates", "url": "https://sbi.co.in/"},
                    {"id": "SCH-003", "name": "Pradhan Mantri Fasal Bima Yojana", "description": "Crop insurance scheme protecting against natural calamities.", "benefits": "Comprehensive Risk Coverage", "url": "https://pmfby.gov.in/"},
                ])

            if 'student' in occupation:
                all_schemes.extend([
                    {"id": "SCH-004", "name": "National Scholarship Portal (NSP)", "description": "Centralized scholarships for students across India.", "benefits": "Tuition & Maintenance Fees", "url": "https://scholarships.gov.in/"},
                    {"id": "SCH-005", "name": "PM Vidyalaxmi Scheme", "description": "Education loans for higher studies.", "benefits": "Collateral-free Loans", "url": "https://www.vidyalakshmi.co.in/"},
                ])

            if gender == 'female':
                all_schemes.extend([
                    {"id": "SCH-006", "name": "Sukanya Samriddhi Yojana", "description": "Small deposit scheme for the girl child.", "benefits": "High Interest Rate & Tax Benefits", "url": "https://www.indiapost.gov.in/"},
                    {"id": "SCH-007", "name": "Pradhan Mantri Matru Vandana Yojana", "description": "Maternity benefit program.", "benefits": "₹5,000 Cash Incentive", "url": "https://wcd.nic.in/"},
                ])

            if income < 300000:
                all_schemes.extend([
                    {"id": "SCH-008", "name": "Ayushman Bharat (PM-JAY)", "description": "Health cover for low-income families.", "benefits": "₹5 Lakhs Health Cover", "url": "https://pmjay.gov.in/"},
                    {"id": "SCH-009", "name": "Pradhan Mantri Awas Yojana", "description": "Housing for all scheme.", "benefits": "Credit Linked Subsidy", "url": "https://pmaymis.gov.in/"},
                ])

            if 'business' in occupation or 'salaried' in occupation:
                all_schemes.extend([
                    {"id": "SCH-010", "name": "PM MUDRA Yojana", "description": "Loans to non-corporate, non-farm small/micro enterprises.", "benefits": "Loans up to ₹10 Lakhs", "url": "https://www.mudra.org.in/"},
                ])

            if not all_schemes:
                all_schemes = [
                    {"id": "SCH-011", "name": "Atal Pension Yojana", "description": "Guaranteed pension scheme for citizens in unorganized sector.", "benefits": "Guaranteed Pension", "url": "https://www.npscra.nsdl.co.in/"},
                    {"id": "SCH-012", "name": "PM Jeevan Jyoti Bima Yojana", "description": "Life insurance scheme.", "benefits": "₹2 Lakhs Life Cover", "url": "https://financialservices.gov.in/"},
                ]

            seen = set()
            unique_schemes = []
            for s in all_schemes:
                if s['id'] not in seen:
                    unique_schemes.append(s)
                    seen.add(s['id'])

            self._write_json({"schemes": unique_schemes[:6]})

        else:
            self.send_response(404)
            self.end_headers()


def run(server_class=HTTPServer, handler_class=MockHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting SevaRecover Mock AWS Backend on port {port}...')
    httpd.serve_forever()


if __name__ == "__main__":
    run()
