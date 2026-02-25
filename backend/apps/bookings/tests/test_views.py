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


@pytest.mark.django_db
def test_post_voucher_booking_success(client, available_service, monkeypatch):
    from apps.bookings import views
    from apps.bookings.models import Booking

    mock_booking = Booking(
        service=available_service,
        client_name="Bob",
        client_email="bob@example.com",
        client_phone="",
        start_datetime="2026-02-20T10:00:00+01:00",
        end_datetime="2026-02-20T11:00:00+01:00",
        confirmation_code="VOUCH001",
        source="voucher",
        voucher_code="GIFT0001",
        status="confirmed",
    )

    monkeypatch.setattr(
        views, "create_voucher_booking", lambda data: (mock_booking, None)
    )

    payload = {
        "service_id": available_service.pk,
        "start_datetime": "2026-02-20T10:00:00+01:00",
        "end_datetime": "2026-02-20T11:00:00+01:00",
        "client_name": "Bob",
        "client_email": "bob@example.com",
        "client_phone": "",
        "preferred_language": "fr",
        "voucher_code": "GIFT0001",
    }

    res = client.post(
        reverse("voucher_bookings"),
        payload,
        content_type="application/json",
    )
    assert res.status_code == 201


@pytest.mark.django_db
def test_post_voucher_booking_error_returns_404(
    client, monkeypatch
):
    from apps.bookings import views

    monkeypatch.setattr(
        views,
        "create_voucher_booking",
        lambda data: (None, "Service not found or unavailable"),
    )

    payload = {
        "service_id": 999,
        "start_datetime": "2026-02-20T10:00:00+01:00",
        "end_datetime": "2026-02-20T11:00:00+01:00",
        "client_name": "X",
        "client_email": "x@example.com",
        "client_phone": "",
        "preferred_language": "en",
        "voucher_code": "BAD",
    }

    res = client.post(
        reverse("voucher_bookings"),
        payload,
        content_type="application/json",
    )
    assert res.status_code == 404
    assert "Service not found" in res.json()["detail"]


@pytest.mark.django_db
def test_cancel_booking_error_returns_error_status(
    client, monkeypatch
):
    from apps.bookings import views

    monkeypatch.setattr(
        views,
        "cancel_booking",
        lambda code: (None, "Booking not found", 404),
    )

    res = client.delete(reverse("cancel_booking", args=["FAKE0001"]))
    assert res.status_code == 404
    assert res.json()["detail"] == "Booking not found"


@pytest.mark.django_db
def test_cancel_booking_bad_request(client, monkeypatch):
    from apps.bookings import views

    monkeypatch.setattr(
        views,
        "cancel_booking",
        lambda code: (None, "Already cancelled", 400),
    )

    res = client.delete(reverse("cancel_booking", args=["CANC0001"]))
    assert res.status_code == 400
