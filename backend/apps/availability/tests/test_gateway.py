from datetime import datetime
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

from googleapiclient.errors import HttpError

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


# ── HttpError branches ──────────────────────────────────────────────


def test_list_busy_days_returns_empty_on_http_error(monkeypatch):
    events_stub = MagicMock()
    events_stub.list.return_value.execute.side_effect = HttpError(
        resp=MagicMock(status=500), content=b"server error"
    )
    service_stub = MagicMock()
    service_stub.events.return_value = events_stub

    monkeypatch.setattr(gateway, "_get_service", lambda: service_stub)
    assert gateway.list_busy_days(2026, 3) == []


def test_list_free_slots_returns_empty_on_http_error(monkeypatch):
    events_stub = MagicMock()
    events_stub.list.return_value.execute.side_effect = HttpError(
        resp=MagicMock(status=500), content=b"server error"
    )
    service_stub = MagicMock()
    service_stub.events.return_value = events_stub

    monkeypatch.setattr(gateway, "_get_service", lambda: service_stub)
    assert gateway.list_free_slots("2026-03-01") == []


def test_list_free_slots_returns_empty_if_no_credentials(monkeypatch):
    monkeypatch.setattr(gateway, "_get_service", lambda: None)
    assert gateway.list_free_slots("2026-03-01") == []


def test_create_booking_event_returns_none_on_http_error(monkeypatch):
    events_stub = MagicMock()
    events_stub.insert.return_value.execute.side_effect = HttpError(
        resp=MagicMock(status=403), content=b"forbidden"
    )
    service_stub = MagicMock()
    service_stub.events.return_value = events_stub

    monkeypatch.setattr(gateway, "_get_service", lambda: service_stub)

    result = gateway.create_booking_event(
        title="Test",
        start_datetime=datetime(2026, 3, 1, 9, 0, tzinfo=TZ),
        end_datetime=datetime(2026, 3, 1, 10, 0, tzinfo=TZ),
        client_email="a@example.com",
        client_name="Alice",
    )
    assert result is None


def test_delete_booking_event_returns_false_on_http_error(monkeypatch):
    events_stub = MagicMock()
    events_stub.delete.return_value.execute.side_effect = HttpError(
        resp=MagicMock(status=404), content=b"not found"
    )
    service_stub = MagicMock()
    service_stub.events.return_value = events_stub

    monkeypatch.setattr(gateway, "_get_service", lambda: service_stub)
    assert gateway.delete_booking_event("evt_gone") is False


# ── December boundary (month == 12) ────────────────────────────────


def test_list_busy_days_december_boundary(monkeypatch):
    monkeypatch.setattr(
        gateway, "_get_service", lambda: _ServiceStub(items=[])
    )
    result = gateway.list_busy_days(2026, 12)
    assert result == []


# ── _get_credentials branches ───────────────────────────────────────


def test_get_credentials_returns_none_when_no_env(monkeypatch):
    monkeypatch.setattr(
        gateway, "config", lambda key, default=None: default
    )
    assert gateway._get_credentials() is None


def test_get_credentials_returns_none_on_bad_json(monkeypatch):
    import base64
    bad_b64 = base64.b64encode(b"not-valid-json").decode("utf-8")
    monkeypatch.setattr(
        gateway,
        "config",
        lambda key, default=None: bad_b64
        if key == "GOOGLE_SERVICE_ACCOUNT_BASE64"
        else default,
    )
    assert gateway._get_credentials() is None


def test_get_credentials_returns_service_account_credentials(monkeypatch):
    import base64
    import json

    service_account_info = {
        "type": "service_account",
        "project_id": "serenity-test",
        "private_key_id": "key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n",
        "client_email": "test@serenity-test.iam.gserviceaccount.com",
        "client_id": "1234567890",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/test",
    }

    encoded = base64.b64encode(
        json.dumps(service_account_info).encode("utf-8")
    ).decode("utf-8")

    monkeypatch.setattr(
        gateway,
        "config",
        lambda key, default=None: encoded
        if key == "GOOGLE_SERVICE_ACCOUNT_BASE64"
        else default,
    )

    with patch(
        "apps.availability.calendar_gateway.Credentials.from_service_account_info"
    ) as mock_from_info:
        mock_creds = MagicMock()
        mock_from_info.return_value = mock_creds

        creds = gateway._get_credentials()

        mock_from_info.assert_called_once()
        assert creds is mock_creds


def test_get_credentials_returns_none_on_invalid_service_account_base64(monkeypatch):
    monkeypatch.setattr(
        gateway,
        "config",
        lambda key, default=None: "%%%not-base64%%%"
        if key == "GOOGLE_SERVICE_ACCOUNT_BASE64"
        else default,
    )

    assert gateway._get_credentials() is None
