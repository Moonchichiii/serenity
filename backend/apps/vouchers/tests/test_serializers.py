import pytest

from apps.vouchers.serializers import (
    BookingSerializer,
    GiftVoucherInputSerializer,
)


class TestGiftVoucherInputValid:
    def test_valid_without_booking(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors

    def test_valid_with_booking_fields(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": 1,
            "start_datetime": "2026-03-01T10:00:00Z",
            "end_datetime": "2026-03-01T11:00:00Z",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors


class TestBookingFieldsCrossValidation:
    def test_partial_booking_fields_rejected(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": 1,
            # missing start_datetime and end_datetime
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()


class TestRequiredFields:
    def test_missing_recipient_name(self):
        data = {
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "recipient_name" in s.errors


@pytest.mark.django_db
class TestBookingSerializer:
    def test_service_shape(self, booking_factory):
        booking = booking_factory()
        serializer = BookingSerializer(booking)
        service_data = serializer.data["service"]
        assert "id" in service_data
        assert "title_fr" in service_data
        assert "title_en" in service_data

    def test_fields_present(self, booking_factory):
        booking = booking_factory()
        data = BookingSerializer(booking).data
        assert "confirmation_code" in data
        assert "status" in data
        assert "source" in data
