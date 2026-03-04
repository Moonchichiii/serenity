import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from apps.availability.calendar_gateway import create_booking_event
from apps.core.utils import safe_format
from apps.services.models import Service

from .models import GiftVoucher

logger = logging.getLogger(__name__)
TZ = ZoneInfo("Europe/Paris")


def _ensure_tz(dt):
    """
    Ensures a datetime object is timezone-aware (Paris).
    Handles None, strings, and existing datetime objects.
    """
    if dt is None:
        return None

    # FIX: If it is a string (coming from JSON), parse it first
    if isinstance(dt, str):
        try:
            # Handle potential trailing "Z" from JS dates or Stripe
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except ValueError:
            logger.error(f"Could not parse date string: {dt}")
            return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=TZ)
    return dt


def _resolve_gift_settings() -> dict:
    gift_settings = getattr(settings, "GIFT_VOUCHER_SETTINGS", {})
    return {
        "business_name": gift_settings.get("business_name", "Serenity Touch"),
        "business_email": gift_settings.get("business_email", ""),
        "business_phone": gift_settings.get("business_phone", ""),
        "business_address": gift_settings.get("business_address", ""),
        "site_url": gift_settings.get("site_url", ""),
    }


def _resolve_language(voucher: GiftVoucher) -> str:
    return voucher.preferred_language or "fr"


def _build_email_context(voucher: GiftVoucher, gift_settings: dict, lang: str) -> dict:
    return {"voucher": voucher, "lang": lang, **gift_settings}


def _send_recipient_email(voucher: GiftVoucher, context: dict, lang: str, gift_settings: dict) -> None:
    subject_template = (
        "Your gift voucher from {business_name}"
        if lang == "en"
        else "Votre bon cadeau de {business_name}"
    )
    subject = safe_format(subject_template, business_name=gift_settings["business_name"])
    html = render_to_string(f"vouchers/emails/voucher_recipient_{lang}.html", context)
    text = render_to_string(f"vouchers/emails/voucher_recipient_{lang}.txt", context)
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[voucher.recipient_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send()


def _send_admin_email(voucher: GiftVoucher, context: dict, gift_settings: dict) -> None:
    admin_email = gift_settings.get("business_email")
    if not admin_email:
        logger.warning("No admin email configured — skipping admin notification.")
        return
    subject = f"New voucher sold: {voucher.code}"
    html = render_to_string("vouchers/emails/voucher_admin_notification.html", context)
    text = render_to_string("vouchers/emails/voucher_admin_notification.txt", context)
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


def _create_calendar_event_for_voucher(voucher: GiftVoucher) -> None:
    """
    Creates a Google Calendar event (through availability gateway),
    and stores metadata on the voucher.
    """
    if not (voucher.service and voucher.start_datetime and voucher.end_datetime):
        return

    # Helper to avoid crash if service title isn't loaded or differs
    service_title = getattr(voucher.service, 'title_fr', 'Service')

    title = f"[Voucher] {voucher.recipient_name} - {service_title}"

    event = create_booking_event(
        title=title,
        start_datetime=voucher.start_datetime,
        end_datetime=voucher.end_datetime,
        client_email=voucher.recipient_email,
        client_name=voucher.recipient_name,
        description=f"Voucher code: {voucher.code}\nSender: {voucher.sender_name} <{voucher.sender_email}>",
    )

    if event and event.get("id"):
        voucher.calendar_event_id = event["id"] or ""
        voucher.calendar_event_link = event.get("link") or ""
        voucher.calendar_event_status = event.get("status") or ""
        voucher.save(update_fields=["calendar_event_id", "calendar_event_link", "calendar_event_status"])


def create_voucher(data: dict) -> GiftVoucher:
    service_id = data.pop("service_id", None)

    # We must pop these to process them safely with _ensure_tz
    raw_start = data.pop("start_datetime", None)
    raw_end = data.pop("end_datetime", None)

    start_datetime = _ensure_tz(raw_start)
    end_datetime = _ensure_tz(raw_end)

    service = None
    if service_id:
        service = Service.objects.filter(id=service_id, is_available=True).first()

    voucher = GiftVoucher.objects.create(
        **data,
        service=service,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
    )

    # Optional calendar sync
    try:
        _create_calendar_event_for_voucher(voucher)
    except Exception:
        logger.exception("Calendar sync failed for voucher %s", voucher.code)

    return voucher
