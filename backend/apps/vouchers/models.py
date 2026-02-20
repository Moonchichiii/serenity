from __future__ import annotations

import secrets
from typing import Any

from django.db import models
from django.utils.translation import gettext_lazy as _
from wagtail.snippets.models import register_snippet


def generate_voucher_code() -> str:
    """Generate a random 8-character uppercase alphanumeric code."""
    return secrets.token_urlsafe(6).upper().replace('-', '')[:8]


@register_snippet
class GiftVoucher(models.Model):
    code = models.CharField(max_length=16, unique=True, editable=False)

    purchaser_name = models.CharField(_('Purchaser Name'), max_length=128)
    purchaser_email = models.EmailField(_('Purchaser Email'))

    recipient_name = models.CharField(_('Recipient Name'), max_length=128)
    recipient_email = models.EmailField(_('Recipient Email'))

    message = models.TextField(_('Message'), blank=True)
    preferred_date = models.DateField(
        _('Preferred Date'), null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    is_redeemed = models.BooleanField(_('Redeemed'), default=False)
    redeemed_at = models.DateTimeField(
        _('Redeemed At'), null=True, blank=True
    )

    class Meta:
        # Fixed RUF012: Converted list to immutable tuple
        ordering = ('-created_at',)
        verbose_name = _('Gift Voucher')
        verbose_name_plural = _('Gift Vouchers')

    def __str__(self) -> str:
        # Replaced EN DASH with normal hyphen
        return (
            f'{self.code} - {self.recipient_name} '
            f'(From: {self.purchaser_name})'
        )

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Assign a unique voucher code on initial save."""
        if not self.code:
            code = generate_voucher_code()
            while GiftVoucher.objects.filter(code=code).exists():
                code = generate_voucher_code()
            self.code = code
        super().save(*args, **kwargs)
