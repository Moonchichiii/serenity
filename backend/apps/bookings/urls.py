from django.urls import path

from . import views

urlpatterns = [
    path("", views.bookings, name="bookings"),
    path(
        "cancel/<str:confirmation_code>/", views.cancel_booking, name="cancel_booking"
    ),
]
