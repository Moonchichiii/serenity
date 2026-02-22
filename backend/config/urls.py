from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("api/", include("apps.core.urls")),

    # Wagtail
    path("cms-admin/", include("wagtail.admin.urls")),
    path("documents/", include("wagtail.documents.urls")),

    # Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),

    # SPA boot (CMS)
    path("api/", include("apps.cms.urls")),  # contains homepage/hydrated/

    # Domain APIs
    path("api/testimonials/", include("apps.testimonials.urls")),
    path("api/calendar/", include("apps.availability.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/vouchers/", include("apps.vouchers.urls")),

    path("admin/", admin.site.urls),
]

# Swagger UI only in DEBUG
if settings.DEBUG:
    urlpatterns += [
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
