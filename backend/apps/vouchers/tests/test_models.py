import pytest

from apps.vouchers.models import GiftVoucher


@pytest.mark.django_db
def test_voucher_code_generated_on_save():
    v = GiftVoucher(
        purchaser_name="A",
        purchaser_email="a@example.com",
        recipient_name="B",
        recipient_email="b@example.com",
    )
    v.save()
    assert v.code
    assert len(v.code) >= 6
