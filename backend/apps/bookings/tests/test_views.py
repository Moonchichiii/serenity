from zoneinfo import ZoneInfo

import pytest
from django.urls import reverse

TZ = ZoneInfo("Europe/Paris")


@pytest.mark.django_db
def test_get_bookings(client, booking_factory):
    booking_factory(client_email="a@example.com")
    booking_factory(client_email="b@example.com")

    res = client.get(reverse("bookings"))
    assert res.status_code == 200
    assert len(res.json()) == 2


@pytest.mark.django_db
def test_get_bookings_by_email_filter(client, booking_factory):
    booking_factory(client_email="a@example.com")
    booking_factory(client_email="b@example.com")

    res = client.get(reverse("bookings"), {"email": "a@example.com"})
    assert res.status_code == 200
    assert len(res.json()) == 1


@pytest.mark.django_db
def test_post_booking_returns_404_if_service_missing(client):
    payload = {
        "service_id": 999,
        "start_datetime": "2026-02-20T10:00:00+01:00",
        "end_datetime": "2026-02-20T11:00:00+01:00",
        "client_name": "Alice",
        "client_email": "alice@example.com",
        "client_phone": "123",
        "preferred_language": "fr",
    }
    res = client.post(reverse("bookings"), payload, content_type="application/json")
    assert res.status_code == 404


@pytest.mark.django_db
def test_delete_cancel_booking(client, booking_factory, monkeypatch):
    from apps.bookings import views

    b = booking_factory(status="confirmed")

    monkeypatch.setattr(views, "cancel_booking", lambda code: ({"detail": "ok"}, None, 200))

    res = client.delete(reverse("cancel_booking", args=[b.confirmation_code]))
    assert res.status_code == 200
    assert res.json() == {"detail": "ok"}
