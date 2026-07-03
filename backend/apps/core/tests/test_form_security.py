"""Form security contract tests (prompt 03, Drop 11).

Covers, for every public form endpoint:
  - the stable error shape {"errors": [{code, field, message}]}
  - honeypot rejection with code "spam_detected"
  - length caps with code "max_length"
  - email-header injection rejection (CR/LF in header-bound fields)
  - rate limiting → 429 with code "rate_limited"
"""

import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

CONTACT_OK = {
    "name": "Test Person",
    "email": "person@example.com",
    "subject": "Question",
    "message": "A perfectly reasonable message.",
}


def _codes(response, field=None):
    errors = response.data.get("errors", [])
    return [e["code"] for e in errors if field is None or e["field"] == field]


class TestStableErrorShape:
    def test_validation_errors_carry_code_field_message(self):
        response = APIClient().post(
            "/api/contact/submit/", {**CONTACT_OK, "email": "not-an-email"},
            format="json",
        )
        assert response.status_code == 400
        entry = next(e for e in response.data["errors"] if e["field"] == "email")
        assert set(entry) >= {"code", "field", "message"}
        assert entry["code"] == "invalid"
        # Legacy DRF field-map remains until the frontend migrates
        assert "email" in response.data

    def test_missing_required_field_uses_required_code(self):
        payload = {k: v for k, v in CONTACT_OK.items() if k != "name"}
        response = APIClient().post("/api/contact/submit/", payload, format="json")
        assert _codes(response, "name") == ["required"]


class TestHoneypot:
    @pytest.mark.parametrize(
        ("url", "payload"),
        [
            ("/api/contact/submit/", CONTACT_OK),
            (
                "/api/testimonials/submit/",
                {"name": "Test Person", "rating": 5, "text": "Lovely calm session."},
            ),
        ],
    )
    def test_filled_honeypot_is_rejected_as_spam(self, url, payload):
        response = APIClient().post(
            url, {**payload, "website": "https://spam.example"}, format="json"
        )
        assert response.status_code == 400
        assert _codes(response, "website") == ["spam_detected"]

    def test_empty_honeypot_passes(self):
        response = APIClient().post(
            "/api/contact/submit/", {**CONTACT_OK, "website": ""}, format="json"
        )
        assert response.status_code == 201


class TestLengthCaps:
    def test_contact_message_capped_at_1500(self):
        response = APIClient().post(
            "/api/contact/submit/",
            {**CONTACT_OK, "message": "x" * 1501},
            format="json",
        )
        assert _codes(response, "message") == ["max_length"]

    def test_voucher_message_capped_at_500(self):
        response = APIClient().post(
            "/api/vouchers/create/",
            {
                "recipient_name": "Camille",
                "recipient_email": "c@example.com",
                "sender_name": "Marie",
                "sender_email": "m@example.com",
                "message": "x" * 501,
                "amount": "60.00",
            },
            format="json",
        )
        assert response.status_code == 400
        assert "max_length" in _codes(response, "message")


class TestHeaderInjection:
    def test_crlf_in_subject_is_rejected(self):
        response = APIClient().post(
            "/api/contact/submit/",
            {**CONTACT_OK, "subject": "Hello\r\nBcc: evil@example.com"},
            format="json",
        )
        assert response.status_code == 400
        assert "invalid" in _codes(response, "subject")

    def test_crlf_in_name_is_rejected(self):
        response = APIClient().post(
            "/api/contact/submit/",
            {**CONTACT_OK, "name": "Eve\nX-Injected: 1"},
            format="json",
        )
        assert "invalid" in _codes(response, "name")


class TestRateLimiting:
    def test_sixth_contact_submission_within_window_is_throttled(self):
        client = APIClient()
        for _ in range(5):
            assert (
                client.post("/api/contact/submit/", CONTACT_OK, format="json")
                .status_code
                == 201
            )
        response = client.post("/api/contact/submit/", CONTACT_OK, format="json")
        assert response.status_code == 429
        assert _codes(response) == ["rate_limited"]
        assert "wait_seconds" in response.data["errors"][0]["params"]
