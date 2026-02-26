import pytest


@pytest.mark.django_db
class TestGiftVoucherModel:
    def test_voucher_code_generated_on_save(self, voucher_factory):
        voucher = voucher_factory()
        assert voucher.code
        assert len(voucher.code) == 10

    def test_str(self, voucher_factory):
        voucher = voucher_factory(recipient_name="Alice")
        assert "Alice" in str(voucher)


@pytest.mark.django_db
class TestBookingModel:
    def test_booking_str_voucher_prefix(self, booking_factory):
        booking = booking_factory(source="voucher")
        assert "[Voucher]" in str(booking)

    def test_booking_str_manual_prefix(self, booking_factory):
        booking = booking_factory(source="manual")
        assert "[Manual]" in str(booking)

    def test_default_status_is_pending(self, booking_factory):
        booking = booking_factory()
        assert booking.status == "pending"

    def test_default_source_is_voucher(self, booking_factory):
        booking = booking_factory()
        assert booking.source == "voucher"
