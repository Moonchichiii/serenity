import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import TemplateDoesNotExist, render_to_string

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

    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except ValueError:
            logger.error("Could not parse date string: %s", dt)
            return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=TZ)
    return dt


def _resolve_gift_settings() -> dict:
    gift_settings = getattr(settings, "GIFT_VOUCHER_SETTINGS", {})
    return {
        "business_name": gift_settings.get(
            "business_name", "Serenity Touch"
        ),
        "business_email": gift_settings.get(
            "business_email", settings.EMAIL_HOST_USER
        ),
        "business_phone": gift_settings.get("business_phone", ""),
        "business_address": gift_settings.get("business_address", ""),
        "site_url": gift_settings.get("site_url", ""),
    }


def _resolve_language(voucher: GiftVoucher) -> str:
    return voucher.preferred_language or "fr"


def _build_email_context(
    voucher: GiftVoucher, gift_settings: dict, lang: str
) -> dict:
    return {"voucher": voucher, "lang": lang, **gift_settings}


def _send_recipient_email(
    voucher: GiftVoucher,
    context: dict,
    lang: str,
    gift_settings: dict,
) -> None:
    """Sends the gift card to the recipient."""
    subject_template = (
        "Your gift voucher from {business_name}"
        if lang == "en"
        else "Votre bon cadeau de {business_name}"
    )
    subject = safe_format(
        subject_template,
        business_name=gift_settings["business_name"],
    )

    html_template = f"vouchers/emails/voucher_recipient_{lang}.html"
    text_template = f"vouchers/emails/voucher_recipient_{lang}.txt"

    try:
        html = render_to_string(html_template, context)
        try:
            text = render_to_string(text_template, context)
        except TemplateDoesNotExist:
            text = (
                f"You have received a gift voucher: {voucher.code}\n"
                f"From: {voucher.sender_name}\n"
                f"Value: {voucher.amount} EUR"
            )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[voucher.recipient_email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send()
        logger.info(
            "Recipient email sent for voucher %s to %s",
            voucher.code,
            voucher.recipient_email,
        )
    except Exception as e:
        # --- FIX: Do NOT re-raise. Log and continue to admin email ---
        logger.error(
            "Error sending recipient email for %s: %s",
            voucher.code,
            e,
        )


def _send_admin_email(
    voucher: GiftVoucher, context: dict, gift_settings: dict
) -> None:
    """Notifies the admin of a new sale."""
    admin_email = (
        gift_settings.get("business_email") or settings.EMAIL_HOST_USER
    )
    if not admin_email:
        logger.warning(
            "No admin email configured — skipping admin notification."
        )
        return

    subject = f"New voucher sold: {voucher.code}"
    html_template = "vouchers/email_admin.html"

    try:
        html = render_to_string(html_template, context)
    except TemplateDoesNotExist:
        logger.error("Template not found: %s", html_template)
        html = (
            f"<html><body>"
            f"<h1>New Voucher: {voucher.code}</h1>"
            f"<p>Sold for {voucher.amount} EUR</p>"
            f"</body></html>"
        )

    text = (
        f"A new voucher has been purchased.\n\n"
        f"Code: {voucher.code}\n"
        f"Purchaser: {voucher.sender_name}\n"
        f"Recipient: {voucher.recipient_name}\n\n"
        f"Amount: {voucher.amount}\n"
        f"Check the admin panel for details."
    )

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send()
        logger.info(
            "Admin notification sent to %s for voucher %s",
            admin_email,
            voucher.code,
        )
    except Exception as e:
        logger.error("Error sending admin email: %s", e)


def send_voucher_emails(voucher: GiftVoucher) -> None:
    """Orchestrator for sending both emails."""
    gift_settings = _resolve_gift_settings()
    lang = _resolve_language(voucher)
    context = _build_email_context(voucher, gift_settings, lang)

    # Each email is independent — one failing must not block the other
    _send_recipient_email(voucher, context, lang, gift_settings)
    _send_admin_email(voucher, context, gift_settings)


def _create_calendar_event_for_voucher(
    voucher: GiftVoucher,
) -> None:
    """Creates a Google Calendar event. Safely handles bad emails."""
    if not (
        voucher.service
        and voucher.start_datetime
        and voucher.end_datetime
    ):
        return

    service_title = getattr(voucher.service, "title_fr", "Service")
    title = f"[Voucher] {voucher.recipient_name} - {service_title}"

    client_email = (
        voucher.recipient_email.strip()
        if voucher.recipient_email
        else ""
    )
    client_name = (
        voucher.recipient_name.strip()
        if voucher.recipient_name
        else ""
    )

    # --- FIX: Debug log so we can see exactly what's going to Google ---
    logger.info(
        "Calendar sync for %s — email=%r, name=%r",
        voucher.code,
        client_email,
        client_name,
    )

    event = create_booking_event(
        title=title,
        start_datetime=voucher.start_datetime,
        end_datetime=voucher.end_datetime,
        client_email=client_email,
        client_name=client_name,
        description=(
            f"Voucher code: {voucher.code}\n"
            f"Sender: {voucher.sender_name} <{voucher.sender_email}>"
        ),
    )

    if event and event.get("id"):
        voucher.calendar_event_id = event["id"] or ""
        voucher.calendar_event_link = event.get("link") or ""
        voucher.calendar_event_status = event.get("status") or ""
        voucher.save(
            update_fields=[
                "calendar_event_id",
                "calendar_event_link",
                "calendar_event_status",
            ]
        )
        logger.info("Calendar event created: %s", event.get("id"))
    else:
        logger.warning(
            "Calendar event returned None for voucher %s",
            voucher.code,
        )


def create_voucher(data: dict) -> GiftVoucher:
    service_id = data.pop("service_id", None)

    raw_start = data.pop("start_datetime", None)
    raw_end = data.pop("end_datetime", None)

    start_datetime = _ensure_tz(raw_start)
    end_datetime = _ensure_tz(raw_end)

    service = None
    if service_id:
        service = Service.objects.filter(
            id=service_id, is_available=True
        ).first()

    voucher = GiftVoucher.objects.create(
        **data,
        service=service,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
    )

    # --- FIX: Calendar sync must never kill the webhook ---
    if start_datetime and end_datetime:
        try:
            _create_calendar_event_for_voucher(voucher)
        except Exception as e:
            logger.error(
                "Calendar sync CRASHED for voucher %s: %s",
                voucher.code,
                e,
            )

    return voucher
