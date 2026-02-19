import logging

from django.core.cache import cache

from .google_calendar import list_busy_days, list_free_slots

logger = logging.getLogger(__name__)

BUSY_DAYS_TTL = 60 * 5  # 5 minutes
FREE_SLOTS_TTL = 60  # 1 minute


def get_busy_days(*, year: int, month: int) -> list[str]:
    """Return busy dates for a month, cached for 5 minutes."""
    cache_key = f"calendar:busy:{year}:{month}"
    data = cache.get(cache_key)

    if data is not None:
        return data

    data = list_busy_days(year, month)
    cache.set(cache_key, data, BUSY_DAYS_TTL)
    return data


def get_free_slots(*, date_iso: str) -> list[str]:
    """Return available time slots for a date, cached for 1 minute."""
    cache_key = f"calendar:slots:{date_iso}"
    data = cache.get(cache_key)

    if data is not None:
        return data

    data = list_free_slots(date_iso)
    cache.set(cache_key, data, FREE_SLOTS_TTL)
    return data
