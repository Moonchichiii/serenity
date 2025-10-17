import json

from django.contrib.auth import authenticate, login, logout
from django.db import models
from django.http import HttpRequest, JsonResponse
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


@ensure_csrf_cookie
def csrf(request: HttpRequest):
    # Sets csrftoken cookie. No body needed.
    return JsonResponse({"detail": "ok"})


def me(request: HttpRequest):
    if request.user.is_authenticated:
        return JsonResponse(
            {
                "isAuthenticated": True,
                "username": request.user.get_username(),
                "isStaff": request.user.is_staff,
                "isSuperuser": request.user.is_superuser,
            }
        )
    return JsonResponse({"isAuthenticated": False})


@require_http_methods(["POST"])
@csrf_protect
def login_view(request: HttpRequest):
    try:
        data = json.loads(request.body.decode() or "{}")
    except Exception:
        data = {}
    username = data.get("username") or data.get("email")  # allow either field
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"detail": _("Missing credentials")}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        return JsonResponse({"detail": _("Invalid credentials")}, status=401)

    # Only allow CMS staff to use this entry point
    if not user.is_staff:
        return JsonResponse({"detail": _("Not allowed")}, status=403)

    login(request, user)
    return JsonResponse({"detail": "ok"})


@require_http_methods(["POST"])
def logout_view(request: HttpRequest):
    logout(request)
    return JsonResponse({"detail": "ok"})


@register_setting
class SerenitySettings(BaseSiteSetting):
    brand = models.CharField(max_length=100, default="Serenity")
    phone = models.CharField(max_length=64, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")

    hero_title = models.CharField(max_length=200, blank=True, default="")
    hero_subtitle = models.CharField(max_length=300, blank=True, default="")
    hero_image_url = models.URLField(
        blank=True, default=""
    )  # if you want to bypass Image chooser here

    about_intro = models.TextField(blank=True, default="")
    about_approach = models.TextField(blank=True, default="")

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("brand"),
                FieldPanel("phone"),
                FieldPanel("email"),
                FieldPanel("address"),
            ],
            heading="Site",
        ),
        MultiFieldPanel(
            [
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_image_url"),
            ],
            heading="Hero",
        ),
        MultiFieldPanel(
            [FieldPanel("about_intro"), FieldPanel("about_approach")], heading="About"
        ),
    ]
