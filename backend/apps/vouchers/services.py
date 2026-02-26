import logging
import secrets
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from apps.availability.calendar_gateway import (
    create_booking_event,
    delete_booking_event,
)
from apps.core.utils import safe_format
from apps.services.models import Service

from .models import Booking, GiftVoucher

logger = logging.getLogger(__name__)

TZ = ZoneInfo("Europe/Paris")


# ── Booking helpers ──────────────────────────────────────────────


def _generate_confirmation_code() -> str:
    return secrets.token_hex(4).upper()


def _ensure_tz(dt):
    if dt.tzinfo is None:
        return dt.replace(tzinfo=TZ)
    return dt


def _build_calendar_description(
    client_name: str,
    client_email: str,
    client_phone: str,
    client_notes: str,
    source: str = "voucher",
    voucher_code: str = "",
) -> str:
    lines = [
        f"Client: {client_name}",
        f"Email: {client_email}",
        f"Phone: {client_phone}",
        f"Source: {source}",
    ]
    if voucher_code:
        lines.append(f"Voucher: {voucher_code}")
    if client_notes:
        lines.append(f"Notes: {client_notes}")
    return "\n".join(lines)


def _sync_to_google_calendar(
    booking: Booking, service: Service, data: dict
) -> None:
    description = _build_calendar_description(
        client_name=booking.client_name,
        client_email=booking.client_email,
        client_phone=booking.client_phone,
        client_notes=booking.client_notes,
        source=booking.source,
        voucher_code=booking.voucher_code,
    )
    title = (
        f"[Voucher] {booking.client_name} - {service.title_fr}"
        if booking.source == "voucher"
        else f"{booking.client_name} - {service.title_fr}"
    )
    event = create_booking_event(
        title=title,
        start_datetime=booking.start_datetime.isoformat(),
        end_datetime=booking.end_datetime.isoformat(),
        description=description,
    )
    if event and event.get("id"):
        booking.google_calendar_event_id = event["id"]
        booking.status = "confirmed"
        booking.save(
            update_fields=["google_calendar_event_id", "status"]
        )


def _create_linked_booking(
    voucher: GiftVoucher,
    service_id: int,
    start_dt,
    end_dt,
) -> str:
    try:
        service = Service.objects.get(id=service_id, is_available=True)
    except Service.DoesNotExist:
        logger.warning(
            "Booking skipped — service %s not found or unavailable.",
            service_id,
        )
        return ""

    start_dt = _ensure_tz(start_dt)
    end_dt = _ensure_tz(end_dt)
    confirmation_code = _generate_confirmation_code()

    booking = Booking.objects.create(
        service=service,
        start_datetime=start_dt,
        end_datetime=end_dt,
        status="pending",
        source="voucher",
        client_name=voucher.recipient_name,
        client_email=voucher.recipient_email,
        client_phone="",
        client_notes="",
        preferred_language=voucher.preferred_language,
        confirmation_code=confirmation_code,
        voucher_code=voucher.code,
    )

    _sync_to_google_calendar(booking, service, {})
    return confirmation_code


def cancel_booking(
    confirmation_code: str,
) -> tuple[dict | None, str | None, int]:
    try:
        booking = Booking.objects.get(
            confirmation_code=confirmation_code
        )
    except Booking.DoesNotExist:
        return (None, "Booking not found.", 404)

    if booking.status == "cancelled":
        return (None, "Booking is already cancelled.", 400)

    if booking.status == "completed":
        return (None, "Cannot cancel a completed booking.", 400)

    if booking.google_calendar_event_id:
        try:
            delete_booking_event(booking.google_calendar_event_id)
        except Exception:
            logger.exception(
                "Failed to delete calendar event %s",
                booking.google_calendar_event_id,
            )

    booking.status = "cancelled"
    booking.save(update_fields=["status"])

    return (
        {"confirmation_code": booking.confirmation_code, "status": "cancelled"},
        None,
        200,
    )


# ── Voucher email helpers ───────────────────────────────────────


def _resolve_gift_settings() -> dict:
    gift_settings = getattr(settings, "GIFT_VOUCHER_SETTINGS", {})
    return {
        "business_name": gift_settings.get(
            "business_name", "Serenity Touch"
        ),
        "business_email": gift_settings.get("business_email", ""),
        "business_phone": gift_settings.get("business_phone", ""),
        "business_address": gift_settings.get("business_address", ""),
        "site_url": gift_settings.get("site_url", ""),
    }


def _resolve_language(voucher: GiftVoucher) -> str:
    return voucher.preferred_language or "fr"


def _build_email_context(
    voucher: GiftVoucher, gift_settings: dict, lang: str
) -> dict:
    return {
        "voucher": voucher,
        "lang": lang,
        **gift_settings,
    }


def _send_recipient_email(
    voucher: GiftVoucher, context: dict, lang: str, gift_settings: dict
) -> None:
    subject_template = (
        "Your gift voucher from {business_name}"
        if lang == "en"
        else "Votre bon cadeau de {business_name}"
    )
    subject = safe_format(
        subject_template, business_name=gift_settings["business_name"]
    )
    html = render_to_string(
        f"vouchers/emails/voucher_recipient_{lang}.html", context
    )
    text = render_to_string(
        f"vouchers/emails/voucher_recipient_{lang}.txt", context
    )
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[voucher.recipient_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send()


def _send_admin_email(
    voucher: GiftVoucher, context: dict, gift_settings: dict
) -> None:
    admin_email = gift_settings.get("business_email")
    if not admin_email:
        logger.warning("No admin email configured — skipping admin notification.")
        return
    subject = f"New voucher sold: {voucher.code}"
    html = render_to_string(
        "vouchers/emails/voucher_admin_notification.html", context
    )
    text = render_to_string(
        "vouchers/emails/voucher_admin_notification.txt", context
    )
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[admin_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send()


def send_voucher_emails(voucher: GiftVoucher) -> None:
    gift_settings = _resolve_gift_settings()
    lang = _resolve_language(voucher)
    context = _build_email_context(voucher, gift_settings, lang)

    try:
        _send_recipient_email(voucher, context, lang, gift_settings)
    except Exception:
        logger.exception("Failed to send recipient email for %s", voucher.code)

    try:
        _send_admin_email(voucher, context, gift_settings)
    except Exception:
        logger.exception("Failed to send admin email for %s", voucher.code)


# ── Main voucher creation ───────────────────────────────────────


def create_voucher(data: dict) -> GiftVoucher:
    service_id = data.pop("service_id", None)
    start_datetime = data.pop("start_datetime", None)
    end_datetime = data.pop("end_datetime", None)

    voucher = GiftVoucher.objects.create(**data)

    confirmation = ""
    if service_id and start_datetime and end_datetime:
        confirmation = _create_linked_booking(
            voucher=voucher,
            service_id=service_id,
            start_dt=start_datetime,
            end_dt=end_datetime,
        )

    voucher.booking_confirmation = confirmation
    voucher.save(update_fields=["booking_confirmation"])

    return voucher
