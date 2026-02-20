from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from apps.bookings import services as booking_services

TZ = ZoneInfo("Europe/Paris")


@pytest.mark.django_db
def test_create_booking_returns_error_if_service_missing(db):
    booking, err = booking_services.create_booking(
        {
            "service_id": 999,
            "start_datetime": datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
            "end_datetime": datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
            "client_name": "Alice",
            "client_email": "alice@example.com",
            "client_phone": "123",
            "preferred_language": "fr",
        }
    )
    assert booking is None
    assert err is not None


@pytest.mark.django_db
def test_create_booking_confirms_when_calendar_event_created(service_factory, monkeypatch):
    service = service_factory(is_available=True)

    monkeypatch.setattr(
        booking_services,
        "create_booking_event",
        lambda **kwargs: {"id": "evt_1", "link": "x", "status": "confirmed"},
    )

    booking, err = booking_services.create_booking(
        {
            "service_id": service.id,
            "start_datetime": datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
            "end_datetime": datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
            "client_name": "Alice",
            "client_email": "alice@example.com",
            "client_phone": "123",
            "client_notes": "",
            "preferred_language": "fr",
        }
    )

    assert err is None
    booking.refresh_from_db()
    assert booking.status == "confirmed"
    assert booking.google_calendar_event_id == "evt_1"
    assert booking.source == "online"


@pytest.mark.django_db
def test_create_booking_stays_pending_if_calendar_fails(service_factory, monkeypatch):
    service = service_factory(is_available=True)

    monkeypatch.setattr(booking_services, "create_booking_event", lambda **kwargs: None)

    booking, err = booking_services.create_booking(
        {
            "service_id": service.id,
            "start_datetime": datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
            "end_datetime": datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
            "client_name": "Alice",
            "client_email": "alice@example.com",
            "client_phone": "123",
            "preferred_language": "fr",
        }
    )

    assert err is None
    booking.refresh_from_db()
    assert booking.status == "pending"
    assert booking.google_calendar_event_id == ""


@pytest.mark.django_db
def test_create_voucher_booking_prefixes_calendar_title(service_factory, monkeypatch):
    service = service_factory(is_available=True)

    captured = {}

    def _fake_create_booking_event(**kwargs):
        captured["title"] = kwargs["title"]
        return {"id": "evt_v", "link": "x", "status": "confirmed"}

    monkeypatch.setattr(booking_services, "create_booking_event", _fake_create_booking_event)

    booking, err = booking_services.create_voucher_booking(
        {
            "service_id": service.id,
            "start_datetime": datetime(2026, 2, 20, 10, 0, tzinfo=TZ),
            "end_datetime": datetime(2026, 2, 20, 11, 0, tzinfo=TZ),
            "client_name": "Bob",
            "client_email": "bob@example.com",
            "client_phone": "123",
            "preferred_language": "fr",
            "voucher_code": "VOUCH1234",
        }
    )

    assert err is None
    assert captured["title"].startswith("[VOUCHER] ")
    booking.refresh_from_db()
    assert booking.source == "voucher"
    assert booking.voucher_code == "VOUCH1234"


@pytest.mark.django_db
def test_cancel_booking_deletes_calendar_event_when_present(booking_factory, monkeypatch):
    b = booking_factory(status="confirmed", google_calendar_event_id="evt_9")

    called = {"event_id": None}

    def _fake_delete(event_id):
        called["event_id"] = event_id
        return True

    monkeypatch.setattr(booking_services, "delete_booking_event", _fake_delete)

    # Fixed RUF059: Prefixed unused variable with underscore
    _resp, err, http = booking_services.cancel_booking(b.confirmation_code)
    assert err is None
    assert http == 200

    b.refresh_from_db()
    assert b.status == "cancelled"
    assert called["event_id"] == "evt_9"


@pytest.mark.django_db
def test_cancel_booking_handles_missing_booking():
    resp, err, http = booking_services.cancel_booking("NOPE")
    assert resp is None
    assert err == "Booking not found"
    assert http == 404
