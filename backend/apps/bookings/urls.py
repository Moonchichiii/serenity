from django.urls import path

from . import views

urlpatterns = [
    path("", views.bookings, name="bookings"),
    path("voucher/", views.voucher_bookings, name="voucher_bookings"),
    path(
        "cancel/<str:confirmation_code>/",
        views.cancel_booking_view,
        name="cancel_booking",
    ),
]
