"""Booking flow: kind=booking through checkout → webhook → fulfillment.

Covers prompt 03's Stripe points: idempotent fulfillment and duplicate
webhook delivery, plus the new checkout honeypot coverage.
"""

from __future__ import annotations

from datetime import timedelta

import pytest
from django.db import transaction
from django.utils import timezone
from rest_framework.test import APIClient

from apps.availability.models import Booking
from apps.payments.models import PaymentStatus, StripePayment
from apps.payments.webhooks import _fulfill_from_checkout_session

pytestmark = pytest.mark.django_db


@pytest.fixture
def service(db):
    from apps.services.models import Service

    return Service.objects.create(price=60)


def _start():
    return (timezone.now() + timedelta(days=3)).replace(microsecond=0)


def _booking_payload(service, **extra):
    start = _start()
    return {
        "kind": "booking",
        "sender_name": "Test Customer",
        "sender_email": "customer@example.com",
        "preferred_language": "fr",
        "amount": "60.00",
        "service_id": service.id,
        "start_datetime": start.isoformat(),
        "end_datetime": (start + timedelta(minutes=60)).isoformat(),
        **extra,
    }


class TestCheckoutKind:
    def test_booking_checkout_creates_payment_with_kind(
        self, client, service, monkeypatch
    ):
        captured = {}

        def fake_create(**kwargs):
            captured.update(kwargs)
            return {"id": "cs_book_1", "url": "https://stripe.test/cs_book_1"}

        monkeypatch.setattr(
            "apps.payments.services.stripe.checkout.Session.create",
            fake_create,
        )
        response = APIClient().post(
            "/api/payments/checkout/", _booking_payload(service), format="json"
        )
        assert response.status_code == 201
        payment = StripePayment.objects.get(
            stripe_checkout_session_id="cs_book_1"
        )
        assert payment.kind == "booking"
        name = captured["line_items"][0]["price_data"]["product_data"]["name"]
        assert name.startswith("Booking")
        assert '"kind": "booking"' in captured["metadata"]["voucher_payload"]

    def test_booking_requires_schedule_fields(self, client, service):
        payload = _booking_payload(service)
        payload.pop("start_datetime")
        response = APIClient().post(
            "/api/payments/checkout/", payload, format="json"
        )
        assert response.status_code == 400
        codes = [
            e["code"]
            for e in response.data["errors"]
            if e["field"] == "start_datetime"
        ]
        assert codes == ["required"]

    def test_gift_still_requires_recipient(self, client):
        response = APIClient().post(
            "/api/payments/checkout/",
            {
                "sender_name": "A",
                "sender_email": "a@example.com",
                "preferred_language": "fr",
                "amount": "60.00",
            },
            format="json",
        )
        assert response.status_code == 400
        fields = {e["field"] for e in response.data["errors"]}
        assert {"recipient_name", "recipient_email"} <= fields

    def test_checkout_honeypot_rejected(self, client, service):
        response = APIClient().post(
            "/api/payments/checkout/",
            _booking_payload(service, website="https://spam.example"),
            format="json",
        )
        assert response.status_code == 400
        assert response.data["errors"][0]["code"] == "spam_detected"


class TestBookingFulfillment:
    def _session(self, service, session_id="cs_book_hook"):
        import json

        return {
            "id": session_id,
            "payment_intent": "pi_123",
            "metadata": {
                "voucher_payload": json.dumps(
                    _booking_payload(service), default=str
                )
            },
        }

    def _fulfill(self, session_obj):
        with transaction.atomic():
            _fulfill_from_checkout_session(session_obj)

    def test_completed_session_creates_booking_and_emails(
        self, service, monkeypatch, mailoutbox
    ):
        monkeypatch.setattr(
            "apps.availability.services.calendar_gateway.create_booking_event",
            lambda **kw: {"id": "gcal_evt_1"},
        )
        StripePayment.objects.create(
            kind="booking",
            amount="60.00",
            stripe_checkout_session_id="cs_book_hook",
        )
        self._fulfill(self._session(service))

        booking = Booking.objects.get(
            stripe_checkout_session_id="cs_book_hook"
        )
        assert booking.google_event_id == "gcal_evt_1"
        payment = StripePayment.objects.get(
            stripe_checkout_session_id="cs_book_hook"
        )
        assert payment.status == PaymentStatus.PAID
        assert payment.booking_id == booking.id
        assert len(mailoutbox) == 2  # customer + admin

    def test_duplicate_webhook_is_idempotent(
        self, service, monkeypatch, mailoutbox
    ):
        monkeypatch.setattr(
            "apps.availability.services.calendar_gateway.create_booking_event",
            lambda **kw: None,
        )
        StripePayment.objects.create(
            kind="booking",
            amount="60.00",
            stripe_checkout_session_id="cs_book_hook",
        )
        session = self._session(service)
        self._fulfill(session)
        emails_after_first = len(mailoutbox)

        self._fulfill(session)  # duplicate delivery

        assert Booking.objects.count() == 1
        assert len(mailoutbox) == emails_after_first

    def test_gift_fulfillment_regression(self, monkeypatch, mailoutbox):
        import json

        created = {}

        def fake_create_voucher(payload):
            class V:
                id = 99

            created["payload"] = payload
            return V()

        monkeypatch.setattr(
            "apps.payments.webhooks.create_voucher", fake_create_voucher
        )
        StripePayment.objects.create(
            amount="60.00", stripe_checkout_session_id="cs_gift_1"
        )
        self._fulfillish = None
        with transaction.atomic():
            _fulfill_from_checkout_session(
                {
                    "id": "cs_gift_1",
                    "payment_intent": "pi_g",
                    "metadata": {
                        "voucher_payload": json.dumps(
                            {
                                "sender_name": "A",
                                "sender_email": "a@e.com",
                                "recipient_name": "B",
                                "recipient_email": "b@e.com",
                                "preferred_language": "fr",
                                "amount": "60.00",
                            }
                        )
                    },
                }
            )
        payment = StripePayment.objects.get(
            stripe_checkout_session_id="cs_gift_1"
        )
        assert payment.status == PaymentStatus.PAID
        assert payment.voucher_id == 99
        assert created["payload"]["recipient_name"] == "B"
