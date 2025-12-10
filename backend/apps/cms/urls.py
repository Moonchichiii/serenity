from django.urls import path

from .views import globals_view, homepage_view, services_view

urlpatterns = [
    path("homepage/", homepage_view, name="cms_homepage"),
    path("services/", services_view, name="cms_services"),
    path("globals/", globals_view, name="cms_globals"),
]
