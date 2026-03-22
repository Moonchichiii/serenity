from decimal import Decimal

import pytest

from apps.payments.models import PaymentStatus, StripePayment
from apps.payments.services import _money_to_minor_units, create_checkout_session

pytestmark = pytest.mark.django_db


def test_money_to_minor_units_converts_eur_amounts():
    assert _money_to_minor_units(Decimal("12.34")) == 1234
    assert _money_to_minor_units(Decimal("45.00")) == 4500
    assert _money_to_minor_units(Decimal("0.99")) == 99


def test_create_checkout_session_creates_payment_and_returns_url(
    monkeypatch,
    settings,
):
    settings.STRIPE_SECRET_KEY = "sk_test_123"
    settings.STRIPE_API_VERSION = "2024-06-20"
    settings.STRIPE_SUCCESS_URL = "https://example.com/success"
    settings.STRIPE_CANCEL_URL = "https://example.com/cancel"
    settings.STRIPE_CURRENCY = "eur"

    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return {
            "id": "cs_test_123",
            "url": "https://checkout.stripe.com/c/pay/cs_test_123",
        }

    monkeypatch.setattr(
        "apps.payments.services.stripe.checkout.Session.create",
        fake_create,
    )

    payment, url = create_checkout_session(
        voucher_payload={
            "sender_name": "John Doe",
            "sender_email": "john@example.com",
            "recipient_name": "Jane Doe",
            "recipient_email": "jane@example.com",
            "preferred_language": "en",
            "amount": "45.00",
            "message": "Enjoy your gift",
        }
    )

    assert isinstance(payment, StripePayment)
    assert payment.status == PaymentStatus.CREATED
    assert payment.stripe_checkout_session_id == "cs_test_123"
    assert str(payment.amount) == "45.00"
    assert payment.currency == "eur"
    assert url == "https://checkout.stripe.com/c/pay/cs_test_123"

    assert captured["mode"] == "payment"
    assert captured["success_url"] == settings.STRIPE_SUCCESS_URL
    assert captured["cancel_url"] == settings.STRIPE_CANCEL_URL
    assert captured["line_items"][0]["price_data"]["currency"] == "eur"
    assert captured["line_items"][0]["price_data"]["unit_amount"] == 4500
    assert captured["line_items"][0]["price_data"]["product_data"]["name"] == "Gift Voucher"
    assert "voucher_payload" in captured["metadata"]


def test_create_checkout_session_uses_default_currency_when_setting_missing(
    monkeypatch,
    settings,
):
    settings.STRIPE_SECRET_KEY = "sk_test_123"
    settings.STRIPE_API_VERSION = "2024-06-20"
    settings.STRIPE_SUCCESS_URL = "https://example.com/success"
    settings.STRIPE_CANCEL_URL = "https://example.com/cancel"
    if hasattr(settings, "STRIPE_CURRENCY"):
        delattr(settings, "STRIPE_CURRENCY")

    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return {
            "id": "cs_test_default_currency",
            "url": "https://checkout.stripe.com/c/pay/cs_test_default_currency",
        }

    monkeypatch.setattr(
        "apps.payments.services.stripe.checkout.Session.create",
        fake_create,
    )

    payment, _ = create_checkout_session(
        voucher_payload={
            "sender_name": "John Doe",
            "sender_email": "john@example.com",
            "recipient_name": "Jane Doe",
            "recipient_email": "jane@example.com",
            "preferred_language": "en",
            "amount": "10.00",
            "message": "",
        }
    )

    assert payment.currency == "eur"
    assert captured["line_items"][0]["price_data"]["currency"] == "eur"
