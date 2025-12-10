from django.urls import path

from . import views

urlpatterns = [
    path("auth/csrf/", views.csrf, name="core_csrf"),
    path("auth/me/", views.me, name="core_me"),
    path("auth/login/", views.login_view, name="core_login"),
    path("auth/logout/", views.logout_view, name="core_logout"),
]
