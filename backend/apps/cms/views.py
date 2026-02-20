import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import (
    get_globals_payload,
    get_homepage_payload,
    get_hydrated_homepage_payload,
    get_services_payload,
    get_site_for_request,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def hydrated_homepage_view(request) -> Response:
    """
    THE MASTERPIECE ENDPOINT (no caching in this pass):
    Returns Homepage + Services + Globals + Testimonials in ONE request.
    """
    payload = get_hydrated_homepage_payload(request=request)
    if not payload:
        return Response({"error": "No HomePage found"}, status=404)
    return Response(payload)


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage_view(request) -> Response:
    """
    Legacy individual endpoint (no caching).
    """
    site = get_site_for_request(request)
    payload = get_homepage_payload(request=request, site=site)
    if not payload:
        return Response({"error": "No HomePage found"}, status=404)
    return Response(payload)


@api_view(["GET"])
@permission_classes([AllowAny])
def services_view(request) -> Response:
    """
    Legacy individual endpoint (no caching).
    """
    return Response(get_services_payload(request=request))


@api_view(["GET"])
@permission_classes([AllowAny])
def globals_view(request) -> Response:
    """
    Global site settings endpoint (no caching).
    """
    site = get_site_for_request(request)
    return Response(get_globals_payload(site=site))
