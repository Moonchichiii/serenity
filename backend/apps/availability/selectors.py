import logging

from .calendar_gateway import list_busy_days, list_free_slots

logger = logging.getLogger(__name__)


def get_busy_days(*, year: int, month: int) -> list[str]:
    """
    Return busy dates for a month.

    No caching in this pass.
    """
    return list_busy_days(year, month)


def get_free_slots(*, date_iso: str) -> list[str]:
    """
    Return available time slots for a date.

    No caching in this pass.
    """
    return list_free_slots(date_iso)
