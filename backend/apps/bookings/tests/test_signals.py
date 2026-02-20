import pytest
from django.core.cache import cache

from apps.bookings.signals import _invalidate_booking_cache


@pytest.mark.django_db
def test_invalidate_booking_cache_deletes_expected_keys(booking_factory, monkeypatch):
    b = booking_factory()

    deleted = {"keys": None}
    monkeypatch.setattr(cache, "delete_many", lambda keys: deleted.update({"keys": keys}))

    _invalidate_booking_cache(b)
    assert any(k.startswith("calendar:busy:") for k in deleted["keys"])
    assert any(k.startswith("calendar:slots:") for k in deleted["keys"])
