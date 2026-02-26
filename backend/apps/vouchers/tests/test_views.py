from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

TZ = ZoneInfo("Europe/Paris")


@pytest.fixture()
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestCreateVoucherViewSuccess:
    @patch("apps.vouchers.services.send_voucher_emails")
    def test_creates_voucher(self, mock_emails, api_client):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 201
        assert "code" in response.data
        mock_emails.assert_called_once()

    @patch("apps.vouchers.services.send_voucher_emails")
    @patch("apps.vouchers.services.create_booking_event")
    def test_with_booking_fields(
        self, mock_gcal, mock_emails, api_client, available_service
    ):
        mock_gcal.return_value = {"id": "gcal-99"}
        url = reverse("create_voucher")
        now = datetime.now(tz=TZ)
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": available_service.id,
            "start_datetime": (now + timedelta(days=1)).isoformat(),
            "end_datetime": (
                now + timedelta(days=1, hours=1)
            ).isoformat(),
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 201
        assert response.data["booking_confirmation"] != ""


@pytest.mark.django_db
class TestCreateVoucherViewValidation:
    def test_missing_required_fields(self, api_client):
        url = reverse("create_voucher")
        response = api_client.post(url, {}, format="json")
        assert response.status_code == 400

    def test_partial_booking_fields_rejected(self, api_client):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": 1,
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestCreateVoucherViewMethodNotAllowed:
    def test_get_not_allowed(self, api_client):
        url = reverse("create_voucher")
        response = api_client.get(url)
        assert response.status_code == 405


@pytest.mark.django_db
class TestCancelBookingView:
    def test_cancel_success(self, api_client, booking_factory):
        booking = booking_factory(
            status="confirmed",
            google_calendar_event_id="gcal-del",
        )
        with patch(
            "apps.vouchers.services.delete_booking_event"
        ) as mock_del:
            mock_del.return_value = True
            url = reverse(
                "cancel_booking",
                args=[booking.confirmation_code],
            )
            response = api_client.delete(url)

        assert response.status_code == 200
        assert response.data["status"] == "cancelled"

    def test_cancel_not_found(self, api_client):
        url = reverse("cancel_booking", args=["FAKECODE99"])
        response = api_client.delete(url)
        assert response.status_code == 404

    def test_cancel_already_cancelled(
        self, api_client, booking_factory
    ):
        booking = booking_factory(status="cancelled")
        url = reverse(
            "cancel_booking",
            args=[booking.confirmation_code],
        )
        response = api_client.delete(url)
        assert response.status_code == 400

    def test_cancel_completed_rejected(
        self, api_client, booking_factory
    ):
        booking = booking_factory(status="completed")
        url = reverse(
            "cancel_booking",
            args=[booking.confirmation_code],
        )
        response = api_client.delete(url)
        assert response.status_code == 400
