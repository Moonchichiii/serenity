from django.urls import path

from .views import homepage_view, services_view

urlpatterns = [
    path("homepage/", homepage_view, name="api_homepage"),
    path("services/", services_view, name="api_services"),
]
