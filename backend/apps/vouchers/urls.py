from django.urls import path

from .views import cancel_booking_view, create_voucher_view

urlpatterns = [
    path("create/", create_voucher_view, name="create_voucher"),
    path(
        "cancel/<str:confirmation_code>/",
        cancel_booking_view,
        name="cancel_booking",
    ),
]
