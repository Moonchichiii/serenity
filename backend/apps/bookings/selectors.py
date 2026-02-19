"""Read queries for bookings. Single source of truth for all booking reads."""

import logging

from .models import Booking

logger = logging.getLogger(__name__)

_BASE_QS = Booking.objects.select_related("service")


def get_all_bookings() -> list[Booking]:
    """Return all bookings, newest first."""
    return list(_BASE_QS.order_by("-created_at"))


def get_bookings_by_email(email: str) -> list[Booking]:
    """Return all bookings for a given client email."""
    return list(
        _BASE_QS.filter(client_email__iexact=email).order_by("-created_at")
    )


def get_booking_by_confirmation_code(code: str) -> Booking | None:
    """Look up a single booking by its confirmation code."""
    try:
        return _BASE_QS.get(confirmation_code=code)
    except Booking.DoesNotExist:
        return None
