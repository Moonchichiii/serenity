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
                        "name": "Gift Voucher",
                        "description": (
                            f"Voucher for "
                            f"{voucher_payload.get('recipient_name', '')}"
                        ).strip(),
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
        amount=amount,
        currency=currency,
        stripe_checkout_session_id=session["id"],
        status=PaymentStatus.CREATED,
    )

    return payment, str(session["url"])
