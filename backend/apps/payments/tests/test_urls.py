from django.urls import resolve, reverse

from apps.payments.views import create_checkout, get_payment_status
from apps.payments.webhooks import stripe_webhook


def test_checkout_url_resolves_to_create_checkout():
    path = reverse("payments_checkout")
    assert resolve(path).func == create_checkout


def test_status_url_resolves_to_get_payment_status():
    path = reverse("payments_status")
    assert resolve(path).func == get_payment_status


def test_webhook_url_resolves_to_stripe_webhook():
    path = reverse("payments_webhook")
    assert resolve(path).func == stripe_webhook
