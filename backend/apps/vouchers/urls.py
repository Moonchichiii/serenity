from django.urls import path

from .views import create_voucher

urlpatterns = [
    path("create/", create_voucher, name="create_voucher"),
]
