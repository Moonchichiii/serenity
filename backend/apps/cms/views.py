from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import CmsHydrationError, get_hydrated_homepage_payload

# Make sure this serializer is imported.
# If it doesn't exist yet, you will need to define it or
# use inline_serializer for the annotation to work.
from .serializers import HydratedHomepageSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request

logger = logging.getLogger(__name__)


@extend_schema(
    operation_id="homepage_hydrated",
    tags=["cms"],
    responses={
        200: HydratedHomepageSerializer,
        404: OpenApiResponse(description="No live homepage found"),
        500: OpenApiResponse(description="CMS Hydration Error or Internal Server Error"),
    },
    summary="Full SPA hydration payload",
    description=(
        "Returns the homepage, all published services, global settings, "
        "and approved testimonials in a single response."
    ),
)
@api_view(["GET"])
@permission_classes([AllowAny])
def hydrated_homepage_view(request: Request) -> Response:
    try:
        return Response(get_hydrated_homepage_payload(request=request))
    except CmsHydrationError as exc:
        logger.error("Hydration pipeline failed: %s", exc)
        return Response(
            {"error": "CMS Hydration Error", "detail": str(exc)},
            status=500,
        )
    except Exception:
        logger.exception("Unexpected error during homepage hydration.")
        return Response({"error": "Internal Server Error"}, status=500)
