from __future__ import annotations

import pytest

from apps.vouchers.models import GiftVoucher


@pytest.fixture()
def voucher_factory(db):
    """Create and persist a GiftVoucher with sensible defaults."""
    _counter = 0

    def _create(**overrides):
        nonlocal _counter
        _counter += 1
        defaults = {
            "purchaser_name": f"Purchaser {_counter}",
            "purchaser_email": f"purchaser{_counter}@example.com",
            "recipient_name": f"Recipient {_counter}",
            "recipient_email": f"recipient{_counter}@example.com",
            "message": "",
        }
        defaults.update(overrides)
        return GiftVoucher.objects.create(**defaults)

    return _create


@pytest.fixture()
def available_service(db):
    """A bookable service for booking-linked voucher tests."""
    from apps.services.models import Service

    return Service.objects.create(
        title_en="Relaxation Massage",
        title_fr="Massage Relaxant",
        duration_minutes=60,
        price=80,
        is_available=True,
    )


@pytest.fixture()
def _mock_voucher_emails(monkeypatch):
    """Silence send_voucher_emails in view tests."""
    monkeypatch.setattr(
        "apps.vouchers.views.send_voucher_emails",
        lambda **kwargs: None,
    )
