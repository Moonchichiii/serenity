from django.db.models import Avg, Count
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Testimonial


class TestimonialSubmissionThrottle(AnonRateThrottle):
    rate = "3/hour"


@api_view(["GET"])
def get_testimonials(request):
    """
    GET /api/testimonials/?min_rating=4
    Returns approved testimonials filtered by minimum rating.
    """
    min_rating = request.GET.get("min_rating")
    try:
        min_rating = int(min_rating) if min_rating else 0
    except ValueError:
        min_rating = 0

    testimonials = Testimonial.objects.filter(
        status="approved",
        rating__gte=min_rating,
    ).order_by("-created_at")[:20]

    data = [
        {
            "id": str(t.id),
            "name": t.name,
            "rating": t.rating,
            "text": t.text,
            "date": t.date_display,
            "avatar": t.avatar_url,
        }
        for t in testimonials
    ]

    return Response(data)


@api_view(["POST"])
@throttle_classes([TestimonialSubmissionThrottle])
def submit_testimonial(request):
    """
    POST /api/testimonials/submit/
    Submit new testimonial (requires moderation)
    """
    # Validate required fields
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    rating = request.data.get("rating")
    text = request.data.get("text", "").strip()

    # Validation
    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Le nom doit contenir au moins 2 caractères"
    if not text or len(text) < 10:
        errors["text"] = "Le commentaire doit contenir au moins 10 caractères"
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        errors["rating"] = "La note doit être entre 1 et 5"

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    # Get client IP
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    ip_address = (
        x_forwarded_for.split(",")[0]
        if x_forwarded_for
        else request.META.get("REMOTE_ADDR")
    )

    # Create testimonial (pending approval)
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


@api_view(["GET"])
def get_testimonial_stats(request):
    """
    GET /api/testimonials/stats/
    Returns aggregate statistics
    """
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
