from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from apps.core.utils import safe_format

from .models import GiftVoucher

if TYPE_CHECKING:
    from django.http import HttpRequest

    from apps.cms.models import GiftSettings

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────


def create_voucher(
    *, data: dict[str, Any]
) -> tuple[GiftVoucher, str]:
    """
    Create a gift voucher.  If booking fields (service_id,
    start_datetime, end_datetime) are present, also create a
    calendar booking via the bookings app.

    Returns (voucher, booking_confirmation_code | '').
    """
    # Pop booking-only keys before passing to model constructor
    service_id = data.pop('service_id', None)
    start_dt = data.pop('start_datetime', None)
    end_dt = data.pop('end_datetime', None)

    voucher = GiftVoucher(**data)
    voucher.save()
    logger.info(
        'Gift voucher created: %s for %s',
        voucher.code,
        voucher.recipient_name,
    )

    booking_confirmation = ''

    if service_id and start_dt and end_dt:
        booking_confirmation = _create_linked_booking(
            voucher=voucher,
            service_id=service_id,
            start_dt=start_dt,
            end_dt=end_dt,
        )

    return voucher, booking_confirmation


def _create_linked_booking(
    *,
    voucher: GiftVoucher,
    service_id: int,
    start_dt: Any,
    end_dt: Any,
) -> str:
    """Delegate to the bookings service to create a voucher booking."""
    from apps.bookings.services import create_voucher_booking

    booking_data = {
        'service_id': service_id,
        'start_datetime': start_dt,
        'end_datetime': end_dt,
        'client_name': voucher.recipient_name,
        'client_email': voucher.recipient_email,
        'client_phone': '',  # not collected on gift form
        'client_notes': voucher.message or '',
        'preferred_language': 'fr',
        'voucher_code': voucher.code,
    }

    booking, error = create_voucher_booking(booking_data)

    if error:
        logger.warning(
            'Voucher %s created but booking failed: %s',
            voucher.code,
            error,
        )
        return ''

    logger.info(
        'Calendar booking %s created for voucher %s',
        booking.confirmation_code,
        voucher.code,
    )
    return booking.confirmation_code


# ──────────────────────────────────────────────
# Emails (unchanged below — kept for completeness)
# ──────────────────────────────────────────────


def send_voucher_emails(
    *, voucher: GiftVoucher, request: HttpRequest
) -> None:
    """
    Send recipient + admin notification emails for a purchased voucher.
    """
    gift_settings, site_name, image_url = _resolve_gift_settings(request)
    lang = _resolve_language(request)

    tokens = {
        'purchaser_name': voucher.purchaser_name,
        'recipient_name': voucher.recipient_name,
        'site_name': site_name,
        'code': voucher.code,
    }

    context = _build_email_context(
        voucher=voucher,
        gift_settings=gift_settings,
        site_name=site_name,
        image_url=image_url,
        lang=lang,
        tokens=tokens,
    )

    _send_recipient_email(voucher, gift_settings, lang, tokens, context)
    _send_admin_email(voucher, site_name, context)


# --- Private helpers (email) ---


def _resolve_gift_settings(
    request: HttpRequest,
) -> tuple[GiftSettings | None, str, str]:
    from wagtail.models import Site

    from apps.cms.models import GiftSettings

    site = Site.find_for_request(request)

    try:
        gift_settings = GiftSettings.for_site(site)
    except Exception:
        gift_settings = GiftSettings.objects.first()

    site_name = getattr(site, 'site_name', None) or 'Serenity'

    image_url = ''
    if gift_settings and gift_settings.voucher_image:
        try:
            image_url = gift_settings.voucher_image.file.url
        except Exception:
            image_url = ''

    return gift_settings, site_name, image_url


def _resolve_language(request: HttpRequest) -> str:
    lang = getattr(request, 'LANGUAGE_CODE', 'en')
    return lang if lang in ('en', 'fr') else 'en'


def _build_email_context(
    *,
    voucher: GiftVoucher,
    gift_settings: GiftSettings | None,
    site_name: str,
    image_url: str,
    lang: str,
    tokens: dict[str, str],
) -> dict[str, Any]:
    fields = ('email_heading', 'email_intro', 'email_redeem', 'email_closing')
    formatted = {}

    for field in fields:
        raw = ''
        if gift_settings:
            raw = getattr(gift_settings, f'{field}_{lang}', '') or ''
        formatted[field] = safe_format(raw, **tokens)

    return {
        'voucher': voucher,
        'settings': gift_settings,
        'image_url': image_url,
        'site_name': site_name,
        'lang': lang,
        **formatted,
    }


def _send_recipient_email(
    voucher: GiftVoucher,
    gift_settings: GiftSettings | None,
    lang: str,
    tokens: dict[str, str],
    context: dict[str, Any],
) -> None:
    raw_subject = ''
    if gift_settings:
        raw_subject = (
            getattr(gift_settings, f'email_subject_{lang}', '') or ''
        )
    subject = safe_format(raw_subject, **tokens) or 'Gift Voucher'

    html_content = render_to_string('vouchers/email_recipient.html', context)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(html_content),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[voucher.recipient_email],
    )
    msg.attach_alternative(html_content, 'text/html')
    msg.send()

    logger.info(
        'Voucher recipient email sent: %s → %s',
        voucher.code,
        voucher.recipient_email,
    )


def _send_admin_email(
    voucher: GiftVoucher, site_name: str, context: dict[str, Any]
) -> None:
    admin_email = settings.DEFAULT_FROM_EMAIL
    if settings.ADMINS:
        admin_email = settings.ADMINS[0][1]

    html_content = render_to_string('vouchers/email_admin.html', context)

    msg = EmailMultiAlternatives(
        subject=f'New Gift Voucher Sold: {voucher.code}',
        body=strip_tags(html_content),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[admin_email],
    )
    msg.attach_alternative(html_content, 'text/html')
    msg.send()

    logger.info('Voucher admin email sent: %s → %s', voucher.code, admin_email)
