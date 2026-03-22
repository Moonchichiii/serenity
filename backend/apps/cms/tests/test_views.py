from __future__ import annotations

import pytest
from django.urls import reverse

from apps.cms.selectors import CmsHydrationError

pytestmark = pytest.mark.django_db

# Corrected to match name="homepage-hydrated" in urls.py
HOMEPAGE_URL = reverse("homepage-hydrated")


class TestHydratedHomepageView:
    def test_success_returns_payload(self, client, monkeypatch):
        payload = {
            "page": {"id": 1},
            "services": [],
            "globals": {},
            "testimonials": [],
        }
        monkeypatch.setattr(
            "apps.cms.views.get_hydrated_homepage_payload",
            lambda **kwargs: payload,
        )

        res = client.get(HOMEPAGE_URL)
        assert res.status_code == 200
        assert res.json() == payload

    def test_cms_hydration_error_returns_500(self, client, monkeypatch):
        def boom(**kwargs):
            raise CmsHydrationError("No HomePage found")

        monkeypatch.setattr(
            "apps.cms.views.get_hydrated_homepage_payload",
            boom,
        )

        res = client.get(HOMEPAGE_URL)
        assert res.status_code == 500
        assert res.json()["error"] == "CMS Hydration Error"
        assert "No HomePage found" in res.json()["detail"]

    def test_generic_exception_returns_500(self, client, monkeypatch):
        def boom(**kwargs):
            raise ValueError("unexpected")

        monkeypatch.setattr(
            "apps.cms.views.get_hydrated_homepage_payload",
            boom,
        )

        res = client.get(HOMEPAGE_URL)
        assert res.status_code == 500
        assert res.json()["error"] == "Internal Server Error"
