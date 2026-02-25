from unittest.mock import patch

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.contact.models import ContactSubmission


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture()
def api_client():
    return APIClient()


SUBMIT_URL = "/api/contact/submit/"


@pytest.mark.django_db
class TestSubmitContactView:
    def test_valid_submission_returns_201(self, api_client):
        payload = {
            "name": "Jean Dupont",
            "email": "jean@example.com",
            "phone": "+33612345678",
            "subject": "Rendez-vous",
            "message": "Bonjour, je voudrais prendre rendez-vous.",
        }

        with patch(
            "apps.contact.services._send_notification_email"
        ):
            resp = api_client.post(
                SUBMIT_URL, payload, format="json"
            )

        assert resp.status_code == 201
        assert resp.data["success"] is True
        assert "Merci" in resp.data["message"]
        assert ContactSubmission.objects.count() == 1

    def test_submission_persists_all_fields(self, api_client):
        payload = {
            "name": "Marie",
            "email": "marie@example.com",
            "subject": "Question",
            "message": "Message assez long pour passer la validation.",
        }

        with patch(
            "apps.contact.services._send_notification_email"
        ):
            api_client.post(SUBMIT_URL, payload, format="json")

        sub = ContactSubmission.objects.first()
        assert sub.name == "Marie"
        assert sub.email == "marie@example.com"
        assert sub.phone == ""
        assert sub.subject == "Question"

    def test_missing_name_returns_400(self, api_client):
        payload = {
            "email": "a@b.com",
            "subject": "S",
            "message": "A long enough message here.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "name" in resp.data

    def test_invalid_email_returns_400(self, api_client):
        payload = {
            "name": "Test",
            "email": "not-an-email",
            "subject": "S",
            "message": "A long enough message here.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "email" in resp.data

    def test_short_message_returns_400(self, api_client):
        payload = {
            "name": "Test",
            "email": "a@b.com",
            "subject": "S",
            "message": "Short",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "message" in resp.data

    def test_empty_body_returns_400(self, api_client):
        resp = api_client.post(
            SUBMIT_URL, {}, format="json"
        )
        assert resp.status_code == 400

    def test_get_method_not_allowed(self, api_client):
        resp = api_client.get(SUBMIT_URL)
        assert resp.status_code == 405

    def test_short_name_returns_400(self, api_client):
        payload = {
            "name": "J",
            "email": "j@example.com",
            "subject": "Subject",
            "message": "A long enough message here.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "name" in resp.data
