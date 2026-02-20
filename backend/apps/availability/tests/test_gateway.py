from datetime import datetime
from zoneinfo import ZoneInfo

from apps.availability import calendar_gateway as gateway

TZ = ZoneInfo("Europe/Paris")


class _EventsListStub:
    def __init__(self, items):
        self._items = items

    def execute(self):
        return {"items": self._items}


class _EventsInsertStub:
    def __init__(self, created):
        self._created = created

    def execute(self):
        return self._created


class _EventsDeleteStub:
    def execute(self):
        return None


class _EventsStub:
    def __init__(self, items=None, created=None):
        self._items = items or []
        self._created = created or {"id": "evt_123", "status": "confirmed", "htmlLink": "https://example.com"}

    def list(self, **kwargs):
        return _EventsListStub(self._items)

    def insert(self, **kwargs):
        return _EventsInsertStub(self._created)

    def delete(self, **kwargs):
        return _EventsDeleteStub()


class _ServiceStub:
    def __init__(self, items=None, created=None):
        self._events = _EventsStub(items=items, created=created)

    def events(self):
        return self._events


def test_list_busy_days_returns_empty_if_no_credentials(monkeypatch):
    monkeypatch.setattr(gateway, "_get_service", lambda: None)
    assert gateway.list_busy_days(2026, 2) == []


def test_list_busy_days_collects_all_day_and_timed_events(monkeypatch):
    items = [
        {"start": {"date": "2026-02-10"}, "end": {"date": "2026-02-11"}},
        {"start": {"dateTime": "2026-02-12T10:00:00+01:00"}, "end": {"dateTime": "2026-02-12T11:00:00+01:00"}},
        {"start": {"dateTime": "2026-02-12T15:00:00+01:00"}, "end": {"dateTime": "2026-02-12T16:00:00+01:00"}},
    ]
    monkeypatch.setattr(gateway, "_get_service", lambda: _ServiceStub(items=items))

    assert gateway.list_busy_days(2026, 2) == ["2026-02-10", "2026-02-12"]


def test_list_free_slots_excludes_occupied_ranges(monkeypatch):
    # One event from 10:00 to 11:00 blocks those slots.
    items = [
        {"start": {"dateTime": "2026-02-12T10:00:00+01:00"}, "end": {"dateTime": "2026-02-12T11:00:00+01:00"}},
    ]
    monkeypatch.setattr(gateway, "_get_service", lambda: _ServiceStub(items=items))

    slots = gateway.list_free_slots("2026-02-12", slot_minutes=30, work_hours=(9, 12))

    # Expected: 09:00, 09:30, (10:00 blocked), (10:30 blocked), 11:00, 11:30
    assert slots == ["09:00", "09:30", "11:00", "11:30"]


def test_create_booking_event_returns_none_if_no_service(monkeypatch):
    monkeypatch.setattr(gateway, "_get_service", lambda: None)

    out = gateway.create_booking_event(
        title="Test",
        start_datetime=datetime(2026, 2, 12, 9, 0, tzinfo=TZ),
        end_datetime=datetime(2026, 2, 12, 10, 0, tzinfo=TZ),
        client_email="a@example.com",
        client_name="Alice",
    )
    assert out is None


def test_create_booking_event_returns_payload(monkeypatch):
    created = {"id": "evt_999", "status": "confirmed", "htmlLink": "https://calendar/item"}
    monkeypatch.setattr(gateway, "_get_service", lambda: _ServiceStub(created=created))

    out = gateway.create_booking_event(
        title="Massage - Alice",
        start_datetime=datetime(2026, 2, 12, 9, 0, tzinfo=TZ),
        end_datetime=datetime(2026, 2, 12, 10, 0, tzinfo=TZ),
        client_email="a@example.com",
        client_name="Alice",
        description="Hello",
    )
    assert out == {"id": "evt_999", "link": "https://calendar/item", "status": "confirmed"}


def test_delete_booking_event_returns_false_if_no_service(monkeypatch):
    monkeypatch.setattr(gateway, "_get_service", lambda: None)
    assert gateway.delete_booking_event("evt_1") is False


def test_delete_booking_event_returns_true_on_success(monkeypatch):
    monkeypatch.setattr(gateway, "_get_service", lambda: _ServiceStub())
    assert gateway.delete_booking_event("evt_1") is True
