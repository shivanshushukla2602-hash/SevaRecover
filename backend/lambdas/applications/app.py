import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('APPLICATIONS_TABLE', 'SevaRecover-Applications'))

def lambda_handler(event, context):
    # Extract the citizenId from the Cognito Authorizer claims
    try:
        claims = event['requestContext']['authorizer']['claims']
        citizen_id = claims['sub'] # Cognito unique user identifier
    except KeyError:
        return {
            'statusCode': 401,
            'body': json.dumps({'error': 'Unauthorized: Missing valid Cognito identity.'})
        }
    
    # Query DynamoDB only for this citizen's applications
    response = table.query(
        KeyConditionExpression="citizenId = :cid",
        ExpressionAttributeValues={":cid": citizen_id}
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'applications': response.get('Items', [])})
    }
