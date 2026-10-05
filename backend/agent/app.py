import json
import os
import secrets
import time
import boto3
try:
    from knowledge_base import KnowledgeBaseError, search as search_knowledge
except ImportError:
    from backend.knowledge_base import KnowledgeBaseError, search as search_knowledge

# For MVP, if strands-agents is not available locally or fails to auth, we fallback to a mock response.
# In a real AWS environment, this would fully utilize the Strands Agent SDK.
try:
    from strands_agents import Agent, Tool
    HAS_STRANDS = True
except ImportError:
    HAS_STRANDS = False

def search_opensearch(query, service):
    try:
        hits = search_knowledge(query, service, limit=1)
        return hits[0] if hits else None
    except KnowledgeBaseError as error:
        print("OpenSearch Error:", error)
        raise

def analyze_failure(failure_description, service):
    # This represents the logic that the Strands Agent would orchestrate using its tools.
    # 1. search_authoritative_documents()
    doc = search_opensearch(failure_description, service)
    
    if not doc:
        return {
            "service": service or "Unknown",
            "failure_type": "UNKNOWN",
            "confidence": "Low",
            "affected_requirement": "Unknown",
            "evidence": [],
            "recovery_available": False,
            "explanation": "I could not find sufficient authoritative information to determine the recovery procedure.",
            "checklist": [],
            "action_plan": []
        }
        
    # 2. classify_failure(), extract_evidence(), determine_recovery_options()
    # Based on the document retrieved, we classify and extract.
    # We will simulate the agent's LLM extraction here for the MVP.
    
    failure_type = "DATA_MISMATCH" if "mismatch" in doc["content"].lower() else "VERIFICATION_FAILURE"
    
    return {
        "service": doc.get("service", service),
        "summary": "The authoritative guidance identifies a likely mismatch or verification failure in the submitted information.",
        "failureType": failure_type,
        "failure_type": failure_type,
        "confidenceLevel": "High",
        "confidence": "High",
        "affected_requirement": "Valid document or record",
        "evidence": [
            {
                "source": doc.get("source"),
                "section": doc.get("section"),
                "content": doc.get("content")
            }
        ],
        "recovery_available": True,
        "explanation": "Your application likely failed due to a discrepancy identified during verification.",
        "checklist": [
            "Verify the details in your application.",
            "Ensure the uploaded document is valid and current."
        ],
        "recoveryActions": [
            "Review the cited authoritative requirement.",
            "Correct the affected document or record.",
            "Re-upload or resubmit through the official service channel.",
            "Use the official grievance channel if resubmission is unavailable.",
        ],
        "action_plan": [
            "Understand the failure",
            "Check the affected document",
            "Correct the information/document",
            "Follow the official correction procedure"
        ]
    }

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        failure_description = body.get("description", "")
        service = body.get("service", "")
        
        result = analyze_failure(failure_description, service)
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        citizen_id = claims.get("sub")
        if citizen_id:
            table = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1")).Table(
                os.environ.get("APPLICATIONS_TABLE", "SevaRecover-Applications")
            )
            table.put_item(Item={
                "citizenId": citizen_id,
                "applicationId": f"ANALYSIS-{secrets.token_hex(5)}",
                "scheme_name": service or "Service analysis",
                "date": time.strftime("%Y-%m-%d"),
                "status": "REJECTED",
                "failure_type": result.get("failure_type", "UNKNOWN"),
                "rejection_reason": result.get("summary", ""),
                "analysis": result,
            })
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": json.dumps(result)
        }
    except KnowledgeBaseError:
        return {
            "statusCode": 503,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Knowledge base is unavailable"})
        }
    except (KeyError, TypeError, json.JSONDecodeError):
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Invalid analysis request"})
        }
    except Exception:
        return {
            "statusCode": 503,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Analysis service unavailable"})
        }
