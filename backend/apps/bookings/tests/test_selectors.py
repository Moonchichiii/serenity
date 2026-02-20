import pytest

from apps.bookings.selectors import (
    get_all_bookings,
    get_booking_by_confirmation_code,
    get_bookings_by_email,
)


@pytest.mark.django_db
def test_get_all_bookings_orders_newest_first(booking_factory):
    b1 = booking_factory(client_email="a@a.com")
    b2 = booking_factory(client_email="b@b.com")
    out = get_all_bookings()
    assert out[0].pk == b2.pk
    assert out[1].pk == b1.pk


@pytest.mark.django_db
def test_get_bookings_by_email_case_insensitive(booking_factory):
    booking_factory(client_email="Alice@Example.com")
    booking_factory(client_email="other@example.com")

    out = get_bookings_by_email("alice@example.com")
    assert len(out) == 1
    assert out[0].client_email.lower() == "alice@example.com"


@pytest.mark.django_db
def test_get_booking_by_confirmation_code(booking_factory):
    b = booking_factory(confirmation_code="CODE1234")
    out = get_booking_by_confirmation_code("CODE1234")
    assert out.pk == b.pk

    assert get_booking_by_confirmation_code("NOPE") is None
