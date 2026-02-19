import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.http import HttpRequest

from apps.core.utils import get_client_ip

from .models import ContactSubmission

logger = logging.getLogger(__name__)


def create_submission(
    *, request: HttpRequest, data: dict
) -> ContactSubmission:
    """
    Persist a contact submission and send an email notification.

    `data` must already be validated (via ContactSubmissionSerializer).
    """
    ip_address = get_client_ip(request)

    submission = ContactSubmission.objects.create(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone", ""),
        subject=data["subject"],
        message=data["message"],
        ip_address=ip_address,
    )

    _send_notification_email(submission, ip_address)

    logger.info(
        "Contact submission created: %s (%s)", submission.pk, ip_address
    )
    return submission


def _send_notification_email(
    submission: ContactSubmission, ip_address: str
) -> None:
    """Send admin notification email for a new contact submission."""
    body = (
        f"Nom: {submission.name}\n"
        f"Email: {submission.email}\n"
        f"Téléphone: {submission.phone}\n"
        f"Sujet: {submission.subject}\n\n"
        f"Message:\n{submission.message}\n\n"
        f"IP: {ip_address}\n"
    )

    EmailMessage(
        subject=f"[Serenity] Nouvelle demande: {submission.subject}",
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.EMAIL_HOST_USER],
        reply_to=[submission.email],
    ).send(fail_silently=False)
