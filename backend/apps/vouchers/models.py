import secrets
import string

from django.db import models
from wagtail.snippets.models import register_snippet

from apps.services.models import Service


def generate_voucher_code(length: int = 10) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@register_snippet
class GiftVoucher(models.Model):
    code = models.CharField(max_length=20, unique=True, blank=True)
    recipient_name = models.CharField(max_length=200)
    recipient_email = models.EmailField()
    sender_name = models.CharField(max_length=200)
    sender_email = models.EmailField()
    message = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_redeemed = models.BooleanField(default=False)
    preferred_language = models.CharField(max_length=2, default="fr")
    booking_confirmation = models.CharField(
        max_length=12, blank=True, default=""
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"Voucher {self.code} — {self.recipient_name}"

    def save(self, *args, **kwargs) -> None:
        if not self.code:
            self.code = generate_voucher_code()
        super().save(*args, **kwargs)


class Booking(models.Model):
    STATUS_CHOICES: list[tuple[str, str]] = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    SOURCE_CHOICES: list[tuple[str, str]] = [
        ("voucher", "Voucher"),
        ("manual", "Manual"),
    ]

    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    source = models.CharField(
        max_length=20, choices=SOURCE_CHOICES, default="voucher"
    )
    client_name = models.CharField(max_length=200)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=64)
    client_notes = models.TextField(blank=True, default="")
    preferred_language = models.CharField(max_length=2, default="fr")
    confirmation_code = models.CharField(max_length=12, unique=True)
    voucher_code = models.CharField(
        max_length=20, blank=True, default="", db_index=True
    )
    google_calendar_event_id = models.CharField(
        max_length=255, blank=True, default=""
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["client_email"]),
            models.Index(fields=["confirmation_code"]),
            models.Index(fields=["status"]),
            models.Index(fields=["source"]),
        ]

    def __str__(self) -> str:
        return (
            f"[{self.get_source_display()}] {self.client_name}"
            f" - {self.service}"
            f" - {self.start_datetime:%Y-%m-%d %H:%M}"
        )
