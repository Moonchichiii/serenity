import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_busy_requires_valid_params(client, monkeypatch):
    url = reverse("availability_busy")

    # Missing params -> 400
    res = client.get(url)
    assert res.status_code == 400

    # Invalid month -> 400
    res = client.get(url, {"year": 2026, "month": 13})
    assert res.status_code == 400


@pytest.mark.django_db
def test_busy_returns_payload(client, monkeypatch):
    from apps.availability import views

    monkeypatch.setattr(views, "get_busy_days", lambda year, month: ["2026-02-10"])

    url = reverse("availability_busy")
    res = client.get(url, {"year": 2026, "month": 2})

    assert res.status_code == 200
    assert res.json() == {"busy": ["2026-02-10"]}


@pytest.mark.django_db
def test_slots_requires_valid_date(client):
    url = reverse("availability_slots")

    res = client.get(url)  # missing
    assert res.status_code == 400

    res = client.get(url, {"date": "not-a-date"})
    assert res.status_code == 400


@pytest.mark.django_db
def test_slots_returns_payload(client, monkeypatch):
    from apps.availability import views

    monkeypatch.setattr(views, "get_free_slots", lambda date_iso: ["09:00", "09:30"])

    url = reverse("availability_slots")
    res = client.get(url, {"date": "2026-02-12"})

    assert res.status_code == 200
    assert res.json() == {"times": ["09:00", "09:30"]}
