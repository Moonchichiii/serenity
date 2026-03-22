import pytest

from apps.payments.serializers import (
    CheckoutRequestSerializer,
    CheckoutResponseSerializer,
)

pytestmark = pytest.mark.django_db


def _valid_payload():
    return {
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "recipient_name": "Jane Doe",
        "recipient_email": "jane@example.com",
        "preferred_language": "en",
        "amount": "45.00",
        "message": "Enjoy your gift",
        "service_id": 10,
    }


def test_checkout_request_serializer_accepts_valid_payload():
    serializer = CheckoutRequestSerializer(data=_valid_payload())

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["sender_name"] == "John Doe"
    assert serializer.validated_data["recipient_email"] == "jane@example.com"
    assert str(serializer.validated_data["amount"]) == "45.00"
    assert serializer.validated_data["message"] == "Enjoy your gift"


def test_checkout_request_serializer_requires_core_fields():
    serializer = CheckoutRequestSerializer(data={})

    assert not serializer.is_valid()
    assert "sender_name" in serializer.errors
    assert "sender_email" in serializer.errors
    assert "recipient_name" in serializer.errors
    assert "recipient_email" in serializer.errors
    assert "preferred_language" in serializer.errors
    assert "amount" in serializer.errors


def test_checkout_request_serializer_allows_blank_message():
    payload = _valid_payload()
    payload["message"] = ""

    serializer = CheckoutRequestSerializer(data=payload)

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["message"] == ""


def test_checkout_request_serializer_allows_optional_booking_fields():
    payload = _valid_payload()
    payload["start_datetime"] = "2026-03-20T10:00:00Z"
    payload["end_datetime"] = "2026-03-20T11:00:00Z"

    serializer = CheckoutRequestSerializer(data=payload)

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["service_id"] == 10
    assert serializer.validated_data["start_datetime"] is not None
    assert serializer.validated_data["end_datetime"] is not None


def test_checkout_request_serializer_rejects_invalid_email():
    payload = _valid_payload()
    payload["sender_email"] = "not-an-email"

    serializer = CheckoutRequestSerializer(data=payload)

    assert not serializer.is_valid()
    assert "sender_email" in serializer.errors


def test_checkout_response_serializer_accepts_valid_output():
    serializer = CheckoutResponseSerializer(
        data={
            "url": "https://checkout.stripe.com/c/pay/cs_test_123",
            "session_id": "cs_test_123",
        }
    )

    assert serializer.is_valid(), serializer.errors
