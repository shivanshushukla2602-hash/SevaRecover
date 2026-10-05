"""Small dependency-light OpenSearch client shared by local and Lambda handlers."""

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class KnowledgeBaseError(RuntimeError):
    """Raised when the configured knowledge base cannot be queried."""


def _base_url():
    configured = os.environ.get("OPENSEARCH_ENDPOINT") or os.environ.get("OPENSEARCH_HOST", "localhost")
    if "://" not in configured:
        configured = f"http://{configured}"
    parsed = urlparse(configured)
    port = os.environ.get("OPENSEARCH_PORT")
    netloc = parsed.hostname or "localhost"
    if parsed.port:
        netloc = f"{netloc}:{parsed.port}"
    elif port:
        netloc = f"{netloc}:{port}"
    return f"{parsed.scheme}://{netloc}".rstrip("/")


def _request(path, payload=None):
    url = f"{_base_url()}{path}"
    headers = {"Accept": "application/json"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")

    username = os.environ.get("OPENSEARCH_USER")
    password = os.environ.get("OPENSEARCH_PASSWORD")
    if username and password:
        import base64
        credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {credentials}"

    try:
        with urlopen(Request(url, data=data, headers=headers, method="POST" if data else "GET"), timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        raise KnowledgeBaseError(f"OpenSearch request failed: {error}") from error


def health():
    return _request("/")


def search(query, service=None, limit=5):
    must = [{"match": {"content": query}}]
    should = []
    if service:
        should.extend([
            {"match": {"service": service}},
            {"match": {"domain": service}},
        ])

    body = {
        "size": limit,
        "query": {
            "bool": {
                "must": must,
                "should": should,
            }
        },
    }
    response = _request(f"/{os.environ.get('OPENSEARCH_INDEX', 'sevarecover-knowledge')}/_search", body)
    return [hit.get("_source", {}) for hit in response.get("hits", {}).get("hits", [])]
