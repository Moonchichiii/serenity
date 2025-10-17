import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit

logger = logging.getLogger(__name__)

__all__ = ["csrf", "me", "login_view", "logout_view"]


@ensure_csrf_cookie
def csrf(request: HttpRequest):
    """Sets CSRF cookie."""
    return JsonResponse({"detail": "ok"})


def me(request: HttpRequest):
    """Current user info."""
    if request.user.is_authenticated:
        return JsonResponse(
            {
                "isAuthenticated": True,
                "username": request.user.get_username(),
                "email": getattr(request.user, "email", ""),
                "isStaff": request.user.is_staff,
                "isSuperuser": request.user.is_superuser,
            }
        )
    return JsonResponse({"isAuthenticated": False})


@require_http_methods(["POST"])
@csrf_protect
@ratelimit(key="ip", rate="5/m", method="POST", block=True)
def login_view(request: HttpRequest):
    """Staff-only login. Rate limited to 5/min per IP."""
    try:
        data = json.loads(request.body.decode() or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    username = data.get("username") or data.get("email")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"detail": _("Missing credentials")}, status=400)

    user = authenticate(request, username=username, password=password)

    if not user:
        logger.warning(f"Failed login: {username}")
        return JsonResponse({"detail": _("Invalid credentials")}, status=401)

    if not user.is_staff:
        logger.warning(f"Non-staff login attempt: {username}")
        return JsonResponse({"detail": _("Not allowed")}, status=403)

    login(request, user)
    logger.info(f"Login successful: {username}")

    return JsonResponse({"detail": "ok"})


@require_http_methods(["POST"])
@csrf_protect
def logout_view(request: HttpRequest):
    """Logout."""
    if request.user.is_authenticated:
        logger.info(f"Logout: {request.user.get_username()}")
    logout(request)
    return JsonResponse({"detail": "ok"})
