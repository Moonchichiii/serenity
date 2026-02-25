import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.testimonials.models import Testimonial


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture()
def api_client():
    return APIClient()


# ── Adjust these if your URL patterns differ ────────
LIST_URL = "/api/testimonials/"
SUBMIT_URL = "/api/testimonials/submit/"
STATS_URL = "/api/testimonials/stats/"


def _reply_url(testimonial_id):
    return f"/api/testimonials/{testimonial_id}/reply/"


@pytest.mark.django_db
class TestGetTestimonials:
    def test_returns_approved_testimonials(self, api_client):
        Testimonial.objects.create(
            name="A", rating=5, text="Approved one!",
            status="approved",
        )
        Testimonial.objects.create(
            name="B", rating=4, text="Still pending..",
            status="pending",
        )

        resp = api_client.get(LIST_URL)

        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["name"] == "A"

    def test_min_rating_filter(self, api_client):
        Testimonial.objects.create(
            name="Low", rating=2, text="Not so great...",
            status="approved",
        )
        Testimonial.objects.create(
            name="High", rating=5, text="Absolutely amazing!",
            status="approved",
        )

        resp = api_client.get(LIST_URL, {"min_rating": "4"})

        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["name"] == "High"

    def test_invalid_min_rating_defaults_to_zero(self, api_client):
        Testimonial.objects.create(
            name="T", rating=1, text="One star review.",
            status="approved",
        )

        resp = api_client.get(LIST_URL, {"min_rating": "abc"})

        assert resp.status_code == 200
        assert len(resp.data) == 1

    def test_response_includes_expected_fields(self, api_client):
        Testimonial.objects.create(
            name="Field Test",
            rating=4,
            text="Checking fields.",
            status="approved",
        )

        resp = api_client.get(LIST_URL)
        item = resp.data[0]

        assert "id" in item
        assert "name" in item
        assert "rating" in item
        assert "text" in item
        assert "date" in item
        assert "avatar" in item
        assert "replies" in item


@pytest.mark.django_db
class TestSubmitTestimonial:
    def test_valid_submission_returns_201(self, api_client):
        payload = {
            "name": "Sophie",
            "email": "sophie@example.com",
            "rating": 5,
            "text": "Un massage merveilleux, très relaxant.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")

        assert resp.status_code == 201
        assert resp.data["success"] is True
        assert "id" in resp.data
        assert Testimonial.objects.count() == 1
        assert Testimonial.objects.first().status == "pending"

    def test_email_is_optional(self, api_client):
        payload = {
            "name": "Luc",
            "rating": 4,
            "text": "Très bonne expérience au salon.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 201

    def test_invalid_rating_returns_400(self, api_client):
        payload = {
            "name": "Test",
            "rating": 6,
            "text": "Rating is out of range.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "rating" in resp.data

    def test_short_text_returns_400(self, api_client):
        payload = {
            "name": "Test",
            "rating": 3,
            "text": "Short",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "text" in resp.data

    def test_missing_name_returns_400(self, api_client):
        payload = {
            "rating": 5,
            "text": "A long enough testimonial text.",
        }

        resp = api_client.post(SUBMIT_URL, payload, format="json")
        assert resp.status_code == 400
        assert "name" in resp.data

    def test_empty_body_returns_400(self, api_client):
        resp = api_client.post(SUBMIT_URL, {}, format="json")
        assert resp.status_code == 400


@pytest.mark.django_db
class TestSubmitReply:
    def test_valid_reply_returns_201(
        self, api_client, approved_testimonial
    ):
        payload = {
            "name": "Admin",
            "email": "admin@serenity.test",
            "text": "Merci pour votre retour !",
        }

        resp = api_client.post(
            _reply_url(approved_testimonial.pk),
            payload,
            format="json",
        )

        assert resp.status_code == 201
        assert resp.data["success"] is True
        assert approved_testimonial.replies.count() == 1

    def test_nonexistent_testimonial_returns_404(self, api_client):
        payload = {
            "name": "Admin",
            "email": "admin@serenity.test",
            "text": "Reply text here.",
        }

        resp = api_client.post(
            _reply_url(99999), payload, format="json"
        )

        assert resp.status_code == 404
        assert "introuvable" in resp.data["error"]

    def test_missing_email_returns_400(
        self, api_client, approved_testimonial
    ):
        payload = {
            "name": "Admin",
            "text": "Reply without email.",
        }

        resp = api_client.post(
            _reply_url(approved_testimonial.pk),
            payload,
            format="json",
        )
        assert resp.status_code == 400
        assert "email" in resp.data

    def test_short_name_returns_400(
        self, api_client, approved_testimonial
    ):
        payload = {
            "name": "A",
            "email": "a@b.com",
            "text": "Valid reply text.",
        }

        resp = api_client.post(
            _reply_url(approved_testimonial.pk),
            payload,
            format="json",
        )
        assert resp.status_code == 400
        assert "name" in resp.data

    def test_empty_body_returns_400(
        self, api_client, approved_testimonial
    ):
        resp = api_client.post(
            _reply_url(approved_testimonial.pk), {}, format="json"
        )
        assert resp.status_code == 400


@pytest.mark.django_db
class TestTestimonialStatsView:
    def test_returns_stats(self, api_client):
        Testimonial.objects.create(
            name="A", rating=5, text="Five stars!",
            status="approved",
        )
        Testimonial.objects.create(
            name="B", rating=3, text="Three stars!",
            status="approved",
        )

        resp = api_client.get(STATS_URL)

        assert resp.status_code == 200
        assert resp.data["total_reviews"] == 2
        assert resp.data["average_rating"] == 4.0
        assert resp.data["five_star_count"] == 1
        assert resp.data["three_star_count"] == 1

    def test_empty_db_returns_zeros(self, api_client):
        resp = api_client.get(STATS_URL)

        assert resp.status_code == 200
        assert resp.data["total_reviews"] == 0
        assert resp.data["average_rating"] == 0
