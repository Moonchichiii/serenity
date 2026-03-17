from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

import pytest
from django.template import TemplateDoesNotExist

from apps.vouchers import services as voucher_services

TZ = ZoneInfo("Europe/Paris")

BASE_DATA = {
    "sender_name": "A",
    "sender_email": "a@example.com",
    "recipient_name": "B",
    "recipient_email": "b@example.com",
    "message": "",
    "amount": "100.00",
    "preferred_language": "fr",
}


class TestEnsureTz:
    def test_ensure_tz_handles_naive(self):
        naive = datetime(2026, 6, 1, 10, 0)
        out = voucher_services._ensure_tz(naive)
        assert out.tzinfo is not None
        assert str(out.tzinfo) == "Europe/Paris"

    def test_ensure_tz_keeps_aware(self):
        aware = datetime(2026, 6, 1, 10, 0, tzinfo=TZ)
        out = voucher_services._ensure_tz(aware)
        assert out is aware


class TestEnsureTzMore:
    def test_ensure_tz_returns_none_for_none(self):
        assert voucher_services._ensure_tz(None) is None

    def test_ensure_tz_parses_iso_string(self):
        out = voucher_services._ensure_tz("2026-06-01T10:00:00+01:00")
        assert out is not None
        assert out.year == 2026
        assert out.month == 6
        assert out.day == 1
        assert out.tzinfo is not None

    def test_ensure_tz_parses_z_suffix(self):
        out = voucher_services._ensure_tz("2026-06-01T10:00:00Z")
        assert out is not None
        assert out.tzinfo is not None
        assert out.utcoffset() == UTC.utcoffset(None)

    def test_ensure_tz_invalid_string_returns_none(self, caplog):
        out = voucher_services._ensure_tz("not-a-date")
        assert out is None
        assert "Could not parse date string" in caplog.text


class TestVoucherSettingsHelpers:
    def test_resolve_gift_settings_uses_defaults(self, settings):
        settings.EMAIL_HOST_USER = "host@example.com"
        settings.GIFT_VOUCHER_SETTINGS = {}

        result = voucher_services._resolve_gift_settings()

        assert result == {
            "business_name": "Serenity Touch",
            "business_email": "host@example.com",
            "business_phone": "",
            "business_address": "",
            "site_url": "",
        }

    def test_resolve_gift_settings_uses_overrides(self, settings):
        settings.EMAIL_HOST_USER = "host@example.com"
        settings.GIFT_VOUCHER_SETTINGS = {
            "business_name": "My Spa",
            "business_email": "admin@spa.test",
            "business_phone": "12345",
            "business_address": "Rue Test",
            "site_url": "https://spa.test",
        }

        result = voucher_services._resolve_gift_settings()

        assert result["business_name"] == "My Spa"
        assert result["business_email"] == "admin@spa.test"
        assert result["business_phone"] == "12345"
        assert result["business_address"] == "Rue Test"
        assert result["site_url"] == "https://spa.test"

    def test_resolve_language_defaults_to_fr(self, voucher_factory):
        voucher = voucher_factory(preferred_language="")
        assert voucher_services._resolve_language(voucher) == "fr"

    def test_resolve_language_returns_existing_language(self, voucher_factory):
        voucher = voucher_factory(preferred_language="en")
        assert voucher_services._resolve_language(voucher) == "en"

    def test_build_email_context(self, voucher_factory):
        voucher = voucher_factory()
        gift_settings = {"business_name": "Spa", "site_url": "https://example.com"}

        context = voucher_services._build_email_context(voucher, gift_settings, "fr")

        assert context["voucher"] == voucher
        assert context["lang"] == "fr"
        assert context["business_name"] == "Spa"
        assert context["site_url"] == "https://example.com"


@pytest.mark.django_db
class TestRecipientEmail:
    @patch("apps.vouchers.services.EmailMultiAlternatives")
    @patch("apps.vouchers.services.render_to_string")
    def test_send_recipient_email_success(
        self, mock_render, mock_email_cls, voucher_factory, settings
    ):
        settings.DEFAULT_FROM_EMAIL = "no-reply@example.com"
        voucher = voucher_factory(amount=Decimal("100.00"))
        context = {"voucher": voucher}
        gift_settings = {"business_name": "Serenity Touch"}

        mock_render.side_effect = ["<p>Hello</p>", "Plain text body"]
        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        voucher_services._send_recipient_email(voucher, context, "en", gift_settings)

        mock_email_cls.assert_called_once()
        kwargs = mock_email_cls.call_args.kwargs
        assert kwargs["subject"] == "Your gift voucher from Serenity Touch"
        assert kwargs["from_email"] == "no-reply@example.com"
        assert kwargs["to"] == [voucher.recipient_email]
        mock_msg.attach_alternative.assert_called_once_with("<p>Hello</p>", "text/html")
        mock_msg.send.assert_called_once()

    @patch("apps.vouchers.services.EmailMultiAlternatives")
    @patch("apps.vouchers.services.render_to_string")
    def test_send_recipient_email_falls_back_when_text_template_missing(
        self, mock_render, mock_email_cls, voucher_factory, settings
    ):
        settings.DEFAULT_FROM_EMAIL = "no-reply@example.com"
        voucher = voucher_factory(
            code="ABC1234567",
            sender_name="Bob",
            amount=Decimal("100.00"),
        )
        context = {"voucher": voucher}
        gift_settings = {"business_name": "Serenity Touch"}

        mock_render.side_effect = [
            "<p>Hello</p>",
            TemplateDoesNotExist("missing txt"),
        ]
        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        voucher_services._send_recipient_email(voucher, context, "en", gift_settings)

        kwargs = mock_email_cls.call_args.kwargs
        assert "You have received a gift voucher" in kwargs["body"]
        assert "ABC1234567" in kwargs["body"]
        mock_msg.send.assert_called_once()

    @patch("apps.vouchers.services.render_to_string", side_effect=Exception("boom"))
    def test_send_recipient_email_logs_and_does_not_raise(
        self, mock_render, voucher_factory, caplog
    ):
        voucher = voucher_factory(code="ERR1234567")
        context = {"voucher": voucher}
        gift_settings = {"business_name": "Serenity Touch"}

        voucher_services._send_recipient_email(voucher, context, "fr", gift_settings)

        assert "Error sending recipient email" in caplog.text


@pytest.mark.django_db
class TestAdminEmail:
    @patch("apps.vouchers.services.EmailMultiAlternatives")
    @patch("apps.vouchers.services.render_to_string")
    def test_send_admin_email_success(
        self, mock_render, mock_email_cls, voucher_factory, settings
    ):
        settings.DEFAULT_FROM_EMAIL = "no-reply@example.com"
        settings.EMAIL_HOST_USER = "host@example.com"

        voucher = voucher_factory(code="ADM1234567", amount=Decimal("100.00"))
        context = {"voucher": voucher}
        gift_settings = {"business_email": "admin@example.com"}

        mock_render.return_value = "<p>Admin</p>"
        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        voucher_services._send_admin_email(voucher, context, gift_settings)

        kwargs = mock_email_cls.call_args.kwargs
        assert kwargs["subject"] == "New voucher sold: ADM1234567"
        assert kwargs["to"] == ["admin@example.com"]
        mock_msg.send.assert_called_once()

    def test_send_admin_email_skips_when_no_admin_email(
        self, voucher_factory, settings, caplog
    ):
        settings.EMAIL_HOST_USER = ""
        voucher = voucher_factory()
        context = {"voucher": voucher}
        gift_settings = {"business_email": ""}

        voucher_services._send_admin_email(voucher, context, gift_settings)

        assert "skipping admin notification" in caplog.text.lower()

    @patch("apps.vouchers.services.EmailMultiAlternatives")
    @patch(
        "apps.vouchers.services.render_to_string",
        side_effect=TemplateDoesNotExist("missing"),
    )
    def test_send_admin_email_falls_back_when_template_missing(
        self, mock_render, mock_email_cls, voucher_factory, settings
    ):
        settings.DEFAULT_FROM_EMAIL = "no-reply@example.com"
        settings.EMAIL_HOST_USER = "host@example.com"

        voucher = voucher_factory(code="ADM7654321", amount=Decimal("100.00"))
        context = {"voucher": voucher}
        gift_settings = {"business_email": "admin@example.com"}

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        voucher_services._send_admin_email(voucher, context, gift_settings)

        kwargs = mock_email_cls.call_args.kwargs
        attached_html = mock_msg.attach_alternative.call_args.args[0]
        assert "New Voucher: ADM7654321" in attached_html
        assert "Sold for 100.00 EUR" in attached_html
        mock_msg.send.assert_called_once()


@pytest.mark.django_db
class TestSenderReceipt:
    @patch("apps.vouchers.services.EmailMultiAlternatives")
    @patch("apps.vouchers.services.render_to_string")
    def test_send_sender_receipt_success(
        self, mock_render, mock_email_cls, voucher_factory, settings
    ):
        settings.DEFAULT_FROM_EMAIL = "no-reply@example.com"
        voucher = voucher_factory(code="SND1234567", sender_email="sender@example.com")
        context = {"voucher": voucher}

        mock_render.return_value = "<p>Receipt</p>"
        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        voucher_services._send_sender_receipt(voucher, context, "en")

        kwargs = mock_email_cls.call_args.kwargs
        assert kwargs["subject"] == "Your order receipt: SND1234567"
        assert kwargs["to"] == ["sender@example.com"]
        mock_msg.send.assert_called_once()

    def test_send_sender_receipt_skips_when_sender_email_missing(
        self, voucher_factory, caplog
    ):
        voucher = voucher_factory(sender_email="")
        context = {"voucher": voucher}

        voucher_services._send_sender_receipt(voucher, context, "fr")

        assert "skipping receipt" in caplog.text.lower()

    @patch("apps.vouchers.services.render_to_string", side_effect=Exception("boom"))
    def test_send_sender_receipt_logs_and_does_not_raise(
        self, mock_render, voucher_factory, caplog
    ):
        voucher = voucher_factory(code="SNDERR1234")
        context = {"voucher": voucher}

        voucher_services._send_sender_receipt(voucher, context, "fr")

        assert "Error sending sender receipt" in caplog.text


@pytest.mark.django_db
class TestSendVoucherEmails:
    @patch("apps.vouchers.services._send_sender_receipt")
    @patch("apps.vouchers.services._send_admin_email")
    @patch("apps.vouchers.services._send_recipient_email")
    def test_send_voucher_emails_calls_all_steps(
        self,
        mock_recipient,
        mock_admin,
        mock_sender,
        voucher_factory,
        settings,
    ):
        settings.EMAIL_HOST_USER = "host@example.com"
        settings.GIFT_VOUCHER_SETTINGS = {"business_name": "Spa"}

        voucher = voucher_factory(preferred_language="en")

        voucher_services.send_voucher_emails(voucher)

        mock_recipient.assert_called_once()
        mock_admin.assert_called_once()
        mock_sender.assert_called_once()


@pytest.mark.django_db
class TestCreateCalendarEventForVoucher:
    def test_returns_early_without_service(self, voucher_factory):
        voucher = voucher_factory()
        voucher_services._create_calendar_event_for_voucher(voucher)
        voucher.refresh_from_db()
        assert voucher.calendar_event_id == ""

    def test_returns_early_without_start_datetime(self, voucher_factory, available_service):
        voucher = voucher_factory(service=available_service, start_datetime=None)
        voucher_services._create_calendar_event_for_voucher(voucher)
        voucher.refresh_from_db()
        assert voucher.calendar_event_id == ""

    def test_returns_early_without_end_datetime(self, voucher_factory, available_service):
        voucher = voucher_factory(service=available_service, end_datetime=None)
        voucher_services._create_calendar_event_for_voucher(voucher)
        voucher.refresh_from_db()
        assert voucher.calendar_event_id == ""

    @patch("apps.vouchers.services.create_booking_event")
    def test_strips_client_name_and_email_before_call(
        self, mock_gcal, voucher_factory, available_service
    ):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        voucher = voucher_factory(
            recipient_name="  Alice  ",
            recipient_email="  alice@example.com  ",
            sender_name="Bob",
            sender_email="bob@example.com",
            service=available_service,
            start_datetime=start,
            end_datetime=end,
            code="VCAL123456",
        )

        mock_gcal.return_value = {"id": "evt_1", "link": "", "status": ""}

        voucher_services._create_calendar_event_for_voucher(voucher)

        kwargs = mock_gcal.call_args.kwargs
        assert kwargs["client_name"] == "Alice"
        assert kwargs["client_email"] == "alice@example.com"
        assert "Voucher code: VCAL123456" in kwargs["description"]
        assert "Bob <bob@example.com>" in kwargs["description"]

    @patch("apps.vouchers.services.create_booking_event")
    def test_saves_calendar_metadata_when_event_has_id(
        self, mock_gcal, voucher_factory, available_service
    ):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        voucher = voucher_factory(
            service=available_service,
            start_datetime=start,
            end_datetime=end,
        )

        mock_gcal.return_value = {
            "id": "evt_saved",
            "link": "https://calendar/item",
            "status": "confirmed",
        }

        voucher_services._create_calendar_event_for_voucher(voucher)

        voucher.refresh_from_db()
        assert voucher.calendar_event_id == "evt_saved"
        assert voucher.calendar_event_link == "https://calendar/item"
        assert voucher.calendar_event_status == "confirmed"

    @patch("apps.vouchers.services.create_booking_event", return_value=None)
    def test_does_not_save_metadata_when_event_is_none(
        self, mock_gcal, voucher_factory, available_service
    ):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        voucher = voucher_factory(
            service=available_service,
            start_datetime=start,
            end_datetime=end,
        )

        voucher_services._create_calendar_event_for_voucher(voucher)

        voucher.refresh_from_db()
        assert voucher.calendar_event_id == ""
        assert voucher.calendar_event_link == ""
        assert voucher.calendar_event_status == ""

    @patch("apps.vouchers.services.create_booking_event", return_value={"link": "x"})
    def test_does_not_save_metadata_when_event_has_no_id(
        self, mock_gcal, voucher_factory, available_service
    ):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        voucher = voucher_factory(
            service=available_service,
            start_datetime=start,
            end_datetime=end,
        )

        voucher_services._create_calendar_event_for_voucher(voucher)

        voucher.refresh_from_db()
        assert voucher.calendar_event_id == ""


class TestCreateVoucher:
    @pytest.mark.django_db
    def test_creates_voucher_without_slot(self):
        with patch("apps.vouchers.services.create_booking_event") as mock_gcal:
            voucher = voucher_services.create_voucher(data={**BASE_DATA})

        assert voucher.pk is not None
        assert voucher.code
        assert voucher.service is None
        assert voucher.start_datetime is None
        assert voucher.end_datetime is None
        assert voucher.calendar_event_id == ""
        assert voucher.calendar_event_link == ""
        assert voucher.calendar_event_status == ""
        mock_gcal.assert_not_called()

    @pytest.mark.django_db
    def test_creates_voucher_with_slot_and_saves_calendar_metadata(self, available_service):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        with patch("apps.vouchers.services.create_booking_event") as mock_gcal:
            mock_gcal.return_value = {
                "id": "evt_123",
                "link": "https://calendar/event/123",
                "status": "confirmed",
            }

            voucher = voucher_services.create_voucher(
                data={
                    **BASE_DATA,
                    "service_id": available_service.id,
                    "start_datetime": start,
                    "end_datetime": end,
                }
            )

        assert voucher.pk is not None
        assert voucher.service_id == available_service.id
        assert voucher.start_datetime is not None
        assert voucher.end_datetime is not None

        voucher.refresh_from_db()
        assert voucher.calendar_event_id == "evt_123"
        assert voucher.calendar_event_link == "https://calendar/event/123"
        assert voucher.calendar_event_status == "confirmed"
        mock_gcal.assert_called_once()

    @pytest.mark.django_db
    def test_calendar_failure_does_not_break_voucher_creation(self, available_service):
        start = datetime(2026, 3, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 3, 1, 11, 0, tzinfo=TZ)

        with patch("apps.vouchers.services.create_booking_event", side_effect=Exception("boom")):
            voucher = voucher_services.create_voucher(
                data={
                    **BASE_DATA,
                    "service_id": available_service.id,
                    "start_datetime": start,
                    "end_datetime": end,
                }
            )

        assert voucher.pk is not None
        voucher.refresh_from_db()
        # Still empty because calendar write failed
        assert voucher.calendar_event_id == ""


@pytest.mark.django_db
class TestCreateVoucherMore:
    def test_create_voucher_with_service_id_only_does_not_create_calendar_event(
        self, available_service
    ):
        with patch("apps.vouchers.services._create_calendar_event_for_voucher") as mock_create:
            voucher = voucher_services.create_voucher(
                data={**BASE_DATA, "service_id": available_service.id}
            )

        assert voucher.service_id == available_service.id
        assert voucher.start_datetime is None
        assert voucher.end_datetime is None
        mock_create.assert_not_called()

    def test_create_voucher_with_unknown_service_id_sets_service_none(self):
        voucher = voucher_services.create_voucher(
            data={**BASE_DATA, "service_id": 999999}
        )
        assert voucher.service is None

    def test_create_voucher_accepts_datetime_strings(self, available_service):
        with patch("apps.vouchers.services.create_booking_event") as mock_gcal:
            mock_gcal.return_value = {"id": "evt_str"}

            voucher = voucher_services.create_voucher(
                data={
                    **BASE_DATA,
                    "service_id": available_service.id,
                    "start_datetime": "2026-03-01T10:00:00+01:00",
                    "end_datetime": "2026-03-01T11:00:00+01:00",
                }
            )

        assert voucher.start_datetime is not None
        assert voucher.end_datetime is not None
        voucher.refresh_from_db()
        assert voucher.calendar_event_id == "evt_str"

    def test_create_voucher_invalid_datetime_string_does_not_crash(self, available_service):
        voucher = voucher_services.create_voucher(
            data={
                **BASE_DATA,
                "service_id": available_service.id,
                "start_datetime": "bad-date",
                "end_datetime": "also-bad",
            }
        )

        assert voucher.pk is not None
        assert voucher.start_datetime is None
        assert voucher.end_datetime is None
