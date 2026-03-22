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

    preferred_language = models.CharField(max_length=2, default="fr")
    is_redeemed = models.BooleanField(default=False)

    # Optional: voucher linked to a service
    service = models.ForeignKey(
        Service,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="gift_vouchers",
    )

    # Optional: if client books at purchase time
    start_datetime = models.DateTimeField(null=True, blank=True)
    end_datetime = models.DateTimeField(null=True, blank=True)

    # Calendar metadata (stored on voucher, not a Booking model)
    calendar_event_id = models.CharField(max_length=255, blank=True, default="")
    calendar_event_link = models.URLField(blank=True, default="")
    calendar_event_status = models.CharField(max_length=64, blank=True, default="")

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
