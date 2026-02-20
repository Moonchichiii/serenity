from __future__ import annotations

import logging
import secrets
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from apps.availability.calendar_gateway import (
    create_booking_event,
    delete_booking_event,
)
from apps.services.models import Service

from .models import Booking

if TYPE_CHECKING:
    from datetime import datetime

logger = logging.getLogger(__name__)

TZ = ZoneInfo('Europe/Paris')


def _generate_confirmation_code() -> str:
    """8-char uppercase hex code."""
    return secrets.token_hex(4).upper()


def _ensure_tz(dt: datetime) -> datetime:
    """Attach Europe/Paris timezone if the datetime is naive."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=TZ)
    return dt


def _build_calendar_description(
    *,
    service: Service,
    client_name: str,
    client_email: str,
    client_phone: str,
    confirmation_code: str,
    client_notes: str = '',
    source: str = 'online',
    voucher_code: str = '',
) -> str:
    """Build the description body for a Google Calendar event."""
    lines = [
        'Booking Details:',
        f'- Service: {service.title_en} ({service.duration_minutes} min)',
        f'- Client: {client_name}',
        f'- Email: {client_email}',
        f'- Phone: {client_phone}',
        f'- Confirmation Code: {confirmation_code}',
        f'- Source: {source}',
    ]
    if voucher_code:
        lines.append(f'- Voucher Code: {voucher_code}')
    lines.append(f"\nNotes: {client_notes or 'N/A'}")
    return '\n'.join(lines)


def _sync_to_google_calendar(
    booking: Booking, service: Service, data: dict[str, Any]
) -> None:
    """Create a Google Calendar event and update the booking record."""
    prefix = '[VOUCHER] ' if booking.source == 'voucher' else ''
    event_title = f"{prefix}{service.title_en} - {data['client_name']}"

    description = _build_calendar_description(
        service=service,
        client_name=str(data['client_name']),
        client_email=str(data['client_email']),
        client_phone=str(data['client_phone']),
        confirmation_code=booking.confirmation_code,
        client_notes=str(data.get('client_notes', '')),
        source=booking.source,
        voucher_code=booking.voucher_code,
    )

    calendar_event = create_booking_event(
        title=event_title,
        start_datetime=booking.start_datetime,
        end_datetime=booking.end_datetime,
        client_email=str(data['client_email']),
        client_name=str(data['client_name']),
        description=description,
    )

    if calendar_event:
        booking.google_calendar_event_id = calendar_event['id']
        booking.status = 'confirmed'
        booking.save()
        logger.info(
            'Google Calendar event created for booking %s (source=%s)',
            booking.confirmation_code,
            booking.source,
        )
    else:
        logger.warning(
            'Failed to create Google Calendar event for booking %s',
            booking.confirmation_code,
        )


def create_booking(data: dict[str, Any]) -> tuple[Booking | None, str | None]:
    """Create an online booking and sync to Google Calendar."""
    try:
        service = Service.objects.get(id=data['service_id'], is_available=True)
    except Service.DoesNotExist:
        return None, 'Service not found or unavailable'

    booking = Booking.objects.create(
        service=service,
        start_datetime=_ensure_tz(data['start_datetime']),
        end_datetime=_ensure_tz(data['end_datetime']),
        status='pending',
        source='online',
        client_name=data['client_name'],
        client_email=data['client_email'],
        client_phone=data['client_phone'],
        client_notes=data.get('client_notes', ''),
        preferred_language=data['preferred_language'],
        confirmation_code=_generate_confirmation_code(),
    )

    _sync_to_google_calendar(booking, service, data)
    logger.info('Online booking created: %s', booking.confirmation_code)
    return booking, None


def create_voucher_booking(
    data: dict[str, Any]
) -> tuple[Booking | None, str | None]:
    """Create a voucher-sourced booking and sync to Google Calendar."""
    try:
        service = Service.objects.get(id=data['service_id'], is_available=True)
    except Service.DoesNotExist:
        return None, 'Service not found or unavailable'

    booking = Booking.objects.create(
        service=service,
        start_datetime=_ensure_tz(data['start_datetime']),
        end_datetime=_ensure_tz(data['end_datetime']),
        status='pending',
        source='voucher',
        client_name=data['client_name'],
        client_email=data['client_email'],
        client_phone=data['client_phone'],
        client_notes=data.get('client_notes', ''),
        preferred_language=data['preferred_language'],
        confirmation_code=_generate_confirmation_code(),
        voucher_code=data.get('voucher_code', ''),
    )

    _sync_to_google_calendar(booking, service, data)
    logger.info(
        'Voucher booking created: %s (voucher=%s)',
        booking.confirmation_code,
        booking.voucher_code,
    )
    return booking, None


def cancel_booking(
    confirmation_code: str,
) -> tuple[dict[str, str] | None, str | None, int]:
    """Cancel a booking and remove from Google Calendar."""
    try:
        booking = Booking.objects.get(confirmation_code=confirmation_code)
    except Booking.DoesNotExist:
        return None, 'Booking not found', 404

    if booking.status not in ('pending', 'confirmed'):
        return None, f'Cannot cancel {booking.status} booking', 400

    if booking.google_calendar_event_id:
        deleted = delete_booking_event(booking.google_calendar_event_id)
        if not deleted:
            logger.warning(
                'Failed to delete calendar event for booking %s',
                confirmation_code,
            )

    booking.status = 'cancelled'
    booking.save()

    logger.info('Booking cancelled: %s', confirmation_code)
    return {'detail': 'Booking cancelled successfully'}, None, 200
