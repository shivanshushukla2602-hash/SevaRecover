import os
import json
import time
from opensearchpy import OpenSearch, helpers

# Connect to OpenSearch
host = os.environ.get("OPENSEARCH_HOST", "localhost")
port = 9200
auth = ("admin", "admin")  # Default credentials if security is enabled, though we disabled it

client = OpenSearch(
    hosts=[{"host": host, "port": port}],
    http_compress=True,
    use_ssl=False,
    verify_certs=False,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
)

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
    if client.indices.exists(index=INDEX_NAME):
        client.indices.delete(index=INDEX_NAME)
    
    mapping = {
        "mappings": {
            "properties": {
                "service": {"type": "keyword"},
                "domain": {"type": "keyword"},
                "content": {"type": "text"}
            }
        }
    }
    client.indices.create(index=INDEX_NAME, body=mapping)
    print(f"Created index: {INDEX_NAME}")

    actions = [
        {
            "_index": INDEX_NAME,
            "_source": doc
        }
        for doc in DOCUMENTS
    ]
    helpers.bulk(client, actions)
    print(f"Indexed {len(DOCUMENTS)} documents.")

if __name__ == "__main__":
    setup_index()
