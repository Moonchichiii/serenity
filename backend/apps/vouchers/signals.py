import logging

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Booking

logger = logging.getLogger(__name__)


def _invalidate_booking_cache(booking: Booking) -> None:
    keys = [
        f"calendar:busy:{booking.start_datetime:%Y-%m}",
        f"calendar:slots:{booking.start_datetime:%Y-%m-%d}",
    ]
    cache.delete_many(keys)
    logger.debug("Invalidated cache keys: %s", keys)


@receiver(post_save, sender=Booking)
def booking_post_save(sender, instance, **kwargs):
    _invalidate_booking_cache(instance)


@receiver(post_delete, sender=Booking)
def booking_post_delete(sender, instance, **kwargs):
    _invalidate_booking_cache(instance)
