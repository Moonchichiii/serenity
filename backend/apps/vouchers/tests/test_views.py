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
    @patch("apps.vouchers.views.send_voucher_emails")
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
    def test_with_slot_fields_creates_calendar_event_metadata(
        self, mock_gcal, mock_emails, api_client, available_service
    ):
        mock_gcal.return_value = {
            "id": "evt_999",
            "link": "https://calendar/item",
            "status": "confirmed",
        }

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
            "end_datetime": (now + timedelta(days=1, hours=1)).isoformat(),
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 201

        # New response fields (voucher-owned)
        assert response.data["calendar_event_id"] == "evt_999"
        assert response.data["calendar_event_link"] == "https://calendar/item"
        assert response.data["calendar_event_status"] == "confirmed"


@pytest.mark.django_db
class TestCreateVoucherViewValidation:
    def test_missing_required_fields(self, api_client):
        url = reverse("create_voucher")
        response = api_client.post(url, {}, format="json")
        assert response.status_code == 400

    def test_partial_slot_fields_rejected(self, api_client):
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
class TestCreateVoucherViewMoreValidation:
    def test_valid_with_service_id_only(self, api_client, available_service):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "service_id": available_service.id,
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 201
        assert response.data["service_id"] == available_service.id
        assert response.data["start_datetime"] is None
        assert response.data["end_datetime"] is None

    def test_invalid_language_returns_400(self, api_client):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
            "preferred_language": "sv",
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 400
        assert "preferred_language" in response.data

    def test_invalid_email_returns_400(self, api_client):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "not-an-email",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == 400
        assert "recipient_email" in response.data


@pytest.mark.django_db
class TestCreateVoucherViewFailureBehavior:
    @patch("apps.vouchers.views.send_voucher_emails", side_effect=Exception("mail boom"))
    def test_email_failure_currently_bubbles_up(self, mock_send, api_client):
        url = reverse("create_voucher")
        data = {
            "recipient_name": "Alice",
            "recipient_email": "alice@example.com",
            "sender_name": "Bob",
            "sender_email": "bob@example.com",
            "amount": "100.00",
        }

        with pytest.raises(Exception, match="mail boom"):
            api_client.post(url, data, format="json")
