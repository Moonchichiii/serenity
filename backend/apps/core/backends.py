from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.http import HttpRequest

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """Authenticate with either email or username."""

    def authenticate(
        self,
        request: HttpRequest | None,
        username: str | None = None,
        password: str | None = None,
        **kwargs: Any,
    ) -> Any:  # Use Any to satisfy strict inheritance from ModelBackend
        if username is None or password is None:
            return None

        try:
            user = User.objects.get(
                Q(username=username) | Q(email__iexact=username)
            )
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
