from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # 1. Auth / Core
    path("api/", include("apps.core.urls")),

    # 2. Wagtail Admin
    path("cms-admin/", include("wagtail.admin.urls")),
    path("cms-admin/settings/", include("wagtail.contrib.settings.urls")),
    path("documents/", include("wagtail.documents.urls")),

    # 3. Documentation (Schema)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),

    # 4. Serenity Apps
    path("api/", include("apps.cms.urls")),
    path("api/", include("apps.testimonials.urls")),
    path("api/calendar/", include("apps.availability.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/vouchers/", include("apps.vouchers.urls")),

    # 5. Django Admin
    path("admin/", admin.site.urls),
]

# Swagger UI only in DEBUG
if settings.DEBUG:
    urlpatterns += [
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
