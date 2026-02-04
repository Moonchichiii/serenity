import logging

from django.core.cache import cache
from django.db.models import Prefetch
from django.views.decorators.vary import vary_on_headers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.pages import HeroSlide, HomePage, Specialty
from apps.cms.settings import GiftSettings
from apps.services.models import Service
from apps.testimonials.models import Testimonial, TestimonialReply

from .serializers import (
    GiftSettingsSerializer,
    HomePageSerializer,
    ServiceSerializer,
    TestimonialSerializer,
)

logger = logging.getLogger(__name__)

HOMEPAGE_CACHE_TTL = 60 * 60
SERVICES_CACHE_TTL = 60 * 30
GLOBALS_CACHE_TTL = 60 * 60 * 24
# Safe TTL for hydrated bundle (min of components)
HYDRATED_CACHE_TTL = 60 * 30

# --- HELPER FUNCTIONS ---

def _get_homepage_data(request, site, lang):
    """Internal helper to get homepage data dictionary."""
    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        return None

    page = (
        page.__class__.objects.select_related("hero_image")
        .prefetch_related(
            Prefetch(
                "hero_slides",
                queryset=HeroSlide.objects.select_related("image").order_by("sort_order"),
            ),
            Prefetch(
                "specialties",
                queryset=Specialty.objects.select_related("image").order_by("sort_order"),
            ),
        )
        .get(pk=page.pk)
    )
    return HomePageSerializer(page, context={"request": request}).data

def _get_services_data(request):
    """Internal helper to get services list."""
    qs = Service.objects.filter(is_available=True).select_related("image")
    return ServiceSerializer(qs, many=True, context={"request": request}).data

def _get_globals_data(request, site):
    """Internal helper to get globals."""
    gift_settings = GiftSettings.for_site(site)
    return {"gift": GiftSettingsSerializer(gift_settings).data}

def _get_testimonials_data():
    """Internal helper to get top testimonials."""
    # FIX: Use correct model fields (status='approved') and prefetch replies
    testimonials = Testimonial.objects.filter(
        status="approved",
        rating__gte=4,
    ).prefetch_related(
        Prefetch('replies', queryset=TestimonialReply.objects.filter(status='approved'))
    ).order_by("-created_at")[:8]

    return TestimonialSerializer(testimonials, many=True).data

# --- API VIEWS ---

@api_view(["GET"])
@permission_classes([AllowAny])
# No Vary on Language because we return universal payload (contains keys for both langs)
def hydrated_homepage_view(request):
    """
    THE MASTERPIECE ENDPOINT:
    Returns Homepage + Services + Globals + Testimonials in ONE request.
    """
    site = Site.find_for_request(request)
    site_id = getattr(site, "id", 0)
    lang = getattr(request, "LANGUAGE_CODE", "en")

    # Cache key ignores lang because payload has both en/fr fields
    cache_key = f"cms:hydrated:{site_id}:all"
    cached = cache.get(cache_key)

    if cached is not None:
        logger.debug("Hydrated cache HIT: %s", cache_key)
        return Response(cached)

    logger.debug("Hydrated cache MISS: %s", cache_key)

    homepage_data = _get_homepage_data(request, site, lang)
    if not homepage_data:
         return Response({"error": "No HomePage found"}, status=404)

    payload = {
        "page": homepage_data,
        "services": _get_services_data(request),
        "globals": _get_globals_data(request, site),
        "testimonials": _get_testimonials_data(),
    }

    cache.set(cache_key, payload, HYDRATED_CACHE_TTL)
    return Response(payload)


@api_view(["GET"])
@permission_classes([AllowAny])
@vary_on_headers("Accept-Language")
def homepage_view(request):
    """Legacy individual endpoint."""
    site = Site.find_for_request(request)
    site_id = getattr(site, "id", 0)
    lang = getattr(request, "LANGUAGE_CODE", "en")
    cache_key = f"cms:homepage:{site_id}:{lang}"

    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    data = _get_homepage_data(request, site, lang)
    if not data:
        return Response({"error": "No HomePage found"}, status=404)

    cache.set(cache_key, data, HOMEPAGE_CACHE_TTL)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services_view(request):
    """Legacy individual endpoint."""
    cache_key = "cms:services"
    data = cache.get(cache_key)

    if data is None:
        data = _get_services_data(request)
        cache.set(cache_key, data, SERVICES_CACHE_TTL)

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def globals_view(request):
    """Get global site settings (Cached)."""
    site = Site.find_for_request(request)
    site_id = getattr(site, "id", 0)
    cache_key = f"cms:globals:{site_id}"

    data = cache.get(cache_key)
    if data is None:
        data = _get_globals_data(request, site)
        cache.set(cache_key, data, GLOBALS_CACHE_TTL)

    return Response(data)
