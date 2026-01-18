import logging

from django.core.cache import cache
from django.db.models import Prefetch
from django.views.decorators.cache import never_cache
from django.views.decorators.vary import vary_on_headers
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import GiftSettings, HeroSlide, HomePage, Specialty
from apps.services.models import Service

# Assuming these exist based on the suggestion context,
# you might need to adjust the import path if they are in a different app:
from apps.vouchers.serializers import VoucherSerializer
from apps.vouchers.utils import send_voucher_email

from .serializers import GiftSettingsSerializer, HomePageSerializer, ServiceSerializer

logger = logging.getLogger(__name__)

# Cache TTL settings
HOMEPAGE_CACHE_TTL = 60 * 60      # 1 hour
SERVICES_CACHE_TTL = 60 * 30      # 30 minutes


@api_view(["GET"])
@permission_classes([AllowAny])
@vary_on_headers("Accept-Language")
def homepage_view(request):
    """
    Get homepage content with all CMS-managed fields.
    Uses manual caching keyed by site and language.
    """
    site = Site.find_for_request(request)
    site_id = getattr(site, "id", 0)
    lang = getattr(request, "LANGUAGE_CODE", "en")
    cache_key = f"cms:homepage:{site_id}:{lang}"

    # Check cache first
    cached = cache.get(cache_key)
    if cached is not None:
        logger.debug("Homepage cache HIT: %s", cache_key)
        return Response(cached)

    logger.debug(
        "Homepage cache MISS: %s (site=%s, lang=%s)", cache_key, site, lang
    )

    # Find the appropriate HomePage for this site
    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        # Return 404 so frontend can handle "no content" state properly
        logger.warning("No HomePage found for site_id=%s lang=%s", site_id, lang)
        return Response({"error": "No HomePage found"}, status=404)

    # Optimized query with prefetched related data
    page = (
        page.__class__.objects.select_related("hero_image")
        .prefetch_related(
            Prefetch(
                "hero_slides",
                queryset=HeroSlide.objects.select_related("image").order_by(
                    "sort_order"
                ),
            ),
            Prefetch(
                "specialties",
                queryset=Specialty.objects.select_related("image").order_by(
                    "sort_order"
                ),
            ),
        )
        .get(pk=page.pk)
    )

    data = HomePageSerializer(page, context={"request": request}).data

    # Cache the data with site and language key
    cache.set(cache_key, data, HOMEPAGE_CACHE_TTL)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services_view(request):
    """
    Get all available services (bilingual support in serializer).
    Uses manual caching with model signals handling invalidation.
    """
    cache_key = "cms:services"
    data = cache.get(cache_key)

    # Check if data exists in cache
    if data is None:
        logger.debug("Services cache MISS: %s", cache_key)
        qs = Service.objects.filter(is_available=True).select_related("image")
        data = ServiceSerializer(qs, many=True, context={"request": request}).data
        cache.set(cache_key, data, SERVICES_CACHE_TTL)
    else:
        logger.debug("Services cache HIT: %s", cache_key)

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
@never_cache
def globals_view(request):
    """
    Get global site settings (Gift config, etc).
    """
    site = Site.find_for_request(request)
    gift_settings = GiftSettings.for_site(site)

    data = {
        "gift": GiftSettingsSerializer(gift_settings).data
    }
    return Response(data)


@api_view(["POST"])
@permission_classes([AllowAny])
def create_voucher(request):
    """
    Creates a voucher and sends the email with formatted dynamic text.
    """
    serializer = VoucherSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        voucher = serializer.save()

        # Get Site Settings
        site = Site.find_for_request(request)
        gift_settings = GiftSettings.for_site(site)
        lang_code = getattr(request, "LANGUAGE_CODE", "en")

        # Base Context
        context = {
            "voucher": voucher,
            "site_name": site.site_name or "The Massage Studio",
            "primary_color": "#D4AF37",  # Example default
        }

        # --- Dynamic Text Formatting ---

        # Define the formatting helper
        def fmt(s: str) -> str:
            # Safely format string with available variables
            return (s or "").format(
                purchaser_name=voucher.purchaser_name,
                recipient_name=voucher.recipient_name,
                site_name=context["site_name"],
                code=voucher.code,
            )

        # Apply formatting to email content fields based on language
        # We use getattr to dynamically grab 'email_heading_en' vs 'email_heading_fr'
        heading_raw = getattr(gift_settings, f"email_heading_{lang_code}", "")
        intro_raw = getattr(gift_settings, f"email_intro_{lang_code}", "")
        redeem_raw = getattr(gift_settings, f"email_redeem_{lang_code}", "")
        closing_raw = getattr(gift_settings, f"email_closing_{lang_code}", "")

        # Inject formatted strings into context
        context["email_heading"] = fmt(heading_raw)
        context["email_intro"] = fmt(intro_raw)
        context["email_redeem"] = fmt(redeem_raw)
        context["email_closing"] = fmt(closing_raw)

        # Pass CMS image if it exists
        if gift_settings.voucher_image:
            # Logic to get full URL depending on your setup
            # Ensure 'get_rendition' is valid for your Wagtail setup
            context["voucher_image_url"] = gift_settings.voucher_image.get_rendition("width-600").url

        # Send Email
        subject = getattr(gift_settings, f"email_subject_{lang_code}", "Gift Voucher")
        send_voucher_email(voucher, subject, context)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error creating voucher: {e}")
        return Response(
            {"error": "Could not create voucher."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
