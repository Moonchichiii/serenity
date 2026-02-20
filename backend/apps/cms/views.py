"""
apps.cms.views
~~~~~~~~~~~~~~
Paper-thin API views. Business logic is delegated to selectors.
Fail-fast patterns ensure deterministic responses.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import (
    CmsHydrationError,
    get_globals_payload,
    get_homepage_payload,
    get_hydrated_homepage_payload,
    get_services_payload,
    get_site_for_request,
)

if TYPE_CHECKING:
    from rest_framework.request import Request

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────
# Master hydrated endpoint
# ──────────────────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([AllowAny])
def hydrated_homepage_view(request: Request) -> Response:
    """
    Gold-standard hydrated endpoint.
    Guarantees a complete payload or a hard error.
    """
    try:
        payload = get_hydrated_homepage_payload(request=request)
        return Response(payload)
    except CmsHydrationError as exc:
        # This is a 'loud' failure. Something in the orchestration
        # (Services, Testimonials, CMS) is broken or missing.
        logger.error(f"Hydration pipeline failed: {exc!s}")
        return Response(
            {"error": "CMS Hydration Error", "detail": str(exc)},
            status=500
        )
    except Exception:
        # Catch-all for unexpected infrastructure issues
        logger.exception("Unexpected error during homepage hydration.")
        return Response(
            {"error": "Internal Server Error"},
            status=500
        )


# ──────────────────────────────────────────────────────────────────────
# Individual endpoints (Legacy / Granular)
# ──────────────────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage_view(request: Request) -> Response:
    """
    Granular access to HomePage data.
    Still maintains the 404 check for the primary node.
    """
    site = get_site_for_request(request)
    payload = get_homepage_payload(request=request, site=site)

    if not payload:
        return Response({"error": "No HomePage found"}, status=404)

    return Response(payload)


@api_view(["GET"])
@permission_classes([AllowAny])
def services_view(request: Request) -> Response:
    """
    Standalone services endpoint.
    Note: If you want this to also fail-fast,
    wrap it in a try/except similar to the master view.
    """
    return Response(get_services_payload(request=request))


@api_view(["GET"])
@permission_classes([AllowAny])
def globals_view(request: Request) -> Response:
    """Global site settings (gift voucher config, etc.)."""
    site = get_site_for_request(request)
    return Response(get_globals_payload(site=site))
