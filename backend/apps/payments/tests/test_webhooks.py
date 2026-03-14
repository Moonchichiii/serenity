import json

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.payments.models import PaymentStatus, StripePayment, StripeWebhookEvent
from apps.payments.webhooks import (
    _already_processed,
    _fulfill_from_checkout_session,
    _mark_processed,
)

pytestmark = pytest.mark.django_db


def test_already_processed_returns_false_initially():
    assert _already_processed("evt_123") is False


def test_mark_processed_creates_idempotency_record():
    _mark_processed("evt_123", "checkout.session.completed")

    assert _already_processed("evt_123") is True

    event = StripeWebhookEvent.objects.get(stripe_event_id="evt_123")
    assert event.event_type == "checkout.session.completed"


def test_fulfill_from_checkout_session_returns_cleanly_for_unknown_session(caplog):
    _fulfill_from_checkout_session({"id": "cs_unknown", "metadata": {}})

    assert "Webhook for unknown checkout session" in caplog.text


def test_fulfill_from_checkout_session_is_idempotent_when_already_paid(monkeypatch):
    payment = StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        stripe_payment_intent_id="pi_existing",
        status=PaymentStatus.PAID,
        voucher_id=77,
        paid_at=timezone.now(),
    )

    called = {"create": 0, "send": 0}

    def fake_create_voucher(payload):
        called["create"] += 1
        raise AssertionError("create_voucher should not be called")

    def fake_send_voucher_emails(voucher):
        called["send"] += 1
        raise AssertionError("send_voucher_emails should not be called")

    monkeypatch.setattr(
        "apps.payments.webhooks.create_voucher",
        fake_create_voucher,
    )
    monkeypatch.setattr(
        "apps.payments.webhooks.send_voucher_emails",
        fake_send_voucher_emails,
    )

    _fulfill_from_checkout_session(
        {
            "id": "cs_test_123",
            "payment_intent": "pi_new",
            "metadata": {
                "voucher_payload": json.dumps({"amount": "45.00"}),
            },
        }
    )

    payment.refresh_from_db()
    assert payment.status == PaymentStatus.PAID
    assert payment.voucher_id == 77
    assert called["create"] == 0
    assert called["send"] == 0


def test_fulfill_from_checkout_session_marks_failed_when_payload_missing():
    payment = StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        status=PaymentStatus.CREATED,
    )

    _fulfill_from_checkout_session(
        {
            "id": "cs_test_123",
            "payment_intent": "pi_123",
            "metadata": {},
        }
    )

    payment.refresh_from_db()
    assert payment.status == PaymentStatus.FAILED
    assert payment.stripe_payment_intent_id == "pi_123"


def test_fulfill_from_checkout_session_marks_failed_when_payload_is_bad_json():
    payment = StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        status=PaymentStatus.CREATED,
    )

    _fulfill_from_checkout_session(
        {
            "id": "cs_test_123",
            "payment_intent": "pi_123",
            "metadata": {"voucher_payload": "{bad json}"},
        }
    )

    payment.refresh_from_db()
    assert payment.status == PaymentStatus.FAILED
    assert payment.stripe_payment_intent_id == "pi_123"


def test_fulfill_from_checkout_session_marks_paid_and_sets_voucher(monkeypatch):
    payment = StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        status=PaymentStatus.CREATED,
    )

    class DummyVoucher:
        id = 88

    created_payloads = []
    emailed_vouchers = []

    def fake_create_voucher(payload):
        created_payloads.append(payload)
        return DummyVoucher()

    def fake_send_voucher_emails(voucher):
        emailed_vouchers.append(voucher.id)

    monkeypatch.setattr(
        "apps.payments.webhooks.create_voucher",
        fake_create_voucher,
    )
    monkeypatch.setattr(
        "apps.payments.webhooks.send_voucher_emails",
        fake_send_voucher_emails,
    )

    voucher_payload = {
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "recipient_name": "Jane Doe",
        "recipient_email": "jane@example.com",
        "preferred_language": "en",
        "amount": "45.00",
        "message": "Enjoy your gift",
    }

    _fulfill_from_checkout_session(
        {
            "id": "cs_test_123",
            "payment_intent": "pi_123",
            "metadata": {
                "voucher_payload": json.dumps(voucher_payload),
            },
        }
    )

    payment.refresh_from_db()
    assert payment.status == PaymentStatus.PAID
    assert payment.voucher_id == 88
    assert payment.stripe_payment_intent_id == "pi_123"
    assert payment.paid_at is not None
    assert created_payloads == [voucher_payload]
    assert emailed_vouchers == [88]


def test_stripe_webhook_returns_400_on_invalid_payload(client, monkeypatch, settings):
    settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

    def fake_construct_event(**kwargs):
        raise ValueError("invalid payload")

    monkeypatch.setattr(
        "apps.payments.webhooks.stripe.Webhook.construct_event",
        fake_construct_event,
    )

    response = client.post(
        reverse("payments_webhook"),
        data="bad-payload",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="sig_test",
    )

    assert response.status_code == 400


def test_stripe_webhook_returns_200_for_already_processed_event(client, monkeypatch, settings):
    settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

    StripeWebhookEvent.objects.create(
        stripe_event_id="evt_123",
        event_type="checkout.session.completed",
    )

    def fake_construct_event(**kwargs):
        return {
            "id": "evt_123",
            "type": "checkout.session.completed",
            "data": {"object": {"id": "cs_test_123"}},
        }

    monkeypatch.setattr(
        "apps.payments.webhooks.stripe.Webhook.construct_event",
        fake_construct_event,
    )

    response = client.post(
        reverse("payments_webhook"),
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="sig_test",
    )

    assert response.status_code == 200
    assert StripeWebhookEvent.objects.filter(stripe_event_id="evt_123").count() == 1


def test_stripe_webhook_processes_checkout_session_completed(client, monkeypatch, settings):
    settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

    StripePayment.objects.create(
        amount="45.00",
        currency="eur",
        stripe_checkout_session_id="cs_test_123",
        status=PaymentStatus.CREATED,
    )

    class DummyVoucher:
        id = 55

    def fake_construct_event(**kwargs):
        return {
            "id": "evt_456",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "payment_intent": "pi_123",
                    "metadata": {
                        "voucher_payload": json.dumps(
                            {
                                "sender_name": "John Doe",
                                "sender_email": "john@example.com",
                                "recipient_name": "Jane Doe",
                                "recipient_email": "jane@example.com",
                                "preferred_language": "en",
                                "amount": "45.00",
                            }
                        )
                    },
                }
            },
        }

    monkeypatch.setattr(
        "apps.payments.webhooks.stripe.Webhook.construct_event",
        fake_construct_event,
    )
    monkeypatch.setattr(
        "apps.payments.webhooks.create_voucher",
        lambda payload: DummyVoucher(),
    )
    monkeypatch.setattr(
        "apps.payments.webhooks.send_voucher_emails",
        lambda voucher: None,
    )

    response = client.post(
        reverse("payments_webhook"),
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="sig_test",
    )

    assert response.status_code == 200

    payment = StripePayment.objects.get(
        stripe_checkout_session_id="cs_test_123"
    )
    assert payment.status == PaymentStatus.PAID
    assert payment.voucher_id == 55
    assert StripeWebhookEvent.objects.filter(stripe_event_id="evt_456").exists()


def test_stripe_webhook_ignores_unhandled_event_type_but_marks_processed(
    client,
    monkeypatch,
    settings,
):
    settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

    def fake_construct_event(**kwargs):
        return {
            "id": "evt_unhandled",
            "type": "payment_intent.created",
            "data": {"object": {}},
        }

    monkeypatch.setattr(
        "apps.payments.webhooks.stripe.Webhook.construct_event",
        fake_construct_event,
    )

    response = client.post(
        reverse("payments_webhook"),
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="sig_test",
    )

    assert response.status_code == 200
    assert StripeWebhookEvent.objects.filter(
        stripe_event_id="evt_unhandled",
        event_type="payment_intent.created",
    ).exists()
