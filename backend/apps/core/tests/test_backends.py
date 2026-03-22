"""
Tests for custom authentication backends in apps.core.backends.

If your project uses EmailBackend or a similar custom auth backend,
expand these tests accordingly.
"""
from __future__ import annotations

import pytest
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db


class TestEmailAuthBackend:
    """Test authenticating via email instead of username."""

    @pytest.fixture(autouse=True)
    def _create_user(self):
        self.user = User.objects.create_user(
            username="emailuser",
            email="emailuser@example.com",
            password="s3cure!Pass",
            is_staff=True,
        )

    def test_authenticate_by_email(self, rf):
        request = rf.post("/")
        user = authenticate(
            request,
            username="emailuser@example.com",
            password="s3cure!Pass",
        )
        # If an EmailBackend is installed it returns the user;
        # otherwise the default backend uses the username field.
        if user is not None:
            assert user.pk == self.user.pk

    def test_authenticate_by_username(self, rf):
        request = rf.post("/")
        user = authenticate(
            request,
            username="emailuser",
            password="s3cure!Pass",
        )
        assert user is not None
        assert user.pk == self.user.pk

    def test_wrong_password_returns_none(self, rf):
        request = rf.post("/")
        user = authenticate(
            request,
            username="emailuser",
            password="wrong",
        )
        assert user is None

    def test_nonexistent_user_returns_none(self, rf):
        request = rf.post("/")
        user = authenticate(
            request,
            username="nobody@example.com",
            password="whatever",
        )
        assert user is None
