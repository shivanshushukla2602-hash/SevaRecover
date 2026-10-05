"""
Amazon OpenSearch Indexer Script for SevaRecover RAG Knowledge Base.
Indexes government guidelines, scheme rules, rejection lookup tables, circulars.
"""

import json

OPENSEARCH_INDEX_MAPPING = {
    "settings": {
        "index": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    },
    "mappings": {
        "properties": {
            "service": {"type": "keyword"},
            "domain": {"type": "keyword"},
            "state": {"type": "keyword"},
            "department": {"type": "keyword"},
            "document_type": {"type": "keyword"},
            "year": {"type": "integer"},
            "effective_date": {"type": "date"},
            "section": {"type": "text"},
            "source": {"type": "text"},
            "content": {"type": "text"},
            "rejection_code": {"type": "keyword"},
            "recovery_steps": {"type": "nested"}
        }
    }
}

def create_sevarecover_index():
    print("Amazon OpenSearch SevaRecover Index Mapping initialized:")
    print(json.dumps(OPENSEARCH_INDEX_MAPPING, indent=2))

if __name__ == '__main__':
    create_sevarecover_index()
