import json
import logging

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

if getattr(settings, "RATELIMIT_ENABLE", True):
    from django_ratelimit.decorators import ratelimit
else:

    def ratelimit(*args, **kwargs):
        """No-op ratelimit decorator supporting both direct and parameterized usage."""
        if args and len(args) == 1 and callable(args[0]) and not kwargs:
            return args[0]

        def _decorator(func):
            return func

        return _decorator


logger = logging.getLogger(__name__)

__all__ = ["csrf", "me", "login_view", "logout_view", "test_cache"]


@ensure_csrf_cookie
def csrf(request: HttpRequest):
    """Sets CSRF cookie and returns the token for SPA authentication."""
    token = get_token(request)
    return JsonResponse({"detail": "ok", "csrfToken": token})


def me(request: HttpRequest):
    """Returns current user authentication status and information."""
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
    """Authenticates staff users with rate limiting (5 attempts per minute)."""
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
        logger.warning(f"Failed login attempt: {username}")
        return JsonResponse({"detail": _("Invalid credentials")}, status=401)

    if not user.is_staff:
        logger.warning(f"Non-staff login attempt: {username}")
        return JsonResponse({"detail": _("Not allowed")}, status=403)

    login(request, user)
    logger.info(f"Successful login: {username}")

    return JsonResponse({"detail": "ok"})


@require_http_methods(["POST"])
@csrf_protect
def logout_view(request: HttpRequest):
    """Logs out the current user."""
    if request.user.is_authenticated:
        logger.info(f"User logged out: {request.user.get_username()}")
    logout(request)
    return JsonResponse({"detail": "ok"})


def test_cache(request: HttpRequest):
    """Tests Redis cache connectivity and functionality."""
    cache.set("test_key", "Hello Redis!", 60)
    value = cache.get("test_key")

    return JsonResponse(
        {
            "cache_backend": str(cache.__class__),
            "test_value": value,
            "status": "✅ Redis working!" if value else "❌ Redis not working",
        }
    )
