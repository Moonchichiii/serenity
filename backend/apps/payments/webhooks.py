from __future__ import annotations

import json
import logging
from typing import Any

import stripe
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from apps.vouchers.services import create_voucher, send_voucher_emails

from .models import PaymentStatus, StripePayment, StripeWebhookEvent

stripe.api_key = settings.STRIPE_SECRET_KEY
stripe.api_version = settings.STRIPE_API_VERSION

logger = logging.getLogger(__name__)


def _already_processed(event_id: str) -> bool:
    return StripeWebhookEvent.objects.filter(
        stripe_event_id=event_id
    ).exists()


def _mark_processed(event_id: str, event_type: str) -> None:
    StripeWebhookEvent.objects.create(
        stripe_event_id=event_id, event_type=event_type
    )


def _fulfill_from_checkout_session(
    session_obj: dict[str, Any],
) -> None:
    session_id = session_obj["id"]

    payment = StripePayment.objects.filter(
        stripe_checkout_session_id=session_id
    ).first()
    if not payment:
        logger.error(
            "Webhook for unknown checkout session: %s", session_id
        )
        return

    if payment.status == PaymentStatus.PAID and payment.voucher_id:
        return  # idempotent

    payment_intent = session_obj.get("payment_intent") or ""
    if payment_intent:
        payment.stripe_payment_intent_id = str(payment_intent)

    metadata = session_obj.get("metadata") or {}
    raw_payload = metadata.get("voucher_payload")
    if not raw_payload:
        logger.error(
            "Missing voucher_payload metadata for session=%s",
            session_id,
        )
        payment.status = PaymentStatus.FAILED
        payment.save(
            update_fields=["status", "stripe_payment_intent_id"]
        )
        return

    try:
        voucher_payload = json.loads(raw_payload)
        # --- FIX: Log the exact payload so we can verify field names ---
        logger.info(
            "Voucher payload from Stripe (session=%s): %s",
            session_id,
            json.dumps(voucher_payload, default=str),
        )
    except json.JSONDecodeError:
        logger.exception(
            "Invalid voucher_payload JSON for session=%s", session_id
        )
        payment.status = PaymentStatus.FAILED
        payment.save(
            update_fields=["status", "stripe_payment_intent_id"]
        )
        return

    voucher = create_voucher(voucher_payload)
    send_voucher_emails(voucher)

    payment.status = PaymentStatus.PAID
    payment.paid_at = timezone.now()
    payment.voucher_id = voucher.id
    payment.save(
        update_fields=[
            "status",
            "paid_at",
            "voucher_id",
            "stripe_payment_intent_id",
        ]
    )


@csrf_exempt
def stripe_webhook(request: HttpRequest) -> HttpResponse:
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=endpoint_secret,
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    event_id = event["id"]
    event_type = event["type"]

    if _already_processed(event_id):
        return HttpResponse(status=200)

    _mark_processed(event_id, event_type)

    if event_type in (
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    ):
        session_obj = event["data"]["object"]
        _fulfill_from_checkout_session(session_obj)

    return HttpResponse(status=200)
