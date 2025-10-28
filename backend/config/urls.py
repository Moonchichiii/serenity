from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.core import api as core_api

urlpatterns = [
    # Auth API
    path("api/auth/csrf/", core_api.csrf),
    path("api/auth/me/", core_api.me),
    path("api/auth/login/", core_api.login_view),
    path("api/auth/logout/", core_api.logout_view),
    # Wagtail admin
    path("cms-admin/", include("wagtail.admin.urls")),
    path("cms-admin/settings/", include("wagtail.contrib.settings.urls")),
    path("documents/", include("wagtail.documents.urls")),
    # DRF schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    # Serenity API
    path("api/", include("apps.cms.api")),
    path("api/", include("apps.testimonials.urls")),
    path("api/calendar/", include("apps.availability.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/contact/", include("apps.contact.urls")),
    # Django admin
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
