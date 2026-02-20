from __future__ import annotations

import logging
from typing import Any

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Booking

logger = logging.getLogger(__name__)


def _invalidate_booking_cache(booking: Booking) -> None:
    """Clear availability caches for the booking's date."""
    start_date = booking.start_datetime.date()
    keys = [
        f"calendar:busy:{start_date.year}:{start_date.month}",
        f"calendar:slots:{start_date.isoformat()}",
    ]
    cache.delete_many(keys)
    logger.debug(
        "Invalidated availability cache for %s (booking %s)",
        start_date,
        booking.confirmation_code,
    )


@receiver(post_save, sender=Booking)
def booking_saved(sender: type[Booking], instance: Booking, **kwargs: Any) -> None:
    _invalidate_booking_cache(instance)


@receiver(post_delete, sender=Booking)
def booking_deleted(sender: type[Booking], instance: Booking, **kwargs: Any) -> None:
    _invalidate_booking_cache(instance)
