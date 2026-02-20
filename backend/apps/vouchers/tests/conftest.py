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
