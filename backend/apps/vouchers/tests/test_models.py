import pytest


@pytest.mark.django_db
class TestGiftVoucherModel:
    def test_voucher_code_generated_on_save(self, voucher_factory):
        voucher = voucher_factory(code="")
        assert voucher.code
        assert len(voucher.code) == 10

    def test_str(self, voucher_factory):
        voucher = voucher_factory(recipient_name="Alice")
        assert "Alice" in str(voucher)
