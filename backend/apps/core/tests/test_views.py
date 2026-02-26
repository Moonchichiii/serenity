from __future__ import annotations

import json

import pytest
from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()

pytestmark = pytest.mark.django_db


# ── Fixtures ───────────────────────────────────────────────────


@pytest.fixture()
def staff_user():
    return User.objects.create_user(
        username="staffuser",
        email="staff@example.com",
        password="testpass123",
        is_staff=True,
    )


@pytest.fixture()
def non_staff_user():
    return User.objects.create_user(
        username="regular",
        email="regular@example.com",
        password="testpass123",
        is_staff=False,
    )


@pytest.fixture()
def client():
    return Client(enforce_csrf_checks=False)


@pytest.fixture()
def csrf_client():
    """Client that enforces CSRF checks."""
    return Client(enforce_csrf_checks=True)


# ── csrf endpoint ──────────────────────────────────────────────


class TestCsrfView:
    def test_returns_csrf_token(self, client: Client):
        resp = client.get("/api/auth/csrf/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["detail"] == "ok"
        assert "csrfToken" in data
        assert len(data["csrfToken"]) > 0

    def test_sets_csrf_cookie(self, client: Client):
        resp = client.get("/api/auth/csrf/")
        assert "csrftoken" in resp.cookies


# ── me endpoint ────────────────────────────────────────────────


class TestMeView:
    def test_unauthenticated(self, client: Client):
        resp = client.get("/api/auth/me/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["isAuthenticated"] is False
        assert "username" not in data

    def test_authenticated_staff(
        self, client: Client, staff_user
    ):
        client.force_login(staff_user)
        resp = client.get("/api/auth/me/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["isAuthenticated"] is True
        assert data["username"] == "staffuser"
        assert data["email"] == "staff@example.com"
        assert data["isStaff"] is True
        assert data["isSuperuser"] is False

    def test_authenticated_non_staff(
        self, client: Client, non_staff_user
    ):
        client.force_login(non_staff_user)
        resp = client.get("/api/auth/me/")
        data = resp.json()
        assert data["isAuthenticated"] is True
        assert data["isStaff"] is False


# ── login endpoint ─────────────────────────────────────────────


class TestLoginView:
    def _post_login(self, client: Client, payload: dict):
        return client.post(
            "/api/auth/login/",
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_successful_staff_login(
        self, client: Client, staff_user
    ):
        resp = self._post_login(
            client,
            {"username": "staffuser", "password": "testpass123"},
        )
        assert resp.status_code == 200
        assert resp.json()["detail"] == "ok"

    def test_login_by_email(
        self, client: Client, staff_user
    ):
        resp = self._post_login(
            client,
            {
                "email": "staff@example.com",
                "password": "testpass123",
            },
        )
        assert resp.status_code == 200

    def test_invalid_credentials(
        self, client: Client, staff_user
    ):
        resp = self._post_login(
            client,
            {"username": "staffuser", "password": "wrong"},
        )
        assert resp.status_code == 401

    def test_non_staff_rejected(
        self, client: Client, non_staff_user
    ):
        resp = self._post_login(
            client,
            {"username": "regular", "password": "testpass123"},
        )
        assert resp.status_code == 403

    def test_missing_credentials(self, client: Client):
        resp = self._post_login(
            client, {"username": "staffuser"}
        )
        assert resp.status_code == 400

    def test_empty_body(self, client: Client):
        resp = self._post_login(client, {})
        assert resp.status_code == 400

    def test_invalid_json(self, client: Client):
        resp = client.post(
            "/api/auth/login/",
            data="not json{{{",
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_get_not_allowed(self, client: Client):
        resp = client.get("/api/auth/login/")
        assert resp.status_code == 405

    def test_put_not_allowed(self, client: Client):
        resp = client.put(
            "/api/auth/login/",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert resp.status_code == 405


# ── logout endpoint ────────────────────────────────────────────


class TestLogoutView:
    def test_logout_authenticated_user(
        self, client: Client, staff_user
    ):
        client.force_login(staff_user)
        resp = client.post("/api/auth/logout/")
        assert resp.status_code == 200
        assert resp.json()["detail"] == "ok"
        # Verify user is logged out
        me_resp = client.get("/api/auth/me/")
        assert me_resp.json()["isAuthenticated"] is False

    def test_logout_unauthenticated_user(
        self, client: Client
    ):
        resp = client.post("/api/auth/logout/")
        assert resp.status_code == 200
        assert resp.json()["detail"] == "ok"

    def test_get_not_allowed(self, client: Client):
        resp = client.get("/api/auth/logout/")
        assert resp.status_code == 405
