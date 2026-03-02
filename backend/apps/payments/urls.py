from django.urls import path

from .views import create_checkout
from .webhooks import stripe_webhook

urlpatterns = [
    path("checkout/", create_checkout, name="payments_checkout"),
    path("webhook/", stripe_webhook, name="payments_webhook"),
]
