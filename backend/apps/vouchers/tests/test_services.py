from __future__ import annotations

from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

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
