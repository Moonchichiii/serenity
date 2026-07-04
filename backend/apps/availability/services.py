"""Booking fulfillment (called from the Stripe webhook)."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from . import calendar_gateway
from .models import Booking

logger = logging.getLogger(__name__)


def _as_datetime(value: Any) -> datetime:
    """Metadata round-trips through JSON — datetimes arrive as strings."""
    if isinstance(value, datetime):
        dt = value
    else:
        parsed = parse_datetime(str(value))
        if parsed is None:
            raise ValueError(f"Unparseable datetime: {value!r}")
        dt = parsed
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    return dt


def create_booking_from_payload(
    payload: dict[str, Any], *, session_id: str
) -> tuple[Booking, bool]:
    """Idempotently create the Booking for a paid checkout session.

    `stripe_checkout_session_id` is unique — duplicate webhook delivery
    finds the existing row instead of double-booking.
    """
    defaults: dict[str, Any] = {
            "service_id": payload["service_id"],
            "customer_name": payload.get("sender_name", ""),
            "customer_email": payload.get("sender_email", ""),
            "preferred_language": payload.get("preferred_language", "fr"),
            "message": payload.get("message", "") or "",
            "start_datetime": _as_datetime(payload["start_datetime"]),
            "end_datetime": _as_datetime(payload["end_datetime"]),
    }
    booking, created = Booking.objects.get_or_create(
        stripe_checkout_session_id=session_id,
        defaults=defaults,
    )
    return booking, created


def sync_booking_to_calendar(booking: Booking) -> None:
    if booking.google_event_id:
        return
    event = calendar_gateway.create_booking_event(
        title=f"Booking — {booking.service}",
        start_datetime=booking.start_datetime,
        end_datetime=booking.end_datetime,
        client_email=booking.customer_email,
        client_name=booking.customer_name,
        description=booking.message or "",
    )
    event_id = str(event.get("id") or "") if event else ""
    if event_id:
        booking.google_event_id = event_id
        booking.save(update_fields=["google_event_id"])


def send_booking_emails(booking: Booking) -> None:
    """Confirmation to the customer + notification to the studio."""
    when = booking.start_datetime.strftime("%Y-%m-%d %H:%M")
    if booking.preferred_language == "fr":
        subject = "Votre réservation — La Serenity"
        body = (
            f"Bonjour {booking.customer_name},\n\n"
            f"Votre réservation est confirmée :\n"
            f"Soin : {booking.service}\n"
            f"Date : {when}\n\n"
            f"À très bientôt,\nLa Serenity"
        )
    else:
        subject = "Your booking — La Serenity"
        body = (
            f"Hello {booking.customer_name},\n\n"
            f"Your booking is confirmed:\n"
            f"Treatment: {booking.service}\n"
            f"Date: {when}\n\n"
            f"See you soon,\nLa Serenity"
        )
    try:
        EmailMessage(
            subject=subject,
            body=body,
            to=[booking.customer_email],
        ).send()
    except Exception:
        logger.exception("Booking confirmation email failed: %s", booking.pk)

    admin_to = getattr(settings, "BOOKING_ADMIN_EMAIL", "") or getattr(
        settings, "DEFAULT_FROM_EMAIL", ""
    )
    if not admin_to:
        return
    try:
        EmailMessage(
            subject=f"New booking: {booking.customer_name} — {when}",
            body=(
                f"Service: {booking.service}\n"
                f"Customer: {booking.customer_name} <{booking.customer_email}>\n"
                f"Start: {booking.start_datetime.isoformat()}\n"
                f"End: {booking.end_datetime.isoformat()}\n"
                f"Message: {booking.message or '-'}\n"
                f"Session: {booking.stripe_checkout_session_id}"
            ),
            to=[admin_to],
        ).send()
    except Exception:
        logger.exception("Booking admin email failed: %s", booking.pk)
