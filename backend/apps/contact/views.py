from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .serializers import ContactSubmissionSerializer
from .services import create_submission


class ContactSubmissionThrottle(AnonRateThrottle):
    rate = "5/hour"


@api_view(["POST"])
@throttle_classes([ContactSubmissionThrottle])
def submit_contact(request):
    """POST /api/contact/submit/"""
    serializer = ContactSubmissionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    create_submission(request=request, data=serializer.validated_data)

    return Response(
        {
            "success": True,
            "message": (
                "Merci ! Nous vous répondrons dans les plus brefs délais."
            ),
        },
        status=status.HTTP_201_CREATED,
    )
