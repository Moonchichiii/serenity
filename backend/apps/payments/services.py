from __future__ import annotations

import json
from decimal import Decimal
from typing import Any

import stripe
from django.conf import settings

from .models import PaymentStatus, StripePayment


def _money_to_minor_units(amount: Decimal) -> int:
    # EUR has 2 decimals: 12.34 -> 1234
    return int((amount * 100).quantize(Decimal("1")))


def create_checkout_session(
    *, voucher_payload: dict[str, Any]
) -> tuple[StripePayment, str]:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe.api_version = settings.STRIPE_API_VERSION

    amount = Decimal(str(voucher_payload["amount"]))
    currency = getattr(settings, "STRIPE_CURRENCY", "eur")
    kind = voucher_payload.get("kind", "gift")

    if kind == "booking":
        product_name = "Massage booking"
        service_id = voucher_payload.get("service_id")
        if service_id:
            from apps.services.models import Service

            service = Service.objects.filter(pk=service_id).first()
            if service:
                product_name = f"Booking \u2014 {service}"
        start = voucher_payload.get("start_datetime")
        product_description = f"Session: {start}" if start else ""
    else:
        product_name = "Gift Voucher"
        product_description = (
            f"Voucher for {voucher_payload.get('recipient_name', '')}"
        ).strip()

    session = stripe.checkout.Session.create(
        mode="payment",
        success_url=settings.STRIPE_SUCCESS_URL,
        cancel_url=settings.STRIPE_CANCEL_URL,
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": currency,
                    "unit_amount": _money_to_minor_units(amount),
                    "product_data": {
                        "name": product_name,
                        "description": product_description or " ",
                    },
                },
            }
        ],
        metadata={
            "voucher_payload": json.dumps(
                voucher_payload, default=str
            )
        },
    )

    payment = StripePayment.objects.create(
        kind=kind,
        amount=amount,
        currency=currency,
        stripe_checkout_session_id=session["id"],
        status=PaymentStatus.CREATED,
    )

    return payment, str(session["url"])
