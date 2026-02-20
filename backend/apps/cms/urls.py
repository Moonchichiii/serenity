"""
Note: Granular endpoints (services, globals) are DEPRECATED.
All SPA initialization must use 'homepage/hydrated/'.
"""

from django.urls import path

from .views import (
    hydrated_homepage_view,
)

urlpatterns = [
    # Primary Enterprise Entry Point
    path(
        "homepage/hydrated/",
        hydrated_homepage_view,
        name="homepage-hydrated",
    ),
]
