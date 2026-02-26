import pytest

from apps.vouchers.selectors import (
    get_all_bookings,
    get_booking_by_confirmation_code,
    get_bookings_by_email,
)


@pytest.mark.django_db
class TestGetAllBookings:
    def test_orders_newest_first(self, booking_factory):
        b1 = booking_factory(confirmation_code="FIRST001")
        b2 = booking_factory(confirmation_code="SECOND01")
        result = get_all_bookings()
        assert result[0].pk == b2.pk
        assert result[1].pk == b1.pk


@pytest.mark.django_db
class TestGetBookingsByEmail:
    def test_case_insensitive(self, booking_factory):
        booking_factory(
            client_email="Alice@Example.com",
            confirmation_code="ALIC0001",
        )
        result = get_bookings_by_email("alice@example.com")
        assert len(result) == 1


@pytest.mark.django_db
class TestGetBookingByConfirmationCode:
    def test_returns_booking(self, booking_factory):
        booking = booking_factory(confirmation_code="FIND0001")
        result = get_booking_by_confirmation_code("FIND0001")
        assert result.pk == booking.pk

    def test_returns_none_when_not_found(self):
        result = get_booking_by_confirmation_code("NOPE0000")
        assert result is None
