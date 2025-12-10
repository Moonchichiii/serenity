from django.urls import path

from .views import globals_view, homepage_view, services_view

urlpatterns = [
    path("homepage/", homepage_view, name="homepage"),
    path("services/", services_view, name="services"),
    path("globals/", globals_view, name="cms-globals"),
]
