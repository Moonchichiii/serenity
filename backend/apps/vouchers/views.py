from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import GiftSettings

from .serializers import GiftVoucherSerializer


def _safe_format(s: str, **kwargs) -> str:
    """Format CMS strings without crashing if braces are invalid."""
    if not s:
        return ""
    try:
        return s.format(**kwargs)
    except Exception:
        return s


@api_view(["POST"])
@permission_classes([AllowAny])
def create_voucher(request):
    """Creates a gift voucher and sends notification emails."""
    serializer = GiftVoucherSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    voucher = serializer.save()

    site = Site.find_for_request(request)
    try:
        gift_settings = GiftSettings.for_site(site)
    except Exception:
        gift_settings = GiftSettings.objects.first()

    lang = getattr(request, "LANGUAGE_CODE", "en")
    if lang not in ("en", "fr"):
        lang = "en"

    site_name = getattr(site, "site_name", None) or "Serenity"

    image_url = ""
    if gift_settings and gift_settings.voucher_image:
        try:
            image_url = gift_settings.voucher_image.file.url
        except Exception:
            image_url = ""

    tokens = {
        "purchaser_name": voucher.purchaser_name,
        "recipient_name": voucher.recipient_name,
        "site_name": site_name,
        "code": voucher.code,
    }

    raw_subject = getattr(gift_settings, f"email_subject_{lang}", "") if gift_settings else ""
    subject = raw_subject or "Gift Voucher"

    raw_heading = getattr(gift_settings, f"email_heading_{lang}", "") if gift_settings else ""
    email_heading = _safe_format(raw_heading, **tokens)

    raw_intro = getattr(gift_settings, f"email_intro_{lang}", "") if gift_settings else ""
    email_intro = _safe_format(raw_intro, **tokens)

    raw_redeem = getattr(gift_settings, f"email_redeem_{lang}", "") if gift_settings else ""
    email_redeem = _safe_format(raw_redeem, **tokens)

    raw_closing = getattr(gift_settings, f"email_closing_{lang}", "") if gift_settings else ""
    email_closing = _safe_format(raw_closing, **tokens)

    context = {
        "voucher": voucher,
        "settings": gift_settings,
        "image_url": image_url,
        "site_name": site_name,
        "lang": lang,
        "email_heading": email_heading,
        "email_intro": email_intro,
        "email_redeem": email_redeem,
        "email_closing": email_closing,
    }

    html_content = render_to_string("vouchers/email_recipient.html", context)
    text_content = strip_tags(html_content)

    msg_recipient = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[voucher.recipient_email],
    )
    msg_recipient.attach_alternative(html_content, "text/html")
    msg_recipient.send()

    html_admin = render_to_string("vouchers/email_admin.html", context)
    text_admin = strip_tags(html_admin)

    admin_email = "salon@example.com"
    if settings.ADMINS:
        admin_email = settings.ADMINS[0][1]

    msg_admin = EmailMultiAlternatives(
        subject=f"New Gift Voucher Sold: {voucher.code}",
        body=text_admin,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[admin_email],
    )
    msg_admin.attach_alternative(html_admin, "text/html")
    msg_admin.send()

    return Response({"code": voucher.code}, status=status.HTTP_201_CREATED)
