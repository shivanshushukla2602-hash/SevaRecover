"""SAM handlers for Cognito-backed authentication and citizen data."""

import json
import os
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError


cognito = boto3.client("cognito-idp", region_name=os.environ.get("AWS_REGION", "us-east-1"))
dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))


def _response(status, payload):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": os.environ.get("CORS_ORIGIN", "*"),
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
            "Content-Type": "application/json",
        },
        "body": json.dumps(payload, default=lambda value: float(value) if isinstance(value, Decimal) else str(value)),
    }


def _body(event):
    try:
        return json.loads(event.get("body") or "{}")
    except (TypeError, json.JSONDecodeError):
        raise ValueError("Invalid JSON body")


def _user_pool_client_id():
    client_id = os.environ.get("USER_POOL_CLIENT_ID")
    if not client_id:
        raise RuntimeError("USER_POOL_CLIENT_ID is not configured")
    return client_id


def _claims(event):
    return (event.get("requestContext", {}).get("authorizer", {}).get("claims") or {})


def _profile_table():
    return dynamodb.Table(os.environ.get("CITIZENS_TABLE", "SevaRecover-Citizens"))


def _applications_table():
    return dynamodb.Table(os.environ.get("APPLICATIONS_TABLE", "SevaRecover-Applications"))


def register(event, _context):
    try:
        body = _body(event)
        email = str(body.get("email", "")).strip().lower()
        password = body.get("password", "")
        profile = body.get("profile") or {}
        if not email or not password:
            return _response(400, {"error": "email and password are required"})

        result = cognito.sign_up(
            ClientId=_user_pool_client_id(),
            Username=email,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email}],
        )
        _profile_table().put_item(Item={
            "citizenId": result["UserSub"],
            "email": email,
            "username": body.get("username", email.split("@", 1)[0]),
            "profile": profile,
        })
        return _response(200, {"status": "CONFIRMATION_REQUIRED", "email_sent": True})
    except ClientError as error:
        code = error.response.get("Error", {}).get("Code", "")
        if code in {"UsernameExistsException", "AliasExistsException"}:
            return _response(409, {"error": "An account with this email already exists"})
        return _response(400, {"error": "Registration failed"})
    except (ValueError, RuntimeError):
        return _response(400, {"error": "Invalid registration request"})


def confirm(event, _context):
    try:
        body = _body(event)
        cognito.confirm_sign_up(
            ClientId=_user_pool_client_id(),
            Username=str(body.get("email") or body.get("username", "")).strip().lower(),
            ConfirmationCode=str(body.get("otp", "")),
        )
        return _response(200, {"status": "SUCCESS"})
    except (ClientError, ValueError, RuntimeError):
        return _response(400, {"error": "Invalid OTP"})


def login(event, _context):
    try:
        body = _body(event)
        email = str(body.get("email") or body.get("username", "")).strip().lower()
        otp = str(body.get("otp", "")).strip()
        session = str(body.get("session", "")).strip()
        user_pool_id = os.environ.get("USER_POOL_ID")

        if not otp:
            # Step 1: Initiate Custom Auth
            result = cognito.admin_initiate_auth(
                UserPoolId=user_pool_id,
                ClientId=_user_pool_client_id(),
                AuthFlow="CUSTOM_AUTH",
                AuthParameters={"USERNAME": email},
            )
            if result.get("ChallengeName") == "CUSTOM_CHALLENGE":
                return _response(200, {
                    "status": "CONFIRMATION_REQUIRED",
                    "session": result.get("Session")
                })
            else:
                return _response(401, {"error": "Unexpected auth flow state."})
        else:
            # Step 2: Respond to Custom Challenge
            if not session:
                return _response(400, {"error": "Session string required with OTP"})
                
            result = cognito.admin_respond_to_auth_challenge(
                UserPoolId=user_pool_id,
                ClientId=_user_pool_client_id(),
                ChallengeName="CUSTOM_CHALLENGE",
                Session=session,
                ChallengeResponses={
                    "USERNAME": email,
                    "ANSWER": otp
                }
            )
            
            if "AuthenticationResult" not in result:
                return _response(401, {"error": "Invalid OTP"})
                
            token = result["AuthenticationResult"]["IdToken"]
            claims = json.loads(__import__("base64").urlsafe_b64decode(token.split(".")[1] + "=="))
            user_id = claims["sub"]
            profile_item = _profile_table().get_item(Key={"citizenId": user_id}).get("Item", {})
            applications = _applications_table().query(
                KeyConditionExpression="citizenId = :citizen_id",
                ExpressionAttributeValues={":citizen_id": user_id},
            ).get("Items", [])
            return _response(200, {
                "token": token,
                "user": {"id": user_id, "name": profile_item.get("username", email.split("@", 1)[0]), "email": email},
                "profile": profile_item.get("profile", {}),
                "applications": applications,
            })
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code == "UserLambdaValidationException" and "SES_DELIVERY_FAILED" in str(e):
            return _response(500, {"error": "Couldn't send OTP, please try again."})
        print(f"Login ClientError: {e}")
        return _response(401, {"error": "Invalid credentials or OTP"})
    except (KeyError, ValueError, RuntimeError) as e:
        print(f"Login error: {e}")
        return _response(401, {"error": "Invalid credentials or OTP"})


def applications(event, _context):
    claims = _claims(event)
    citizen_id = claims.get("sub")
    if not citizen_id:
        return _response(401, {"error": "Unauthorized"})
    try:
        items = _applications_table().query(
            KeyConditionExpression="citizenId = :citizen_id",
            ExpressionAttributeValues={":citizen_id": citizen_id},
        ).get("Items", [])
        return _response(200, {"applications": items})
    except ClientError:
        return _response(503, {"error": "Applications service unavailable"})


def schemes(event, _context):
    claims = _claims(event)
    citizen_id = claims.get("sub")
    if not citizen_id:
        return _response(401, {"error": "Unauthorized"})
    try:
        profile = _profile_table().get_item(Key={"citizenId": citizen_id}).get("Item", {}).get("profile", {})
        occupation = str(profile.get("occupation", "")).lower()
        income = float(profile.get("income", 1000000))
        results = []
        if "farmer" in occupation:
            results.append({"id": "SCH-001", "name": "PM Kisan Samman Nidhi", "description": "Financial support for landholding farmer families.", "benefits": "₹6,000 per year", "url": "https://pmkisan.gov.in/"})
        if "student" in occupation:
            results.append({"id": "SCH-004", "name": "National Scholarship Portal", "description": "Centralized scholarships for students.", "benefits": "Tuition and maintenance support", "url": "https://scholarships.gov.in/"})
        if income < 300000:
            results.append({"id": "SCH-008", "name": "Ayushman Bharat", "description": "Health cover for eligible low-income families.", "benefits": "Health cover", "url": "https://pmjay.gov.in/"})
        unique = {scheme["id"]: scheme for scheme in results}
        return _response(200, {"schemes": list(unique.values())})
    except (ClientError, ValueError):
        return _response(503, {"error": "Scheme service unavailable"})


def handler(event, context):
    path = event.get("path", "")
    method = event.get("httpMethod", "").upper()
    if method == "OPTIONS":
        return _response(204, {})
    routes = {
        ("/auth/register", "POST"): register,
        ("/auth/confirm", "POST"): confirm,
        ("/auth/login", "POST"): login,
        ("/applications", "GET"): applications,
        ("/schemes/eligible", "POST"): schemes,
    }
    function = routes.get((path, method))
    return function(event, context) if function else _response(404, {"error": "Not found"})
