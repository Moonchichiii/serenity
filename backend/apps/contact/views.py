from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import ContactSubmission


class ContactSubmissionThrottle(AnonRateThrottle):
    rate = "5/hour"


@api_view(["POST"])
@throttle_classes([ContactSubmissionThrottle])
def submit_contact(request):
    """
    POST /api/contact/submit/
    Submit contact form
    """
    # Validate required fields
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    phone = request.data.get("phone", "").strip()
    subject = request.data.get("subject", "").strip()
    message = request.data.get("message", "").strip()

    # Validation
    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Le nom doit contenir au moins 2 caractères"
    if not email:
        errors["email"] = "L'email est requis"
    if not subject:
        errors["subject"] = "Le sujet est requis"
    if not message or len(message) < 10:
        errors["message"] = "Le message doit contenir au moins 10 caractères"

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    # Get client IP
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    ip_address = (
        x_forwarded_for.split(",")[0]
        if x_forwarded_for
        else request.META.get("REMOTE_ADDR")
    )

    # Create contact submission
    ContactSubmission.objects.create(
        name=name,
        email=email,
        phone=phone,
        subject=subject,
        message=message,
        ip_address=ip_address,
    )

    return Response(
        {
            "success": True,
            "message": "Merci ! Nous vous répondrons dans les plus brefs délais.",
        },
        status=status.HTTP_201_CREATED,
    )
