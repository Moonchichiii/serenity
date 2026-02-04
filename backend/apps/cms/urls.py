from django.urls import path

from .views import globals_view, homepage_view, hydrated_homepage_view, services_view

urlpatterns = [
    path("homepage/", homepage_view, name="homepage"),
    path("homepage/hydrated/", hydrated_homepage_view, name="homepage-hydrated"),
    path("services/", services_view, name="services"),
    path("globals/", globals_view, name="cms-globals"),
]
