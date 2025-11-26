from django.core.cache import cache
from django.db.models import Avg, Count
from django.views.decorators.cache import cache_page
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from apps.cms.serializers import TestimonialSerializer

from .models import Testimonial, TestimonialReply


class TestimonialSubmissionThrottle(AnonRateThrottle):
    rate = "3/hour"


@api_view(["GET"])
@cache_page(60 * 15)
def get_testimonials(request):
    """Return approved testimonials filtered by optional min_rating."""
    min_rating = request.GET.get("min_rating")
    try:
        min_rating = int(min_rating) if min_rating else 0
    except ValueError:
        min_rating = 0

    cache_key = f"testimonials:list:{min_rating}"
    data = cache.get(cache_key)

    if not data:
        testimonials = Testimonial.objects.filter(
            status="approved",
            rating__gte=min_rating,
        ).order_by("-created_at")[:20]

        serializer = TestimonialSerializer(testimonials, many=True)
        data = serializer.data
        cache.set(cache_key, data, 60 * 15)

    return Response(data)


@api_view(["POST"])
@throttle_classes([TestimonialSubmissionThrottle])
def submit_testimonial(request):
    """Submit a new testimonial for moderation."""
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    rating = request.data.get("rating")
    text = request.data.get("text", "").strip()

    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Le nom doit contenir au moins 2 caractères"
    if not text or len(text) < 10:
        errors["text"] = "Le commentaire doit contenir au moins 10 caractères"
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        errors["rating"] = "La note doit être entre 1 et 5"

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    ip_address = (
        x_forwarded_for.split(",")[0]
        if x_forwarded_for
        else request.META.get("REMOTE_ADDR")
    )

    testimonial = Testimonial.objects.create(
        name=name,
        email=email,
        rating=rating,
        text=text,
        status="pending",
        ip_address=ip_address,
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

    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    text = request.data.get("text", "").strip()

    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Le nom est requis"
    if not email:
        errors["email"] = "L'email est requis"
    if not text or len(text) < 2:
        errors["text"] = "Le message est requis"

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    ip_address = (
        x_forwarded_for.split(",")[0]
        if x_forwarded_for
        else request.META.get("REMOTE_ADDR")
    )

    TestimonialReply.objects.create(
        parent=parent,
        name=name,
        email=email,
        text=text,
        status="pending",
        ip_address=ip_address,
    )

    return Response(
        {
            "success": True,
            "message": "Réponse envoyée pour modération.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def get_testimonial_stats(request):
    """Return aggregate statistics for approved testimonials."""
    approved = Testimonial.objects.filter(status="approved")

    stats = approved.aggregate(average=Avg("rating"), total=Count("id"))

    return Response(
        {
            "average_rating": round(stats["average"] or 0, 1),
            "total_reviews": stats["total"],
            "five_star_count": approved.filter(rating=5).count(),
            "four_star_count": approved.filter(rating=4).count(),
        }
    )
