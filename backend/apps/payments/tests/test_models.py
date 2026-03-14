import pytest

from apps.payments.models import PaymentStatus, StripePayment, StripeWebhookEvent

pytestmark = pytest.mark.django_db


def test_stripe_payment_str_uses_status_and_session_id():
    payment = StripePayment(
        status=PaymentStatus.CREATED,
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
    )

    assert str(payment) == "StripePayment(created) session=cs_test_123"


def test_stripe_webhook_event_str_uses_type_and_event_id():
    event = StripeWebhookEvent(
        stripe_event_id="evt_123",
        event_type="checkout.session.completed",
    )

    assert str(event) == "checkout.session.completed (evt_123)"


def test_payment_status_choices_are_stable():
    assert PaymentStatus.CREATED == "created"
    assert PaymentStatus.PAID == "paid"
    assert PaymentStatus.FAILED == "failed"
    assert PaymentStatus.CANCELED == "canceled"
