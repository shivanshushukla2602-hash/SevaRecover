"""
Unit Tests for SevaRecover Tools
Uses unittest.mock to mock OpenSearch responses and verifies edge-case inputs.
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent import (
    search_authoritative_documents,
    verify_notice_authenticity,
    compare_requirements,
    classify_failure,
    find_recovery_path,
    generate_action_plan,
    generate_cover_note,
    FAILURE_CATEGORIES
)

class TestSevaRecoverTools(unittest.TestCase):

    # 1. Test search_authoritative_documents tool with mocked OpenSearch
    @patch('agent.get_opensearch_client')
    def test_search_authoritative_documents_valid(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.ping.return_value = True
        mock_client.search.return_value = {
            "hits": {
                "hits": [
                    {"_source": {"content": "Sample guideline text", "source": "SSP Gazette"}}
                ]
            }
        }
        mock_get_client.return_value = mock_client

        results = search_authoritative_documents("income certificate", "scholarship")
        self.assertIsInstance(results, list)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["source"], "SSP Gazette")

    def test_search_authoritative_documents_empty_query(self):
        results = search_authoritative_documents("")
        self.assertIn("error", results[0])
        self.assertEqual(results[0]["code"], "INVALID_ARGUMENT")

    # 2. Test verify_notice_authenticity tool
    def test_verify_notice_authenticity_verified(self):
        result = verify_notice_authenticity("Notice Ref No: KAR-SSP-2025-948210")
        self.assertEqual(result["flag"], "verified_format")
        self.assertEqual(result["confidence"], "high")

    def test_verify_notice_authenticity_scam(self):
        result = verify_notice_authenticity("URGENT PAYMENT VIA UPI REQUIRED FOR REPROCESSING")
        self.assertEqual(result["flag"], "suspicious")
        self.assertIn("fraudulent", result["reason"])

    def test_verify_notice_authenticity_empty(self):
        result = verify_notice_authenticity("")
        self.assertEqual(result["flag"], "unverified")

    # 3. Test compare_requirements tool
    def test_compare_requirements_match(self):
        res = compare_requirements("Valid Proof", "Valid Proof")
        self.assertTrue(res["is_match"])

    def test_compare_requirements_mismatch(self):
        res = compare_requirements("Date: 2023", "Date: >= 2024")
        self.assertFalse(res["is_match"])

    def test_compare_requirements_invalid_args(self):
        res = compare_requirements("", "Required")
        self.assertIn("error", res)

    # 4. Test classify_failure tool for ALL categories
    def test_classify_failure_all_categories(self):
        test_cases = [
            ("Certificate is expired and outdated from 2023", "DOCUMENT_EXPIRED"),
            ("Data mismatch in land records name and Aadhaar initials", "DATA_MISMATCH"),
            ("Application verification pending Lekhpal report", "VERIFICATION_FAILURE"),
            ("Enclosure missing from application", "DOCUMENT_MISSING"),
            ("Invalid seal on certificate", "DOCUMENT_INVALID"),
            ("Submitted past deadline date", "DEADLINE_FAILURE"),
            ("Fee payment transaction failed", "PAYMENT_FAILURE"),
        ]

        for desc, expected_cat in test_cases:
            res = classify_failure(desc)
            self.assertEqual(res["category"], expected_cat, f"Failed for text: '{desc}'")

    def test_classify_failure_ambiguous_returns_unknown(self):
        res = classify_failure("Application processing query 99120")
        self.assertEqual(res["category"], "UNKNOWN")

    # 5. Test find_recovery_path tool
    def test_find_recovery_path_available(self):
        res = find_recovery_path("DOCUMENT_EXPIRED")
        self.assertTrue(res["recovery_available"])
        self.assertIn("fresh", res["summary"])

    def test_find_recovery_path_unavailable(self):
        res = find_recovery_path("UNKNOWN")
        self.assertFalse(res["recovery_available"])

    # 6. Test generate_action_plan tool
    def test_generate_action_plan_formatting(self):
        steps = [{"title": "Step A", "description": "Do A"}, {"title": "Step B", "description": "Do B"}]
        res = generate_action_plan(steps)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]["step"], 1)
        self.assertEqual(res[1]["step"], 2)

    # 7. Test generate_cover_note tool
    def test_generate_cover_note(self):
        note = generate_cover_note("Ramesh Kumar", "REF-9920", "Section 4.2 Gazette")
        self.assertIn("Ramesh Kumar", note)
        self.assertIn("REF-9920", note)
        self.assertIn("Section 4.2 Gazette", note)

if __name__ == '__main__':
    unittest.main()
