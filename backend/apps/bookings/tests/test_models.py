from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from apps.bookings.models import Booking

TZ = ZoneInfo("Europe/Paris")


@pytest.mark.django_db
def test_booking_str_online(service_factory):
    service = service_factory(title_en="Massage", title_fr="Massage", duration_minutes=60)
    b = Booking.objects.create(
        service=service,
        start_datetime=datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
        end_datetime=datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
        status="pending",
        source="online",
        client_name="Alice",
        client_email="alice@example.com",
        client_phone="123",
        preferred_language="fr",
        confirmation_code="ABC12345",
    )
    s = str(b)
    assert "Alice" in s
    assert "Massage" in s
    assert "[Voucher]" not in s  # online has no prefix


@pytest.mark.django_db
def test_booking_str_voucher_prefix(service_factory):
    service = service_factory(title_en="Massage", title_fr="Massage", duration_minutes=60)
    b = Booking.objects.create(
        service=service,
        start_datetime=datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
        end_datetime=datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
        status="pending",
        source="voucher",
        client_name="Bob",
        client_email="bob@example.com",
        client_phone="123",
        preferred_language="fr",
        confirmation_code="XYZ12345",
        voucher_code="VOUCH1234",
    )
    assert "[Voucher]" in str(b) or "[Voucher".lower() in str(b).lower()
