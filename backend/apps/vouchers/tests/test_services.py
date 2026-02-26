from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest

from apps.bookings.models import Booking
from apps.vouchers import services as voucher_services

NOW = datetime(2026, 3, 1, 10, 0, tzinfo=UTC)
LATER = datetime(2026, 3, 1, 11, 0, tzinfo=UTC)

BASE_DATA = {
    "purchaser_name": "A",
    "purchaser_email": "a@example.com",
    "recipient_name": "B",
    "recipient_email": "b@example.com",
    "message": "",
}


# ── create_voucher ──────────────────────────────────────────────


class TestCreateVoucher:
    @pytest.mark.django_db
    def test_voucher_only_persists_and_sets_empty_confirmation(self):
        voucher = voucher_services.create_voucher(data={**BASE_DATA})

        assert voucher.pk is not None
        assert voucher.code
        assert voucher.booking_confirmation == ""

    @pytest.mark.django_db
    def test_booking_keys_are_popped_before_model_create(self):
        """
        service_id/start_datetime/end_datetime must not be passed to GiftVoucher.objects.create().
        We assert this by ensuring voucher is created without errors even when those keys exist.
        """
        data = {
            **BASE_DATA,
            "service_id": 999,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        # Force linked booking to "fail" and return empty confirmation
        with patch.object(
            voucher_services, "_create_linked_booking", return_value=""
        ) as _mock_linked:
            voucher = voucher_services.create_voucher(data=data)

        assert voucher.pk is not None
        assert voucher.booking_confirmation == ""

    @pytest.mark.django_db
    def test_with_booking_fields_sets_confirmation_when_linked_booking_succeeds(
        self, available_service
    ):
        data = {
            **BASE_DATA,
            "service_id": available_service.pk,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        with patch.object(
            voucher_services, "_create_linked_booking", return_value="BOOK1234"
        ) as mock_linked:
            voucher = voucher_services.create_voucher(data=data)

        assert voucher.pk is not None
        assert voucher.booking_confirmation == "BOOK1234"

        mock_linked.assert_called_once()
        kwargs = mock_linked.call_args.kwargs
        assert kwargs["voucher"].pk == voucher.pk
        assert kwargs["service_id"] == available_service.pk
        assert kwargs["start_dt"] == NOW
        assert kwargs["end_dt"] == LATER

    @pytest.mark.django_db
    def test_with_booking_fields_keeps_empty_confirmation_when_linked_booking_fails(
        self, available_service
    ):
        data = {
            **BASE_DATA,
            "service_id": available_service.pk,
            "start_datetime": NOW,
            "end_datetime": LATER,
        }

        with patch.object(
            voucher_services, "_create_linked_booking", return_value=""
        ):
            voucher = voucher_services.create_voucher(data=data)

        assert voucher.pk is not None
        assert voucher.booking_confirmation == ""


# ── _create_linked_booking ───────────────────────────────────────


class TestCreateLinkedBooking:
    @pytest.mark.django_db
    def test_happy_path_creates_booking_record(self, available_service, voucher_factory):
        voucher = voucher_factory()

        # Avoid Google Calendar calls
        with patch.object(voucher_services, "_sync_to_google_calendar", lambda *a, **k: None):
            confirmation = voucher_services._create_linked_booking(
                voucher=voucher,
                service_id=available_service.pk,
                start_dt=NOW,
                end_dt=LATER,
            )

        assert confirmation != ""
        booking = Booking.objects.get(confirmation_code=confirmation)
        assert booking.source == "voucher"
        assert booking.voucher_code == voucher.code
        assert booking.service_id == available_service.pk
        assert booking.client_name == voucher.recipient_name
        assert booking.client_email == voucher.recipient_email

    @pytest.mark.django_db
    def test_service_not_found_returns_empty_string(self, voucher_factory):
        voucher = voucher_factory()

        with patch("apps.vouchers.services.Service.objects.get", side_effect=Exception()):
            confirmation = voucher_services._create_linked_booking(
                voucher=voucher,
                service_id=99999,
                start_dt=NOW,
                end_dt=LATER,
            )
        assert confirmation == ""


# ── _build_calendar_description ──────────────────────────────────


class TestBuildCalendarDescription:
    def test_includes_voucher_code_when_present(self):
        desc = voucher_services._build_calendar_description(
            client_name="Bob",
            client_email="bob@example.com",
            client_phone="0612345678",
            client_notes="Notes",
            source="voucher",
            voucher_code="GIFT9999",
        )
        assert "Source: voucher" in desc
        assert "Voucher: GIFT9999" in desc

    def test_omits_voucher_line_when_empty(self):
        desc = voucher_services._build_calendar_description(
            client_name="Alice",
            client_email="alice@example.com",
            client_phone="0612345678",
            client_notes="Notes",
            source="manual",
            voucher_code="",
        )
        assert "Voucher:" not in desc


# ── Gift settings + language ─────────────────────────────────────


class TestResolveGiftSettings:
    def test_defaults_when_settings_missing(self, settings):
        if hasattr(settings, "GIFT_VOUCHER_SETTINGS"):
            delattr(settings, "GIFT_VOUCHER_SETTINGS")

        gs = voucher_services._resolve_gift_settings()
        assert gs["business_name"] == "Serenity Touch"
        assert gs["site_url"] == ""

    def test_reads_from_django_settings(self, settings):
        settings.GIFT_VOUCHER_SETTINGS = {
            "business_name": "My Spa",
            "business_email": "admin@example.com",
            "business_phone": "123",
            "business_address": "Somewhere",
            "site_url": "https://example.com",
        }
        gs = voucher_services._resolve_gift_settings()
        assert gs["business_name"] == "My Spa"
        assert gs["business_email"] == "admin@example.com"
        assert gs["site_url"] == "https://example.com"


class TestResolveLanguage:
    @pytest.mark.django_db
    def test_returns_preferred_language(self, voucher_factory):
        v = voucher_factory(preferred_language="en")
        assert voucher_services._resolve_language(v) == "en"

    @pytest.mark.django_db
    def test_defaults_to_fr_if_missing(self, voucher_factory):
        v = voucher_factory(preferred_language="")
        assert voucher_services._resolve_language(v) == "fr"


class TestBuildEmailContext:
    @pytest.mark.django_db
    def test_context_shape(self, voucher_factory):
        v = voucher_factory()
        gs = {"business_name": "Spa", "site_url": ""}
        ctx = voucher_services._build_email_context(v, gs, "en")
        assert ctx["voucher"].pk == v.pk
        assert ctx["lang"] == "en"
        assert ctx["business_name"] == "Spa"


# ── send_voucher_emails ──────────────────────────────────────────


class TestSendVoucherEmails:
    @pytest.mark.django_db
    def test_calls_recipient_and_admin_senders(self, monkeypatch, voucher_factory):
        voucher = voucher_factory()

        monkeypatch.setattr(voucher_services, "_resolve_gift_settings", lambda: {"business_name": "X"})
        monkeypatch.setattr(voucher_services, "_resolve_language", lambda v: "en")
        monkeypatch.setattr(voucher_services, "_build_email_context", lambda v, gs, lang: {"voucher": v, "lang": lang})

        called = {"recipient": 0, "admin": 0}

        monkeypatch.setattr(
            voucher_services,
            "_send_recipient_email",
            lambda *a, **k: called.__setitem__("recipient", called["recipient"] + 1),
        )
        monkeypatch.setattr(
            voucher_services,
            "_send_admin_email",
            lambda *a, **k: called.__setitem__("admin", called["admin"] + 1),
        )

        voucher_services.send_voucher_emails(voucher=voucher)

        assert called["recipient"] == 1
        assert called["admin"] == 1


# ── Email sender unit tests (no templates/emails) ─────────────────


class TestSendRecipientEmail:
    @pytest.mark.django_db
    def test_sends_email(self, monkeypatch, voucher_factory, settings):
        voucher = voucher_factory(recipient_email="to@example.com")
        gift_settings = {"business_name": "Spa", "business_email": "admin@example.com"}
        ctx = {"voucher": voucher, "lang": "en"}

        monkeypatch.setattr("apps.vouchers.services.render_to_string", lambda tpl, ctx: "content")

        sent = []

        def fake_email_multi(**kwargs):
            msg = MagicMock()
            msg.attach_alternative = MagicMock()
            msg.send = MagicMock(side_effect=lambda: sent.append(kwargs))
            return msg

        monkeypatch.setattr("apps.vouchers.services.EmailMultiAlternatives", fake_email_multi)

        voucher_services._send_recipient_email(voucher, ctx, "en", gift_settings)

        assert len(sent) == 1
        assert sent[0]["to"] == ["to@example.com"]
        assert "Spa" in sent[0]["subject"]


class TestSendAdminEmail:
    @pytest.mark.django_db
    def test_skips_when_no_admin_email(self, monkeypatch, voucher_factory):
        voucher = voucher_factory()
        ctx = {"voucher": voucher, "lang": "en"}

        # Should not raise, should just return
        voucher_services._send_admin_email(voucher, ctx, gift_settings={"business_email": ""})

    @pytest.mark.django_db
    def test_sends_when_admin_email_present(self, monkeypatch, voucher_factory):
        voucher = voucher_factory()
        ctx = {"voucher": voucher, "lang": "en"}

        monkeypatch.setattr("apps.vouchers.services.render_to_string", lambda tpl, ctx: "content")

        sent = []

        def fake_email_multi(**kwargs):
            msg = MagicMock()
            msg.attach_alternative = MagicMock()
            msg.send = MagicMock(side_effect=lambda: sent.append(kwargs))
            return msg

        monkeypatch.setattr("apps.vouchers.services.EmailMultiAlternatives", fake_email_multi)

        voucher_services._send_admin_email(
            voucher,
            ctx,
            gift_settings={"business_email": "admin@example.com"},
        )

        assert len(sent) == 1
        assert sent[0]["to"] == ["admin@example.com"]
        assert voucher.code in sent[0]["subject"]
