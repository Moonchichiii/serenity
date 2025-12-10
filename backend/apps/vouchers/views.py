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


@api_view(['POST'])
@permission_classes([AllowAny])
def create_voucher(request):
    """
    Creates a gift voucher and sends notification emails.
    """
    serializer = GiftVoucherSerializer(data=request.data)
    if serializer.is_valid():
        voucher = serializer.save()

        try:
            site = Site.find_for_request(request)
            gift_settings = GiftSettings.for_site(site)
        except Exception:
            gift_settings = GiftSettings.objects.first()

        image_url = ""
        if gift_settings and gift_settings.voucher_image:
            image_url = gift_settings.voucher_image.file.url

        context = {
            "voucher": voucher,
            "settings": gift_settings,
            "image_url": image_url,
            "site_name": getattr(site, "site_name", "Serenity"),
        }

        subject = f"{gift_settings.email_subject_en} / {gift_settings.email_subject_fr}"

        html_content = render_to_string("vouchers/email_recipient.html", context)
        text_content = strip_tags(html_content)

        msg_recipient = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[voucher.recipient_email]
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
            to=[admin_email]
        )
        msg_admin.attach_alternative(html_admin, "text/html")
        msg_admin.send()

        return Response({"code": voucher.code}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
