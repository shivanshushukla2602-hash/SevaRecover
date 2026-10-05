"""
SevaRecover - OpenSearch Document Ingestion & Passage Chunking Engine
Idempotently chunks source documents (PDF/Text) and indexes them into OpenSearch.
"""

import os
import sys
import json
import hashlib
import logging
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agent import get_opensearch_client, OPENSEARCH_INDEX

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("IngestionEngine")

INDEX_MAPPING = {
    "settings": {
        "index": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    },
    "mappings": {
        "properties": {
            "content": {"type": "text"},
            "service": {"type": "keyword"},
            "domain": {"type": "keyword"},
            "state": {"type": "keyword"},
            "department": {"type": "keyword"},
            "document_type": {"type": "keyword"},
            "document_name": {"type": "keyword"},
            "section": {"type": "text"},
            "source": {"type": "text"},
            "year": {"type": "integer"},
            "effective_date": {"type": "keyword"},
            "chunk_index": {"type": "integer"}
        }
    }
}

def chunk_text(text: str, chunk_size_words: int = 400, overlap_words: int = 50) -> List[str]:
    """
    Chunks text into passages of roughly chunk_size_words with overlap_words.
    """
    words = text.split()
    if len(words) <= chunk_size_words:
        return [text]

    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size_words])
        chunks.append(chunk)
        i += (chunk_size_words - overlap_words)
    return chunks

def ensure_index_exists(client: Any):
    """Creates the OpenSearch index with explicit mappings if it does not exist."""
    if not client.indices.exists(index=OPENSEARCH_INDEX):
        logger.info(f"Creating OpenSearch index '{OPENSEARCH_INDEX}' with explicit mapping schema:")
        logger.info(json.dumps(INDEX_MAPPING, indent=2))
        client.indices.create(index=OPENSEARCH_INDEX, body=INDEX_MAPPING)
        logger.info(f"Index '{OPENSEARCH_INDEX}' created successfully.")
    else:
        logger.info(f"OpenSearch index '{OPENSEARCH_INDEX}' already exists.")

def ingest_corpus_folder(corpus_dir: str):
    """
    Reads manifest.json and documents in corpus_dir, chunks text, and indexes into OpenSearch.
    """
    client = get_opensearch_client()
    if not client or not client.ping():
        logger.error("OpenSearch cluster is not reachable. Ensure OpenSearch container is running (`docker-compose up -d`).")
        sys.exit(1)

    ensure_index_exists(client)

    manifest_path = os.path.join(corpus_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        logger.error(f"Manifest file not found at {manifest_path}")
        sys.exit(1)

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    indexed_count = 0
    for meta in manifest:
        filename = meta["filename"]
        filepath = os.path.join(corpus_dir, filename)

        if not os.path.exists(filepath):
            logger.warning(f"File {filename} specified in manifest not found at {filepath}")
            continue

        with open(filepath, 'r', encoding='utf-8') as doc_file:
            text_content = doc_file.read()

        passages = chunk_text(text_content)

        for idx, passage in enumerate(passages):
            # Idempotent SHA-256 document ID generation
            doc_id_raw = f"{filename}_{idx}_{meta.get('section', '')}"
            doc_id = hashlib.sha256(doc_id_raw.encode('utf-8')).hexdigest()

            doc_payload = {
                "content": passage,
                "service": meta.get("service", ""),
                "domain": meta.get("domain", ""),
                "state": meta.get("state", ""),
                "department": meta.get("department", ""),
                "document_type": meta.get("document_type", ""),
                "document_name": filename,
                "section": meta.get("section", ""),
                "source": meta.get("source", ""),
                "year": meta.get("year", 2025),
                "effective_date": meta.get("effective_date", ""),
                "chunk_index": idx
            }

            client.index(index=OPENSEARCH_INDEX, id=doc_id, body=doc_payload)
            indexed_count += 1
            logger.info(f"Indexed chunk {idx+1}/{len(passages)} for {filename} (ID: {doc_id[:12]})")

    logger.info(f"--- Ingestion Complete! Successfully indexed {indexed_count} passage chunks into '{OPENSEARCH_INDEX}'. ---")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sample_corpus_dir = os.path.join(os.path.dirname(script_dir), "sample_corpus")
    logger.info(f"Ingestion script targeting directory: {sample_corpus_dir}")
    ingest_corpus_folder(sample_corpus_dir)
