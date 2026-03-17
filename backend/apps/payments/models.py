from __future__ import annotations

from django.db import models


class PaymentStatus(models.TextChoices):
    CREATED = "created", "Created"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    CANCELED = "canceled", "Canceled"


class StripePayment(models.Model):
    """
    Tracks a single Stripe Checkout payment attempt.

    - We treat Stripe as source of truth.
    - We fulfill voucher after webhook confirms payment.
    """

    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.CREATED,
        db_index=True,
    )

    amount = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=10, default="eur")

    stripe_checkout_session_id = models.CharField(
        max_length=255, unique=True
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255, blank=True, default=""
    )

    # Store voucher id once fulfilled (no FK to avoid circular imports)
    voucher_id = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return (
            f"StripePayment({self.status}) "
            f"session={self.stripe_checkout_session_id}"
        )


class StripeWebhookEvent(models.Model):
    """
    Idempotency guard + audit log: Stripe can retry events.
    """

    stripe_event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=255)
    livemode = models.BooleanField(default=False)
    stripe_created_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.event_type} ({self.stripe_event_id})"
