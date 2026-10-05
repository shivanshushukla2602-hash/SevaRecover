import os
import json
import base64
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlparse

configured_host = os.environ.get("OPENSEARCH_HOST", "localhost")
if "://" in configured_host:
    parsed_host = urlparse(configured_host)
    host = parsed_host.hostname or "localhost"
    port = parsed_host.port or int(os.environ.get("OPENSEARCH_PORT", "9200"))
else:
    host = configured_host
    port = int(os.environ.get("OPENSEARCH_PORT", "9200"))
username = os.environ.get("OPENSEARCH_USER")
password = os.environ.get("OPENSEARCH_PASSWORD")
BASE_URL = f"http://{host}:{port}"
AUTH_HEADER = {}
if username and password:
    encoded_credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
    AUTH_HEADER["Authorization"] = f"Basic {encoded_credentials}"

INDEX_NAME = "sevarecover-knowledge"

DOCUMENTS = [
    {
        "service": "Scholarship",
        "domain": "Education",
        "state": "Karnataka",
        "department": "Department of Minorities",
        "document_type": "guideline",
        "year": "2026",
        "section": "eligibility",
        "source": "Official Scholarship Guidelines",
        "content": "To be eligible for the scholarship, applicants must provide a valid Income Certificate issued within the last 6 months. A document mismatch occurs when the uploaded certificate is older than the assessment period or issued by an unauthorized official. If rejected due to document mismatch, the applicant must obtain a fresh Income Certificate from the Tehsildar and re-upload it within 15 days of the rejection notice."
    },
    {
        "service": "Farmer Subsidy",
        "domain": "Agriculture",
        "state": "Maharashtra",
        "department": "Agriculture Department",
        "document_type": "notification",
        "year": "2026",
        "section": "verification",
        "source": "Kisan Subsidy Manual",
        "content": "Verification failures typically happen when the land record (7/12 extract) does not match the Aadhaar name. In such cases, the benefit application remains pending. The recovery procedure is to update the spelling in the land record via the Aaple Sarkar portal, or submit an affidavit confirming identity at the Taluka agriculture office."
    },
    {
        "service": "Income Certificate",
        "domain": "Public Services",
        "state": "Delhi",
        "department": "Revenue Department",
        "document_type": "faq",
        "year": "2026",
        "section": "document mismatch",
        "source": "Revenue Department FAQ",
        "content": "If an Income Certificate application is returned due to document mismatch, it usually means the residence proof does not match the applicant's stated address. The citizen should check the uploaded utility bill or Aadhaar, ensure it reflects the current address, and re-apply using the exact address string from the proof document."
    }
]

def setup_index():
    try:
        request = Request(f"{BASE_URL}/{INDEX_NAME}", headers=AUTH_HEADER, method="DELETE")
        urlopen(request, timeout=10).read()
    except HTTPError as error:
        if error.code != 404:
            raise

    mapping = {
        "mappings": {
            "properties": {
                "service": {"type": "keyword"},
                "domain": {"type": "keyword"},
                "content": {"type": "text"}
            }
        }
    }
    request_json(f"/{INDEX_NAME}", mapping, "PUT")
    print(f"Created index: {INDEX_NAME}")

    bulk_lines = []
    for document in DOCUMENTS:
        bulk_lines.append(json.dumps({"index": {"_index": INDEX_NAME}}))
        bulk_lines.append(json.dumps(document))
    request = Request(
        f"{BASE_URL}/_bulk",
        data=("\n".join(bulk_lines) + "\n").encode(),
        headers={**AUTH_HEADER, "Content-Type": "application/x-ndjson"},
        method="POST",
    )
    urlopen(request, timeout=10).read()
    print(f"Indexed {len(DOCUMENTS)} documents.")


def request_json(path, payload, method):
    request = Request(
        f"{BASE_URL}{path}",
        data=json.dumps(payload).encode(),
        headers={**AUTH_HEADER, "Content-Type": "application/json"},
        method=method,
    )
    try:
        return json.loads(urlopen(request, timeout=10).read().decode())
    except (HTTPError, URLError) as error:
        raise RuntimeError(f"OpenSearch seed request failed: {error}") from error

if __name__ == "__main__":
    setup_index()
