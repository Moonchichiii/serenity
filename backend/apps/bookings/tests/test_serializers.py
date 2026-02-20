from zoneinfo import ZoneInfo

import pytest

from apps.bookings.serializers import BookingRequestSerializer, BookingSerializer

TZ = ZoneInfo("Europe/Paris")


@pytest.mark.django_db
def test_booking_request_serializer_valid():
    ser = BookingRequestSerializer(
        data={
            "service_id": 1,
            "start_datetime": "2026-02-20T10:00:00+01:00",
            "end_datetime": "2026-02-20T11:00:00+01:00",
            "client_name": "Alice",
            "client_email": "alice@example.com",
            "client_phone": "123",
            "preferred_language": "fr",
        }
    )
    assert ser.is_valid(), ser.errors


@pytest.mark.django_db
def test_booking_serializer_service_shape(booking_factory):
    b = booking_factory()
    data = BookingSerializer(b).data
    assert "service" in data
    assert set(data["service"].keys()) == {"id", "title_fr", "title_en"}
