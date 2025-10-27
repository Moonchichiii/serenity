from django.db.models import Avg
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial

from .serializers import (
    HomePageSerializer,
    ServiceSerializer,
    TestimonialSerializer,
    TestimonialStatsSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage(request):
    """
    Get homepage content with all CMS-managed fields.
    Returns bilingual content (EN/FR) for all text fields.
    """
    site = Site.find_for_request(request)

    # Check if root page itself is HomePage
    if isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        # Otherwise look for HomePage as descendant
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        return Response({}, status=200)

    # Pass request context for device detection and language
    data = HomePageSerializer(page, context={"request": request}).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services(request):
    """
    Get all available services.
    Returns bilingual service information.
    """
    qs = Service.objects.filter(is_available=True)
    # Pass request context for image URL resolution
    return Response(ServiceSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def testimonials(request):
    """
    Get testimonials with optional filtering.

    Query params:
    - featured: Filter by featured testimonials (1/true/True)
    - lang: Language preference for text (en/fr)
    """
    featured = request.GET.get("featured")
    qs = Testimonial.objects.all().order_by("-created_at")

    if featured in ("1", "true", "True"):
        qs = qs.filter(featured=True)

    # Pass request context for language-aware text selection
    return Response(
        TestimonialSerializer(qs, many=True, context={"request": request}).data
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def testimonial_stats(request):
    """
    Get aggregated testimonial statistics.
    Returns rating averages and distribution counts.
    """
    testimonials = Testimonial.objects.all()

    if not testimonials.exists():
        return Response(
            {
                "average_rating": 0,
                "total_reviews": 0,
                "five_star_count": 0,
                "four_star_count": 0,
                "three_star_count": 0,
                "two_star_count": 0,
                "one_star_count": 0,
            }
        )

    # Calculate statistics
    stats = {
        "average_rating": testimonials.aggregate(avg=Avg("rating"))["avg"] or 0,
        "total_reviews": testimonials.count(),
        "five_star_count": testimonials.filter(rating=5).count(),
        "four_star_count": testimonials.filter(rating=4).count(),
        "three_star_count": testimonials.filter(rating=3).count(),
        "two_star_count": testimonials.filter(rating=2).count(),
        "one_star_count": testimonials.filter(rating=1).count(),
    }

    return Response(TestimonialStatsSerializer(stats).data)


urlpatterns = [
    path("homepage/", homepage, name="api_homepage"),
    path("services/", services, name="api_services"),
    path("testimonials/", testimonials, name="api_testimonials"),
    path("testimonials/stats/", testimonial_stats, name="api_testimonial_stats"),
]
