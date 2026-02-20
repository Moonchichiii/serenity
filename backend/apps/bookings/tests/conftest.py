from __future__ import annotations

import secrets
from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from apps.bookings.models import Booking
from apps.services.models import Service

TZ = ZoneInfo("Europe/Paris")


@pytest.fixture()
def service_factory(db):
    """Create and persist a Service instance with sensible defaults."""
    _counter = 0

    def _create(**overrides):
        nonlocal _counter
        _counter += 1
        defaults = {
            "title_en": f"Service {_counter}",
            "title_fr": f"Prestation {_counter}",
            "duration_minutes": 60,
            "is_available": True,
        }
        defaults.update(overrides)
        return Service.objects.create(**defaults)

    return _create


@pytest.fixture()
def booking_factory(db, service_factory):
    """Create and persist a Booking with auto-generated Service."""
    _counter = 0

    def _create(**overrides):
        nonlocal _counter
        _counter += 1
        if "service" not in overrides:
            overrides["service"] = service_factory()

        defaults = {
            "start_datetime": datetime(
                2026, 2, 20, 10, 0, tzinfo=TZ
            ),
            "end_datetime": datetime(
                2026, 2, 20, 11, 0, tzinfo=TZ
            ),
            "status": "pending",
            "source": "online",
            "client_name": f"Client {_counter}",
            "client_email": f"client{_counter}@example.com",
            "client_phone": "0600000000",
            "preferred_language": "fr",
            "confirmation_code": secrets.token_hex(4).upper(),
        }
        defaults.update(overrides)
        return Booking.objects.create(**defaults)

    return _create
