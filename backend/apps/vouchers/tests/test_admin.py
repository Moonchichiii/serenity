from __future__ import annotations

import pytest
from django.contrib import admin

from apps.vouchers.models import GiftVoucher

pytestmark = pytest.mark.django_db


class TestVoucherAdmin:
    def test_gift_voucher_admin_registered(self):
        assert GiftVoucher in admin.site._registry
