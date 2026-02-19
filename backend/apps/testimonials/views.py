from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Testimonial
from .selectors import get_approved_testimonials, get_testimonial_stats
from .serializers import (
    SubmitReplySerializer,
    SubmitTestimonialSerializer,
    TestimonialSerializer,
)
from .services import create_reply, create_testimonial


class TestimonialSubmissionThrottle(AnonRateThrottle):
    rate = "3/hour"


@api_view(["GET"])
def get_testimonials(request):
    """Return approved testimonials, optionally filtered by min_rating."""
    try:
        min_rating = int(request.GET.get("min_rating", 0))
    except (TypeError, ValueError):
        min_rating = 0

    testimonials = get_approved_testimonials(min_rating=min_rating)
    data = TestimonialSerializer(testimonials, many=True).data
    return Response(data)


@api_view(["POST"])
@throttle_classes([TestimonialSubmissionThrottle])
def submit_testimonial(request):
    """Submit a new testimonial for moderation."""
    serializer = SubmitTestimonialSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    testimonial = create_testimonial(
        request=request, data=serializer.validated_data
    )

    return Response(
        {
            "success": True,
            "message": "Merci ! Votre avis sera publié après validation.",
            "id": str(testimonial.id),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@throttle_classes([TestimonialSubmissionThrottle])
def submit_reply(request, testimonial_id):
    """Submit a reply to a testimonial for moderation."""
    try:
        parent = Testimonial.objects.get(id=testimonial_id)
    except Testimonial.DoesNotExist:
        return Response(
            {"error": "Témoignage introuvable"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = SubmitReplySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    create_reply(
        request=request,
        parent=parent,
        data=serializer.validated_data,
    )

    return Response(
        {
            "success": True,
            "message": "Réponse envoyée pour modération.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def testimonial_stats_view(request):
    """Return aggregate statistics for approved testimonials."""
    return Response(get_testimonial_stats())
