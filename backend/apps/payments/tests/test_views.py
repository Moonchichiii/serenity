import json

import pytest
from django.urls import reverse

from apps.payments.models import PaymentStatus, StripePayment

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
    }


def test_create_checkout_returns_201_and_serialized_payload(client, monkeypatch):
    def fake_create_checkout_session(*, voucher_payload):
        payment = StripePayment.objects.create(
            amount="45.00",
            currency="eur",
            stripe_checkout_session_id="cs_test_123",
            status=PaymentStatus.CREATED,
        )
        return payment, "https://checkout.stripe.com/c/pay/cs_test_123"

    monkeypatch.setattr(
        "apps.payments.views.create_checkout_session",
        fake_create_checkout_session,
    )

    response = client.post(
        reverse("payments_checkout"),
        data=json.dumps(_valid_payload()),
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.json()
    assert data == {
        "url": "https://checkout.stripe.com/c/pay/cs_test_123",
        "session_id": "cs_test_123",
    }


def test_create_checkout_returns_400_for_invalid_payload(client):
    response = client.post(
        reverse("payments_checkout"),
        data=json.dumps({}),
        content_type="application/json",
    )

    assert response.status_code == 400


def test_get_payment_status_returns_400_when_session_id_missing(client):
    response = client.get(reverse("payments_status"))

    assert response.status_code == 400
    assert response.json() == {"error": "Missing session_id"}


def test_get_payment_status_returns_404_when_payment_missing(client):
    response = client.get(
        reverse("payments_status"),
        {"session_id": "cs_missing"},
    )

    assert response.status_code == 404
    assert response.json() == {"status": "unknown"}


def test_get_payment_status_returns_status_and_voucher_id(client):
    payment = StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        status=PaymentStatus.PAID,
        voucher_id=77,
    )

    response = client.get(
        reverse("payments_status"),
        {"session_id": payment.stripe_checkout_session_id},
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": PaymentStatus.PAID,
        "voucher_id": 77,
    }
