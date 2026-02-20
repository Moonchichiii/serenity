import pytest

from apps.vouchers import services as voucher_services


@pytest.mark.django_db
def test_create_voucher_persists():
    v = voucher_services.create_voucher(
        data={
            "purchaser_name": "A",
            "purchaser_email": "a@example.com",
            "recipient_name": "B",
            "recipient_email": "b@example.com",
            "message": "",
            "preferred_date": None,
        }
    )
    assert v.pk is not None
    assert v.code


@pytest.mark.django_db
def test_send_voucher_emails_calls_both_senders(monkeypatch, rf, voucher_factory):
    voucher = voucher_factory()

    monkeypatch.setattr(voucher_services, "_resolve_gift_settings", lambda request: (None, "Serenity", ""))
    monkeypatch.setattr(voucher_services, "_resolve_language", lambda request: "en")
    monkeypatch.setattr(voucher_services, "_build_email_context", lambda **kwargs: {"ok": True})

    called = {"recipient": 0, "admin": 0}
    monkeypatch.setattr(voucher_services, "_send_recipient_email", lambda *a, **k: called.__setitem__("recipient", called["recipient"] + 1))
    monkeypatch.setattr(voucher_services, "_send_admin_email", lambda *a, **k: called.__setitem__("admin", called["admin"] + 1))

    request = rf.post("/api/vouchers/create/")
    voucher_services.send_voucher_emails(voucher=voucher, request=request)

    assert called["recipient"] == 1
    assert called["admin"] == 1
