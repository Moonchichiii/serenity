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

# ── Email helpers (private) ──────────────────────────────────


class TestResolveGiftSettings:
    @pytest.mark.django_db
    def test_returns_settings_site_name_and_image_url(
        self, rf, monkeypatch
    ):
        mock_settings = MagicMock()
        mock_file = MagicMock()
        mock_file.url = "/media/voucher.jpg"
        mock_settings.voucher_image.file = mock_file

        mock_site = MagicMock()
        mock_site.site_name = "TestSite"

        monkeypatch.setattr(
            "wagtail.models.Site.find_for_request",
            lambda req: mock_site,
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.for_site",
            lambda site: mock_settings,
        )

        request = rf.get("/")
        gs, name, url = voucher_services._resolve_gift_settings(request)

        assert gs is mock_settings
        assert name == "TestSite"
        assert url == "/media/voucher.jpg"

    @pytest.mark.django_db
    def test_fallback_when_for_site_raises(self, rf, monkeypatch):
        mock_site = MagicMock()
        mock_site.site_name = "Fallback"

        monkeypatch.setattr(
            "wagtail.models.Site.find_for_request",
            lambda req: mock_site,
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.for_site",
            MagicMock(side_effect=RuntimeError("boom")),
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.objects",
            MagicMock(first=MagicMock(return_value=None)),
        )

        request = rf.get("/")
        gs, name, url = voucher_services._resolve_gift_settings(request)

        assert gs is None
        assert name == "Fallback"
        assert url == ""

    @pytest.mark.django_db
    def test_site_name_defaults_to_serenity(self, rf, monkeypatch):
        mock_site = MagicMock()
        mock_site.site_name = None

        monkeypatch.setattr(
            "wagtail.models.Site.find_for_request",
            lambda req: mock_site,
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.for_site",
            lambda site: None,
        )

        request = rf.get("/")
        _, name, _ = voucher_services._resolve_gift_settings(request)
        assert name == "Serenity"

    @pytest.mark.django_db
    def test_image_url_empty_when_no_voucher_image(self, rf, monkeypatch):
        mock_settings = MagicMock()
        mock_settings.voucher_image = None

        mock_site = MagicMock()
        mock_site.site_name = "S"

        monkeypatch.setattr(
            "wagtail.models.Site.find_for_request",
            lambda req: mock_site,
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.for_site",
            lambda site: mock_settings,
        )

        request = rf.get("/")
        _, _, url = voucher_services._resolve_gift_settings(request)
        assert url == ""

    @pytest.mark.django_db
    def test_image_url_empty_when_file_raises(self, rf, monkeypatch):
        mock_image = MagicMock()
        type(mock_image).file = property(
            lambda self: (_ for _ in ()).throw(ValueError("no file"))
        )
        mock_settings = MagicMock()
        mock_settings.voucher_image = mock_image

        mock_site = MagicMock()
        mock_site.site_name = "S"

        monkeypatch.setattr(
            "wagtail.models.Site.find_for_request",
            lambda req: mock_site,
        )
        monkeypatch.setattr(
            "apps.cms.models.GiftSettings.for_site",
            lambda site: mock_settings,
        )

        request = rf.get("/")
        _, _, url = voucher_services._resolve_gift_settings(request)
        assert url == ""


class TestResolveLanguage:
    def test_returns_fr(self, rf):
        request = rf.get("/")
        request.LANGUAGE_CODE = "fr"
        assert voucher_services._resolve_language(request) == "fr"

    def test_returns_en(self, rf):
        request = rf.get("/")
        request.LANGUAGE_CODE = "en"
        assert voucher_services._resolve_language(request) == "en"

    def test_defaults_to_en_for_unknown(self, rf):
        request = rf.get("/")
        request.LANGUAGE_CODE = "de"
        assert voucher_services._resolve_language(request) == "en"

    def test_defaults_to_en_when_attr_missing(self, rf):
        request = rf.get("/")
        if hasattr(request, "LANGUAGE_CODE"):
            delattr(request, "LANGUAGE_CODE")
        assert voucher_services._resolve_language(request) == "en"


class TestBuildEmailContext:
    def test_with_gift_settings(self):
        mock_gs = MagicMock()
        mock_gs.email_heading_en = "Hello {recipient_name}"
        mock_gs.email_intro_en = "From {purchaser_name}"
        mock_gs.email_redeem_en = "Code: {code}"
        mock_gs.email_closing_en = "Thanks from {site_name}"

        tokens = {
            "purchaser_name": "Alice",
            "recipient_name": "Bob",
            "site_name": "Spa",
            "code": "ABC123",
        }

        ctx = voucher_services._build_email_context(
            voucher=MagicMock(),
            gift_settings=mock_gs,
            site_name="Spa",
            image_url="/img.jpg",
            lang="en",
            tokens=tokens,
        )

        assert ctx["email_heading"] == "Hello Bob"
        assert ctx["email_intro"] == "From Alice"
        assert ctx["email_redeem"] == "Code: ABC123"
        assert ctx["email_closing"] == "Thanks from Spa"
        assert ctx["site_name"] == "Spa"
        assert ctx["image_url"] == "/img.jpg"
        assert ctx["lang"] == "en"

    def test_without_gift_settings(self):
        tokens = {
            "purchaser_name": "A",
            "recipient_name": "B",
            "site_name": "S",
            "code": "X",
        }

        ctx = voucher_services._build_email_context(
            voucher=MagicMock(),
            gift_settings=None,
            site_name="S",
            image_url="",
            lang="fr",
            tokens=tokens,
        )

        assert ctx["email_heading"] == ""
        assert ctx["email_intro"] == ""
        assert ctx["lang"] == "fr"


class TestSendRecipientEmail:
    @pytest.mark.django_db
    def test_sends_email_with_subject(self, monkeypatch, voucher_factory):
        voucher = voucher_factory()

        mock_gs = MagicMock()
        mock_gs.email_subject_en = "Gift for {recipient_name}"

        tokens = {
            "purchaser_name": voucher.purchaser_name,
            "recipient_name": voucher.recipient_name,
            "site_name": "Spa",
            "code": voucher.code,
        }
        context = {"voucher": voucher, "lang": "en"}

        monkeypatch.setattr(
            "apps.vouchers.services.render_to_string",
            lambda tpl, ctx: "<html>test</html>",
        )

        sent = []
        monkeypatch.setattr(
            "apps.vouchers.services.EmailMultiAlternatives",
            lambda **kwargs: MagicMock(
                send=lambda: sent.append(kwargs)
            ),
        )

        voucher_services._send_recipient_email(
            voucher, mock_gs, "en", tokens, context
        )

        assert len(sent) == 1
        assert voucher.recipient_name in sent[0]["subject"]

    @pytest.mark.django_db
    def test_fallback_subject_when_no_settings(
        self, monkeypatch, voucher_factory
    ):
        voucher = voucher_factory()
        tokens = {
            "purchaser_name": "A",
            "recipient_name": "B",
            "site_name": "S",
            "code": "X",
        }

        monkeypatch.setattr(
            "apps.vouchers.services.render_to_string",
            lambda tpl, ctx: "<html></html>",
        )

        captured = {}

        def fake_email(**kwargs):
            captured.update(kwargs)
            return MagicMock(send=lambda: None)

        monkeypatch.setattr(
            "apps.vouchers.services.EmailMultiAlternatives",
            fake_email,
        )

        voucher_services._send_recipient_email(
            voucher, None, "en", tokens, {}
        )

        assert captured["subject"] == "Gift Voucher"


class TestSendAdminEmail:
    @pytest.mark.django_db
    def test_sends_to_admins_setting(
        self, monkeypatch, settings, voucher_factory
    ):
        voucher = voucher_factory()
        settings.ADMINS = [("Admin", "admin@example.com")]

        monkeypatch.setattr(
            "apps.vouchers.services.render_to_string",
            lambda tpl, ctx: "<html>admin</html>",
        )

        captured = {}

        def fake_email(**kwargs):
            captured.update(kwargs)
            return MagicMock(send=lambda: None)

        monkeypatch.setattr(
            "apps.vouchers.services.EmailMultiAlternatives",
            fake_email,
        )

        voucher_services._send_admin_email(voucher, "Spa", {})

        assert captured["to"] == ["admin@example.com"]
        assert voucher.code in captured["subject"]

    @pytest.mark.django_db
    def test_falls_back_to_default_from_email(
        self, monkeypatch, settings, voucher_factory
    ):
        voucher = voucher_factory()
        settings.ADMINS = []

        monkeypatch.setattr(
            "apps.vouchers.services.render_to_string",
            lambda tpl, ctx: "<html></html>",
        )

        captured = {}

        def fake_email(**kwargs):
            captured.update(kwargs)
            return MagicMock(send=lambda: None)

        monkeypatch.setattr(
            "apps.vouchers.services.EmailMultiAlternatives",
            fake_email,
        )

        voucher_services._send_admin_email(voucher, "Spa", {})

        assert captured["to"] == [settings.DEFAULT_FROM_EMAIL]
