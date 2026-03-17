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


@pytest.mark.django_db
class TestGiftVoucherInputServiceOnly:
    def test_valid_with_service_id_only(self, available_service):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": available_service.id,
        }
        s = GiftVoucherInputSerializer(data=data)
        assert s.is_valid(), s.errors


class TestSlotFieldsCrossValidation:
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


class TestSlotFieldValidation:
    def test_start_datetime_without_end_datetime_is_rejected(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "start_datetime": "2026-03-01T10:00:00+01:00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "non_field_errors" in s.errors

    def test_end_datetime_without_start_datetime_is_rejected(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "end_datetime": "2026-03-01T11:00:00+01:00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "non_field_errors" in s.errors

    def test_start_and_end_without_service_id_is_rejected(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "start_datetime": "2026-03-01T10:00:00+01:00",
            "end_datetime": "2026-03-01T11:00:00+01:00",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "non_field_errors" in s.errors

    def test_invalid_language_rejected(self):
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "preferred_language": "sv",
        }
        s = GiftVoucherInputSerializer(data=data)
        assert not s.is_valid()
        assert "preferred_language" in s.errors


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
