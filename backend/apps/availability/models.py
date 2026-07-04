from __future__ import annotations

from django.db import models


class BookingStatus(models.TextChoices):
    CONFIRMED = "confirmed", "Confirmed"
    CANCELED = "canceled", "Canceled"


class Booking(models.Model):
    """A paid massage booking (kind="booking" checkout flow).

    Created by the Stripe webhook after payment confirmation — never
    directly by the API. `stripe_checkout_session_id` is unique so
    fulfillment is idempotent even under duplicate webhook delivery.
    """

    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.CONFIRMED,
        db_index=True,
    )

    service = models.ForeignKey(
        "services.Service",
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    preferred_language = models.CharField(max_length=10, default="fr")
    message = models.TextField(blank=True, default="")

    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    stripe_checkout_session_id = models.CharField(max_length=255, unique=True)
    google_event_id = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-start_datetime",)

    def __str__(self) -> str:
        return (
            f"Booking({self.status}) {self.customer_name} "
            f"{self.start_datetime:%Y-%m-%d %H:%M}"
        )
