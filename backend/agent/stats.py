import json
import os
import boto3


def _stats_from_applications():
    table = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1")).Table(
        os.environ.get("APPLICATIONS_TABLE", "SevaRecover-Applications")
    )
    items = []
    response = table.scan()
    items.extend(response.get("Items", []))
    while response.get("LastEvaluatedKey"):
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    total = len(items)
    counts = {}
    for item in items:
        category = item.get("failure_type", "OTHER").replace("_", " ").title()
        counts[category] = counts.get(category, 0) + 1
    categories = [
        {"name": name, "percentage": round(count / total * 100) if total else 0}
        for name, count in sorted(counts.items(), key=lambda entry: entry[1], reverse=True)
    ]
    top_category = categories[0]["name"] if categories else "No analyzed cases"
    service_counts = {}
    for item in items:
        service = item.get("scheme_name", "Unknown service")
        service_counts[service] = service_counts.get(service, 0) + 1
    top_service = max(service_counts, key=service_counts.get) if service_counts else "No analyzed services"
    return {
        "total_analyzed": total,
        "categories": categories,
        "insights": {
            "most_recurring": top_category,
            "most_affected_service": top_service,
            "emerging_pattern": "Derived from citizen application records",
        },
    }

def lambda_handler(event, context):
    try:
        stats = _stats_from_applications()
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps(stats)
        }
    except Exception:
        return {
            "statusCode": 503,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Statistics service unavailable"})
        }
