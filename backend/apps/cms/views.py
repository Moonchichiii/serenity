from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import CmsHydrationError, get_hydrated_homepage_payload

if TYPE_CHECKING:
    from rest_framework.request import Request

logger = logging.getLogger(__name__)


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
