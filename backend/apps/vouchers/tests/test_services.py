from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest

from apps.bookings.services import (
    _build_calendar_description,
    create_voucher_booking,
)
from apps.vouchers import services as voucher_services
from apps.vouchers.models import GiftVoucher

BASE_DATA = {
    "purchaser_name": "A",
    "purchaser_email": "a@example.com",
    "recipient_name": "B",
    "recipient_email": "b@example.com",
    "message": "",
    "preferred_date": None,
}

NOW = datetime(2026, 3, 1, 10, 0, tzinfo=UTC)
LATER = datetime(2026, 3, 1, 11, 0, tzinfo=UTC)


# ── create_voucher (voucher-only) ───────────────────────────


class TestCreateVoucherOnly:
    @pytest.mark.django_db
    def test_persists_and_returns_tuple(self):
        voucher, confirmation = voucher_services.create_voucher(
            data={**BASE_DATA}
        )
        assert voucher.pk is not None
        assert voucher.code
        assert confirmation == ""

    @pytest.mark.django_db
    def test_fields_stored_correctly(self):
        voucher, _ = voucher_services.create_voucher(data={**BASE_DATA})
        assert voucher.purchaser_name == "A"
        assert voucher.recipient_email == "b@example.com"

    @pytest.mark.django_db
    def test_booking_keys_popped_before_model_save(self):
        """service_id / start_datetime / end_datetime must not reach GiftVoucher()."""
        data = {
            **BASE_DATA,
            "service_id": 999,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }
        # If keys aren't popped, GiftVoucher(**data) raises TypeError
        with patch(
            "apps.bookings.services.create_voucher_booking",
            return_value=(None, "mocked-out"),
        ):
            voucher, _ = voucher_services.create_voucher(data=data)
        assert voucher.pk is not None


# ── create_voucher (with booking) ────────────────────────────


class TestCreateVoucherWithBooking:
    @pytest.mark.django_db
    def test_delegates_to_bookings_service(self, available_service):
        mock_booking = MagicMock()
        mock_booking.confirmation_code = "BOOK1234"

        data = {
            **BASE_DATA,
            "service_id": available_service.pk,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        with patch(
            "apps.bookings.services.create_voucher_booking",
            return_value=(mock_booking, None),
        ) as mock_create:
            voucher, confirmation = voucher_services.create_voucher(data=data)

        assert confirmation == "BOOK1234"
        mock_create.assert_called_once()

        call_data = mock_create.call_args[0][0]
        assert call_data["service_id"] == available_service.pk
        assert call_data["voucher_code"] == voucher.code
        assert call_data["client_name"] == "B"
        assert call_data["client_email"] == "b@example.com"

    @pytest.mark.django_db
    def test_booking_failure_returns_empty_confirmation(self):
        data = {
            **BASE_DATA,
            "service_id": 1,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        with patch(
            "apps.bookings.services.create_voucher_booking",
            return_value=(None, "Service not found or unavailable"),
        ):
            voucher, confirmation = voucher_services.create_voucher(data=data)

        # Voucher is still created even when booking fails
        assert voucher.pk is not None
        assert confirmation == ""

    @pytest.mark.django_db
    def test_voucher_persists_even_when_booking_fails(self):
        data = {
            **BASE_DATA,
            "service_id": 1,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        with patch(
            "apps.bookings.services.create_voucher_booking",
            return_value=(None, "error"),
        ):
            voucher, _ = voucher_services.create_voucher(data=data)

        assert GiftVoucher.objects.filter(pk=voucher.pk).exists()


# ── send_voucher_emails ──────────────────────────────────────


class TestSendVoucherEmails:
    @pytest.mark.django_db
    def test_calls_both_senders(self, monkeypatch, rf, voucher_factory):
        voucher = voucher_factory()

        monkeypatch.setattr(
            voucher_services,
            "_resolve_gift_settings",
            lambda request: (None, "Serenity", ""),
        )
        monkeypatch.setattr(
            voucher_services,
            "_resolve_language",
            lambda request: "en",
        )
        monkeypatch.setattr(
            voucher_services,
            "_build_email_context",
            lambda **kwargs: {"ok": True},
        )

        called = {"recipient": 0, "admin": 0}
        monkeypatch.setattr(
            voucher_services,
            "_send_recipient_email",
            lambda *a, **k: called.__setitem__(
                "recipient", called["recipient"] + 1
            ),
        )
        monkeypatch.setattr(
            voucher_services,
            "_send_admin_email",
            lambda *a, **k: called.__setitem__("admin", called["admin"] + 1),
        )

        request = rf.post("/api/vouchers/create/")
        voucher_services.send_voucher_emails(voucher=voucher, request=request)

        assert called["recipient"] == 1
        assert called["admin"] == 1


# ── create_voucher_booking ───────────────────────────────────


class TestCreateVoucherBooking:
    @pytest.mark.django_db
    def test_happy_path(self, available_service):
        """Voucher booking is created with source='voucher'."""
        data = {
            "service_id": available_service.pk,
            "start_datetime": NOW,
            "end_datetime": LATER,
            "client_name": "Bob",
            "client_email": "bob@example.com",
            "client_phone": "",
            "client_notes": "Gift note",
            "preferred_language": "fr",
            "voucher_code": "ABCD1234",
        }

        with patch(
            "apps.bookings.services.create_booking_event",
            return_value={"id": "gcal-evt-1"},
        ):
            booking, error = create_voucher_booking(data)

        assert error is None
        assert booking is not None
        assert booking.source == "voucher"
        assert booking.voucher_code == "ABCD1234"
        assert booking.status == "confirmed"
        assert booking.google_calendar_event_id == "gcal-evt-1"

    @pytest.mark.django_db
    def test_service_not_found(self):
        data = {
            "service_id": 99999,
            "start_datetime": NOW,
            "end_datetime": LATER,
            "client_name": "X",
            "client_email": "x@example.com",
            "client_phone": "",
            "preferred_language": "en",
        }
        booking, error = create_voucher_booking(data)
        assert booking is None
        assert error == "Service not found or unavailable"

    @pytest.mark.django_db
    def test_calendar_failure_leaves_pending(self, available_service):
        """If Google Calendar fails, booking stays pending with no event ID."""
        data = {
            "service_id": available_service.pk,
            "start_datetime": NOW,
            "end_datetime": LATER,
            "client_name": "Bob",
            "client_email": "bob@example.com",
            "client_phone": "",
            "preferred_language": "fr",
            "voucher_code": "FAIL0001",
        }

        with patch(
            "apps.bookings.services.create_booking_event",
            return_value=None,
        ):
            booking, error = create_voucher_booking(data)

        assert error is None
        assert booking.status == "pending"
        assert booking.google_calendar_event_id in ("", None)


# ── _build_calendar_description ──────────────────────────────


class TestBuildCalendarDescription:
    def test_includes_voucher_code_when_present(self, available_service):
        desc = _build_calendar_description(
            service=available_service,
            client_name="Bob",
            client_email="bob@example.com",
            client_phone="0612345678",
            confirmation_code="CONF0001",
            source="voucher",
            voucher_code="GIFT9999",
        )
        assert "Voucher Code: GIFT9999" in desc
        assert "Source: voucher" in desc

    def test_omits_voucher_line_when_empty(self, available_service):
        desc = _build_calendar_description(
            service=available_service,
            client_name="Alice",
            client_email="alice@example.com",
            client_phone="0612345678",
            confirmation_code="CONF0002",
            source="online",
            voucher_code="",
        )
        assert "Voucher Code" not in desc
