"""
CMS URL Configuration for Serenity Backend.
"""

from django.urls import path

from .views import (
    hydrated_homepage_view,
)

urlpatterns = [
    path(
        "homepage/hydrated/",
        hydrated_homepage_view,
        name="homepage-hydrated",
    ),
]
