from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from django.utils import timezone

from apps.vouchers.admin import GiftVoucherAdmin
from apps.vouchers.models import GiftVoucher

pytestmark = pytest.mark.django_db


class TestMarkAsRedeemed:
    def test_bulk_marks_vouchers_redeemed(self, voucher_factory):
        v1 = voucher_factory()
        v2 = voucher_factory()
        assert not v1.is_redeemed
        assert not v2.is_redeemed

        qs = GiftVoucher.objects.filter(pk__in=[v1.pk, v2.pk])
        admin = GiftVoucherAdmin(GiftVoucher, None)
        admin.mark_as_redeemed(request=MagicMock(), queryset=qs)

        v1.refresh_from_db()
        v2.refresh_from_db()
        assert v1.is_redeemed is True
        assert v1.redeemed_at is not None
        assert v2.is_redeemed is True


class TestSaveModelToggle:
    def _make_form(self, changed: list[str]) -> MagicMock:
        form = MagicMock()
        form.changed_data = changed
        return form

    def test_toggling_redeemed_on_sets_timestamp(self, voucher_factory):
        voucher = voucher_factory()
        assert voucher.redeemed_at is None

        voucher.is_redeemed = True
        form = self._make_form(["is_redeemed"])

        admin = GiftVoucherAdmin(GiftVoucher, None)
        admin.save_model(
            request=MagicMock(), obj=voucher, form=form, change=True
        )

        voucher.refresh_from_db()
        assert voucher.is_redeemed is True
        assert voucher.redeemed_at is not None

    def test_toggling_redeemed_off_clears_timestamp(self, voucher_factory):
        voucher = voucher_factory()
        voucher.is_redeemed = True
        voucher.redeemed_at = timezone.now()
        voucher.save()

        voucher.is_redeemed = False
        form = self._make_form(["is_redeemed"])

        admin = GiftVoucherAdmin(GiftVoucher, None)
        admin.save_model(
            request=MagicMock(), obj=voucher, form=form, change=True
        )

        voucher.refresh_from_db()
        assert voucher.is_redeemed is False
        assert voucher.redeemed_at is None

    def test_save_without_redeemed_change_leaves_timestamp(
        self, voucher_factory
    ):
        voucher = voucher_factory()
        voucher.is_redeemed = True
        voucher.redeemed_at = timezone.now()
        voucher.save()
        original_ts = voucher.redeemed_at

        form = self._make_form(["message"])

        admin = GiftVoucherAdmin(GiftVoucher, None)
        admin.save_model(
            request=MagicMock(), obj=voucher, form=form, change=True
        )

        voucher.refresh_from_db()
        assert voucher.redeemed_at == original_ts
