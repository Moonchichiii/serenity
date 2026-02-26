import pytest

from apps.vouchers.serializers import GiftVoucherInputSerializer


class TestGiftVoucherInputValid:
    def test_valid_without_slot(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors

    @pytest.mark.django_db
    def test_valid_with_slot_fields(self, available_service):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": available_service.id,
            "start_datetime": "2026-03-01T10:00:00+01:00",
            "end_datetime": "2026-03-01T11:00:00+01:00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors


class TestSlotFieldsCrossValidation:
    def test_partial_slot_fields_rejected(self):
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

    @pytest.mark.django_db
    def test_invalid_service_rejected(self, unavailable_service):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": unavailable_service.id,
            "start_datetime": "2026-03-01T10:00:00+01:00",
            "end_datetime": "2026-03-01T11:00:00+01:00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "service_id" in s.errors or "non_field_errors" in s.errors


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
