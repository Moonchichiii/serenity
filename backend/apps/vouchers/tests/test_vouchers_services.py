from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

from apps.services.models import Service
from apps.vouchers.models import Booking, GiftVoucher
from apps.vouchers.services import (
    _create_linked_booking,
    _ensure_tz,
    cancel_booking,
)

TZ = ZoneInfo("Europe/Paris")

@pytest.fixture
def service():
    return Service.objects.create(
        title_fr="Massage Test",
        duration_minutes=60,
        is_available=True,
        price=100
    )

@pytest.fixture
def voucher(service):
    return GiftVoucher.objects.create(
        code="TESTVOUCHER",
        recipient_name="John",
        recipient_email="john@test.com",
        purchaser_name="Jane",
        purchaser_email="jane@test.com"
    )

class TestServiceHardening:

    # ── Risk 1 & 2: Datetime Safety ──────────────────────────────

    def test_ensure_tz_handles_strings(self):
        dt_str = "2026-06-01T10:00:00"
        result = _ensure_tz(dt_str)
        assert isinstance(result, datetime)
        assert result.tzinfo is not None

    def test_ensure_tz_handles_naive_objects(self):
        naive = datetime(2026, 6, 1, 10, 0)
        result = _ensure_tz(naive)
        assert result.tzinfo is not None
        assert str(result.tzinfo) == "Europe/Paris"

    def test_ensure_tz_raises_on_garbage(self):
        with pytest.raises(ValueError):
            _ensure_tz("not-a-date")

    # ── Risk 3: Double Booking ───────────────────────────────────

    @pytest.mark.django_db
    def test_overlap_prevents_double_booking(self, service, voucher):
        start = datetime(2026, 6, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 6, 1, 11, 0, tzinfo=TZ)

        # Create first booking
        with patch("apps.vouchers.services._sync_to_google_calendar"):
            conf1 = _create_linked_booking(voucher, service.id, start, end)
        assert conf1 != ""

        # Attempt exact overlap
        voucher2 = GiftVoucher.objects.create(code="V2", recipient_email="b@b.com")
        with patch("apps.vouchers.services._sync_to_google_calendar"):
            conf2 = _create_linked_booking(voucher2, service.id, start, end)

        # Should fail safely
        assert conf2 == ""
        assert Booking.objects.count() == 1

    # ── Risk 4: Confirmation Code Collision ──────────────────────

    @pytest.mark.django_db
    def test_confirmation_code_retry_logic(self, service, voucher):
        start = datetime(2026, 6, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 6, 1, 11, 0, tzinfo=TZ)

        # We force the generator to return "DUPE" twice, then "UNIQUE"
        # The first "DUPE" works.
        # The second "DUPE" causes IntegrityError -> Retry loop catches -> "UNIQUE" works.
        with patch("apps.vouchers.services._generate_confirmation_code", side_effect=["DUPE", "DUPE", "UNIQUE"]):

            # First booking
            with patch("apps.vouchers.services._sync_to_google_calendar"):
                c1 = _create_linked_booking(voucher, service.id, start, end)

            # Second booking (different time to avoid overlap check)
            start2 = start + timedelta(hours=2)
            end2 = end + timedelta(hours=2)

            with patch("apps.vouchers.services._sync_to_google_calendar"):
                c2 = _create_linked_booking(voucher, service.id, start2, end2)

        assert c1 == "DUPE"
        assert c2 == "UNIQUE"
        assert Booking.objects.count() == 2

    # ── Risk 5: Google Calendar Failure ──────────────────────────

    @pytest.mark.django_db
    def test_calendar_failure_does_not_rollback_booking(self, service, voucher):
        start = datetime(2026, 6, 1, 10, 0, tzinfo=TZ)
        end = datetime(2026, 6, 1, 11, 0, tzinfo=TZ)

        # Mock sync to raise Exception
        with patch("apps.vouchers.services._sync_to_google_calendar", side_effect=Exception("API Error")):
            conf = _create_linked_booking(voucher, service.id, start, end)

        # Transaction should succeed despite calendar fail
        assert conf != ""
        booking = Booking.objects.get(confirmation_code=conf)
        assert booking.status == "pending"
        # Calendar ID should be empty since sync failed
        assert booking.google_calendar_event_id is None

    # ── Cancellation Resilience ──────────────────────────────────

    @pytest.mark.django_db
    def test_cancel_handles_calendar_error(self, service, voucher):
        booking = Booking.objects.create(
            service=service,
            start_datetime=datetime.now(TZ),
            end_datetime=datetime.now(TZ) + timedelta(hours=1),
            status="confirmed",
            confirmation_code="ABC",
            google_calendar_event_id="cal123"
        )

        with patch("apps.vouchers.services.delete_booking_event", side_effect=Exception("API Fail")):
            resp, err, code = cancel_booking("ABC")

        assert code == 200
        booking.refresh_from_db()
        assert booking.status == "cancelled"
