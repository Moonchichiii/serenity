from apps.availability import selectors


def test_get_busy_days_delegates(monkeypatch):
    def _fake(year, month):
        assert year == 2026
        assert month == 2
        return ["2026-02-10"]

    monkeypatch.setattr(selectors, "list_busy_days", _fake)
    assert selectors.get_busy_days(year=2026, month=2) == ["2026-02-10"]


def test_get_free_slots_delegates(monkeypatch):
    def _fake(date_iso):
        assert date_iso == "2026-02-12"
        return ["09:00"]

    monkeypatch.setattr(selectors, "list_free_slots", _fake)
    assert selectors.get_free_slots(date_iso="2026-02-12") == ["09:00"]
