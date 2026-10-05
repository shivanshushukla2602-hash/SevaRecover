"""
Integration Tests for SevaRecover Master Agent Pipeline
Executes end-to-end analysis on 3 sample failure cases across domains.
"""

import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent import run_sevarecover_pipeline

class TestAgentIntegration(unittest.TestCase):

    # Case 1: Scholarship Income Certificate Expiration / Mismatch
    def test_sample_case_1_scholarship(self):
        text = "My application was rejected. Income certificate discrepancy — certificate is from 2024, application year is 2026."
        res = run_sevarecover_pipeline(text=text, service="State Post-Matric Scholarship")
        
        self.assertEqual(res["status"], "success")
        self.assertIn(res["failure_type"], ["DOCUMENT_EXPIRED", "DATA_MISMATCH"])
        self.assertTrue(res["recovery_available"])
        self.assertIsInstance(res["action_checklist"], list)
        self.assertGreater(len(res["action_checklist"]), 0)
        self.assertIn("Resubmission", res["resubmission_cover_note"] or "")

    # Case 2: Farmer Scheme Verification Pending Hold
    def test_sample_case_2_farmer(self):
        text = "My subsidy application is pending because verification was not completed."
        res = run_sevarecover_pipeline(text=text, service="PM-KISAN Subsidies")
        
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["failure_type"], "VERIFICATION_FAILURE")
        self.assertTrue(res["recovery_available"])
        self.assertIsInstance(res["action_checklist"], list)

    # Case 3: Certificate Residence / Land Document Discrepancy
    def test_sample_case_3_certificate(self):
        text = "My residence certificate application was returned — document mismatch."
        res = run_sevarecover_pipeline(text=text, service="E-District Certificate")
        
        self.assertEqual(res["status"], "success")
        self.assertIn(res["failure_type"], ["DATA_MISMATCH", "DOCUMENT_INVALID"])
        self.assertTrue(res["recovery_available"])
        self.assertIsInstance(res["action_checklist"], list)

if __name__ == '__main__':
    unittest.main()
