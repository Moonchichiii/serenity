from django.urls import path

from .views import create_checkout, get_payment_status
from .webhooks import stripe_webhook

urlpatterns = [
    path("checkout/", create_checkout, name="payments_checkout"),
    path("status/", get_payment_status, name="payments_status"),
    path("webhook/", stripe_webhook, name="payments_webhook"),
]
