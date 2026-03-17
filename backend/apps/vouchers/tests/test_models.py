from datetime import timedelta

import pytest
from django.utils import timezone

from apps.vouchers.models import GiftVoucher


@pytest.mark.django_db
class TestGiftVoucherModel:
    def test_voucher_code_generated_on_save(self, voucher_factory):
        voucher = voucher_factory(code="")
        assert voucher.code
        assert len(voucher.code) == 10

    def test_str(self, voucher_factory):
        voucher = voucher_factory(recipient_name="Alice")
        assert "Alice" in str(voucher)

    def test_preserves_existing_code(self, voucher_factory):
        voucher = voucher_factory(code="CUSTOM12345")
        assert voucher.code == "CUSTOM12345"

    def test_default_fields(self, voucher_factory):
        voucher = voucher_factory()
        assert voucher.message == ""
        assert voucher.preferred_language == "fr"
        assert voucher.is_redeemed is False
        assert voucher.calendar_event_id == ""
        assert voucher.calendar_event_link == ""
        assert voucher.calendar_event_status == ""

    def test_optional_fields_default_to_none(self, voucher_factory):
        voucher = voucher_factory()
        assert voucher.service is None
        assert voucher.start_datetime is None
        assert voucher.end_datetime is None

    def test_ordering_newest_first(self, voucher_factory):
        first = voucher_factory(recipient_name="First")
        second = voucher_factory(recipient_name="Second")

        now = timezone.now()
        GiftVoucher.objects.filter(pk=first.pk).update(created_at=now - timedelta(days=1))
        GiftVoucher.objects.filter(pk=second.pk).update(created_at=now)
        vouchers = list(GiftVoucher.objects.all())
        assert vouchers[0].pk == second.pk
        assert vouchers[1].pk == first.pk
