from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model

from apps.core.backends import EmailOrUsernameBackend

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture()
def backend():
    return EmailOrUsernameBackend()


@pytest.fixture()
def user():
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="secret123",
    )


class TestEmailOrUsernameBackend:
    def test_authenticate_by_username(self, backend, user):
        result = backend.authenticate(None, username="alice", password="secret123")
        assert result == user

    def test_authenticate_by_email(self, backend, user):
        result = backend.authenticate(
            None, username="alice@example.com", password="secret123"
        )
        assert result == user

    def test_email_case_insensitive(self, backend, user):
        result = backend.authenticate(
            None, username="Alice@Example.COM", password="secret123"
        )
        assert result == user

    def test_wrong_password_returns_none(self, backend, user):
        result = backend.authenticate(None, username="alice", password="wrong")
        assert result is None

    def test_nonexistent_user_returns_none(self, backend):
        result = backend.authenticate(
            None, username="nobody", password="secret123"
        )
        assert result is None

    def test_none_username_returns_none(self, backend):
        assert backend.authenticate(None, username=None, password="x") is None

    def test_none_password_returns_none(self, backend):
        assert backend.authenticate(None, username="alice", password=None) is None

    def test_inactive_user_rejected(self, backend, user):
        user.is_active = False
        user.save()
        result = backend.authenticate(
            None, username="alice", password="secret123"
        )
        assert result is None

    def test_duplicate_email_returns_none(self, backend, user):
        """MultipleObjectsReturned is caught gracefully."""
        User.objects.create_user(
            username="alice2",
            email="alice@example.com",
            password="other",
        )
        result = backend.authenticate(
            None, username="alice@example.com", password="secret123"
        )
        assert result is None
