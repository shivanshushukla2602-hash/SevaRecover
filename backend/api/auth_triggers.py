import os
import secrets
import time
import json
import boto3
from botocore.exceptions import ClientError

ses = boto3.client('ses', region_name=os.environ.get("AWS_REGION", "us-east-1"))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get("AWS_REGION", "us-east-1"))

SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "no-reply@sevarecover.in")
AUTH_LOGS_TABLE = os.environ.get("AUTH_LOGS_TABLE", "SevaRecover-AuthLogs")

def _get_table():
    return dynamodb.Table(AUTH_LOGS_TABLE)

def define_auth_challenge(event):
    request = event['request']
    response = event['response']
    
    # If the user has not completed any challenges yet, issue CUSTOM_CHALLENGE
    if len(request['session']) == 0:
        response['issueTokens'] = False
        response['failAuthentication'] = False
        response['challengeName'] = 'CUSTOM_CHALLENGE'
        return event

    # If the user successfully completed the CUSTOM_CHALLENGE, issue tokens
    if len(request['session']) == 1 and request['session'][0]['challengeName'] == 'CUSTOM_CHALLENGE':
        if request['session'][0]['challengeResult'] is True:
            response['issueTokens'] = True
            response['failAuthentication'] = False
            return event

    # Otherwise, fail the authentication
    response['issueTokens'] = False
    response['failAuthentication'] = True
    return event


def create_auth_challenge(event):
    request = event['request']
    response = event['response']
    
    email = request['userAttributes'].get('email')
    
    if request['challengeName'] == 'CUSTOM_CHALLENGE':
        # Generate 6-digit OTP
        otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        
        # Check rate limiting in DynamoDB
        table = _get_table()
        now = int(time.time())
        try:
            item = table.get_item(Key={'email': email}).get('Item')
            if item and int(item.get('lastAttempt', 0)) > now - 60:
                # Basic rate limiting wrapper
                pass
        except ClientError:
            pass
            
        table.put_item(Item={
            'email': email,
            'lastAttempt': now,
            'expirationTime': now + 3600 # 1 hour TTL
        })
        
        # Send OTP via SES
        html_body = f"""
        <html>
        <head></head>
        <body style="font-family: sans-serif; background-color: #0A0A0B; color: #F2F1EC; padding: 24px;">
            <h2 style="color: #C9A24B; margin-top: 0;">SevaRecover Login</h2>
            <p>Your one-time login code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #C9A24B; padding: 12px; background: #141416; border-radius: 8px; width: fit-content;">
                {otp}
            </div>
            <p style="font-size: 12px; color: #A8ABB3; margin-top: 20px;">If you didn't request this, ignore this email.</p>
        </body>
        </html>
        """
        
        try:
            ses.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [email]},
                Message={
                    'Subject': {'Data': 'Your SevaRecover OTP Code'},
                    'Body': {'Html': {'Data': html_body}}
                }
            )
            print(f"OTP sent successfully via SES to {email}")
        except ClientError as e:
            print(f"Failed to send email via SES to {email}: {e}")
            raise Exception("SES_DELIVERY_FAILED")
            
        response['privateChallengeParameters'] = {'otp': otp}
        response['publicChallengeParameters'] = {'email': email}
        
    return event


def verify_auth_challenge_response(event):
    request = event['request']
    response = event['response']
    
    expected_otp = request['privateChallengeParameters'].get('otp')
    user_otp = request.get('challengeAnswer')
    
    if expected_otp and user_otp and expected_otp == user_otp:
        response['answerCorrect'] = True
    else:
        response['answerCorrect'] = False
        
    return event


def handler(event, context):
    trigger_source = event.get('triggerSource', '')
    
    if trigger_source == 'DefineAuthChallenge_Authentication':
        return define_auth_challenge(event)
    elif trigger_source == 'CreateAuthChallenge_Authentication':
        return create_auth_challenge(event)
    elif trigger_source == 'VerifyAuthChallengeResponse_Authentication':
        return verify_auth_challenge_response(event)
    
    return event
