from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest
from django.urls import reverse

ENDPOINT = reverse("create_voucher")

VALID_PAYLOAD = {
    "purchaser_name": "Alice",
    "purchaser_email": "alice@example.com",
    "recipient_name": "Bob",
    "recipient_email": "bob@example.com",
    "message": "Enjoy!",
    "preferred_date": None,
}

NOW = datetime(2026, 3, 1, 10, 0, tzinfo=UTC)
LATER = datetime(2026, 3, 1, 11, 0, tzinfo=UTC)


@pytest.fixture(autouse=True)
def _silence_emails(monkeypatch):
    """All view tests bypass Wagtail-dependent email logic."""
    monkeypatch.setattr(
        "apps.vouchers.views.send_voucher_emails",
        lambda **kwargs: None,
    )


# ── Success paths ────────────────────────────────────────────


class TestCreateVoucherViewSuccess:
    @pytest.mark.django_db
    def test_returns_201_with_code(self, client):
        resp = client.post(
            ENDPOINT,
            data=VALID_PAYLOAD,
            content_type="application/json",
        )
        assert resp.status_code == 201
        body = resp.json()
        assert "code" in body
        assert len(body["code"]) >= 6
        assert body["booking_confirmation"] == ""

    @pytest.mark.django_db
    def test_voucher_persisted_in_db(self, client):
        from apps.vouchers.models import GiftVoucher

        resp = client.post(
            ENDPOINT,
            data=VALID_PAYLOAD,
            content_type="application/json",
        )
        code = resp.json()["code"]
        assert GiftVoucher.objects.filter(code=code).exists()

    @pytest.mark.django_db
    def test_with_booking_fields(self, client, available_service):
        mock_booking = MagicMock()
        mock_booking.confirmation_code = "CAL12345"

        payload = {
            **VALID_PAYLOAD,
            "service_id": available_service.pk,
            "start_datetime": NOW.isoformat(),
            "end_datetime": LATER.isoformat(),
        }

        with patch(
            "apps.bookings.services.create_voucher_booking",
            return_value=(mock_booking, None),
        ):
            resp = client.post(
                ENDPOINT,
                data=payload,
                content_type="application/json",
            )

        assert resp.status_code == 201
        assert resp.json()["booking_confirmation"] == "CAL12345"


# ── Validation errors ───────────────────────────────────────


class TestCreateVoucherViewValidation:
    @pytest.mark.django_db
    def test_missing_required_field_returns_400(self, client):
        bad_payload = {**VALID_PAYLOAD}
        del bad_payload["purchaser_name"]
        resp = client.post(
            ENDPOINT,
            data=bad_payload,
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert "purchaser_name" in resp.json()

    @pytest.mark.django_db
    def test_partial_booking_fields_returns_400(self, client):
        payload = {**VALID_PAYLOAD, "service_id": 1}
        resp = client.post(
            ENDPOINT,
            data=payload,
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert "non_field_errors" in resp.json()

    @pytest.mark.django_db
    def test_invalid_email_returns_400(self, client):
        payload = {**VALID_PAYLOAD, "recipient_email": "not-valid"}
        resp = client.post(
            ENDPOINT,
            data=payload,
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert "recipient_email" in resp.json()


# ── Method not allowed ───────────────────────────────────────


class TestCreateVoucherViewMethodNotAllowed:
    @pytest.mark.django_db
    def test_get_returns_405(self, client):
        resp = client.get(ENDPOINT)
        assert resp.status_code == 405

    @pytest.mark.django_db
    def test_put_returns_405(self, client):
        resp = client.put(
            ENDPOINT,
            data=VALID_PAYLOAD,
            content_type="application/json",
        )
        assert resp.status_code == 405
