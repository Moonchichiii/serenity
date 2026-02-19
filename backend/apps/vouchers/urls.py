from django.urls import path

from .views import create_voucher_view

urlpatterns = [
    path("create/", create_voucher_view, name="create_voucher"),
]
