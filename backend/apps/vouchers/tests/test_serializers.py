from __future__ import annotations

from datetime import UTC, datetime

import pytest

from apps.vouchers.serializers import GiftVoucherInputSerializer

VALID_BASE = {
    "purchaser_name": "Alice",
    "purchaser_email": "alice@example.com",
    "recipient_name": "Bob",
    "recipient_email": "bob@example.com",
    "message": "Happy birthday!",
    "preferred_date": None,
}

NOW = datetime(2026, 3, 1, 10, 0, tzinfo=UTC)
LATER = datetime(2026, 3, 1, 11, 0, tzinfo=UTC)


# ── Happy-path ──────────────────────────────────────────────


class TestGiftVoucherInputValid:
    def test_voucher_only(self):
        s = GiftVoucherInputSerializer(data=VALID_BASE)
        assert s.is_valid(), s.errors

    def test_voucher_with_all_booking_fields(self):
        data = {
            **VALID_BASE,
            "service_id": 1,
            "start_datetime": NOW.isoformat(),
            "end_datetime": LATER.isoformat(),
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors

    def test_booking_fields_default_to_none(self):
        s = GiftVoucherInputSerializer(data=VALID_BASE)
        s.is_valid()
        assert s.validated_data["service_id"] is None
        assert s.validated_data["start_datetime"] is None
        assert s.validated_data["end_datetime"] is None

    def test_preferred_date_is_optional(self):
        data = {**VALID_BASE}
        data.pop("preferred_date")
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors

    def test_message_blank_allowed(self):
        data = {**VALID_BASE, "message": ""}
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors


# ── Cross-field validation (all-or-none) ────────────────────


class TestBookingFieldsCrossValidation:
    @pytest.mark.parametrize(
        "partial_fields,ids",
        [
            (
                {"service_id": 1},
                "only_service_id",
            ),
            (
                {"start_datetime": NOW.isoformat()},
                "only_start",
            ),
            (
                {"end_datetime": LATER.isoformat()},
                "only_end",
            ),
            (
                {
                    "service_id": 1,
                    "start_datetime": NOW.isoformat(),
                },
                "missing_end",
            ),
            (
                {
                    "service_id": 1,
                    "end_datetime": LATER.isoformat(),
                },
                "missing_start",
            ),
            (
                {
                    "start_datetime": NOW.isoformat(),
                    "end_datetime": LATER.isoformat(),
                },
                "missing_service_id",
            ),
        ],
        ids=[
            "only_service_id",
            "only_start",
            "only_end",
            "missing_end",
            "missing_start",
            "missing_service_id",
        ],
    )
    def test_partial_booking_fields_rejected(self, partial_fields, ids):
        data = {**VALID_BASE, **partial_fields}
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "non_field_errors" in s.errors
        assert "service_id" in s.errors["non_field_errors"][0]


# ── Required-field validation ───────────────────────────────


class TestRequiredFields:
    @pytest.mark.parametrize(
        "missing_field",
        [
            "purchaser_name",
            "purchaser_email",
            "recipient_name",
            "recipient_email",
        ],
    )
    def test_missing_required_field(self, missing_field):
        data = {**VALID_BASE}
        data.pop(missing_field)
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert missing_field in s.errors

    def test_invalid_email_rejected(self):
        data = {**VALID_BASE, "purchaser_email": "not-an-email"}
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "purchaser_email" in s.errors
