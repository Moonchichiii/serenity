from unittest.mock import patch

import pytest

from apps.vouchers.signals import _invalidate_booking_cache


@pytest.mark.django_db
class TestInvalidateBookingCache:
    def test_deletes_expected_keys(self, booking_factory):
        booking = booking_factory()
        expected_month = booking.start_datetime.strftime("%Y-%m")
        expected_day = booking.start_datetime.strftime("%Y-%m-%d")

        with patch("apps.vouchers.signals.cache") as mock_cache:
            _invalidate_booking_cache(booking)
            mock_cache.delete_many.assert_called_once()
            keys = mock_cache.delete_many.call_args[0][0]
            assert f"calendar:busy:{expected_month}" in keys
            assert f"calendar:slots:{expected_day}" in keys
