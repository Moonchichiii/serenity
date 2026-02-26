import itertools
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

from apps.services.models import Service
from apps.vouchers.models import GiftVoucher

TZ = ZoneInfo("Europe/Paris")
_service_counter = itertools.count(1)


@pytest.fixture()
def available_service(db):
    return Service.objects.create(
        title_en="Test Massage",
        title_fr="Massage Test",
        duration_minutes=60,
        price=80,
        is_available=True,
    )


@pytest.fixture()
def unavailable_service(db):
    return Service.objects.create(
        title_en="Unavailable Service",
        title_fr="Service Indisponible",
        duration_minutes=60,
        price=80,
        is_available=False,
    )


@pytest.fixture()
def service_factory(db):
    def _create(**overrides):
        n = next(_service_counter)
        defaults = {
            "title_en": f"Service {n}",
            "title_fr": f"Service {n}",
            "duration_minutes": 60,
            "price": 50 + n,
            "is_available": True,
        }
        defaults.update(overrides)
        return Service.objects.create(**defaults)

    return _create


@pytest.fixture()
def voucher_factory(db):
    def _create(**overrides):
        defaults = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": 100,
            "preferred_language": "fr",
        }
        defaults.update(overrides)
        return GiftVoucher.objects.create(**defaults)

    return _create


@pytest.fixture()
def _mock_voucher_emails():
    with patch("apps.vouchers.services.send_voucher_emails"):
        yield
