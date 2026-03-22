import pytest

from apps.payments.models import (
    PaymentStatus,
    StripePayment,
    StripeWebhookEvent,
)

pytestmark = pytest.mark.django_db


def test_stripe_payment_str_uses_status_and_session_id():
    payment = StripePayment(
        status=PaymentStatus.CREATED,
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
    )

    assert (
        str(payment)
        == "StripePayment(created) session=cs_test_123"
    )


def test_stripe_webhook_event_str_uses_type_and_event_id():
    event = StripeWebhookEvent(
        stripe_event_id="evt_123",
        event_type="checkout.session.completed",
    )

    assert (
        str(event) == "checkout.session.completed (evt_123)"
    )


def test_payment_status_choices_are_stable():
    assert PaymentStatus.CREATED == "created"
    assert PaymentStatus.PAID == "paid"
    assert PaymentStatus.FAILED == "failed"
    assert PaymentStatus.CANCELED == "canceled"


def test_stripe_webhook_event_stores_livemode_and_stripe_created_at():
    from datetime import UTC, datetime

    ts = 1700000000
    expected_dt = datetime.fromtimestamp(ts, tz=UTC)

    event = StripeWebhookEvent.objects.create(
        stripe_event_id="evt_audit_test",
        event_type="checkout.session.completed",
        livemode=True,
        stripe_created_at=expected_dt,
    )

    event.refresh_from_db()
    assert event.livemode is True
    assert event.stripe_created_at == expected_dt
    assert event.created_at is not None
