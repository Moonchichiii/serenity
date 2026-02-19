import json
import logging

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

if getattr(settings, "RATELIMIT_ENABLE", True):
    from django_ratelimit.decorators import ratelimit
else:

    def ratelimit(*args, **kwargs):
        """No-op decorator supporting both @ratelimit and @ratelimit(...)."""
        if args and len(args) == 1 and callable(args[0]) and not kwargs:
            return args[0]

        def _decorator(func):
            return func

        return _decorator


logger = logging.getLogger(__name__)

__all__ = ["csrf", "me", "login_view", "logout_view"]


@ensure_csrf_cookie
def csrf(request: HttpRequest) -> JsonResponse:
    """Set the CSRF cookie and return the token for SPA auth."""
    return JsonResponse({"detail": "ok", "csrfToken": get_token(request)})


def me(request: HttpRequest) -> JsonResponse:
    """Return current user authentication status and info."""
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
def login_view(request: HttpRequest) -> JsonResponse:
    """Authenticate staff users. Rate-limited to 5 attempts/min per IP."""
    try:
        data = json.loads(request.body.decode() or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    username = data.get("username") or data.get("email")
    password = data.get("password")

    if not username or not password:
        return JsonResponse(
            {"detail": _("Missing credentials")}, status=400
        )

    user = authenticate(request, username=username, password=password)

    if not user:
        logger.warning("Failed login attempt for: %s", username)
        return JsonResponse(
            {"detail": _("Invalid credentials")}, status=401
        )

    if not user.is_staff:
        logger.warning("Non-staff login attempt for: %s", username)
        return JsonResponse({"detail": _("Not allowed")}, status=403)

    login(request, user)
    logger.info("Successful login: %s", username)

    return JsonResponse({"detail": "ok"})


@require_http_methods(["POST"])
@csrf_protect
def logout_view(request: HttpRequest) -> JsonResponse:
    """Log out the current user."""
    if request.user.is_authenticated:
        logger.info("User logged out: %s", request.user.get_username())

    logout(request)
    return JsonResponse({"detail": "ok"})
