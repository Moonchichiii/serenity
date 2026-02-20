import pytest
from django.test import RequestFactory
from django.urls import NoReverseMatch, reverse

import apps.cms.wagtail_hooks as hooks_mod

pytestmark = pytest.mark.django_db

# Snippet URL utility

def test_get_snippet_url_returns_hash_when_model_missing():
    """Return '#' when model is None."""
    assert hooks_mod.get_snippet_url(None) == "#"


def test_get_snippet_url_returns_hash_on_reverse_failure(monkeypatch):
    """Return '#' if reverse lookup fails."""

    class DummyMeta:
        app_label = "cms"
        model_name = "dummy"

    class DummyModel:
        _meta = DummyMeta()

    def raise_reverse_error(*args, **kwargs):
        raise NoReverseMatch("Simulated reverse failure")

    monkeypatch.setattr(hooks_mod, "reverse", raise_reverse_error)
    assert hooks_mod.get_snippet_url(DummyModel, "list") == "#"

# Dashboard panels

def test_construct_homepage_panels_inserts_custom_panel(rf: RequestFactory):
    """Custom WelcomePanel is injected into the admin."""
    panels = []
    out = hooks_mod.add_welcome_panel(request=rf.get("/admin/"), panels=panels)

    assert len(out) == 1
    assert out[0].__class__.__name__ == "WelcomePanel"


def test_welcome_panel_render_safety_with_homepage(rf: RequestFactory, homepage):
    """WelcomePanel renders HTML when the CMS tree is populated."""
    panels = []
    hooks_mod.add_welcome_panel(request=rf.get("/admin/"), panels=panels)
    panel = panels[0]

    html = panel.render()
    assert isinstance(html, str)
    assert 'class="serenity-dashboard"' in html
    assert 'id="serenity-app"' in html

    expected_edit_url = reverse("wagtailadmin_pages:edit", args=[homepage.id])
    assert expected_edit_url in html


def test_welcome_panel_render_safety_without_homepage(rf: RequestFactory):
    """WelcomePanel renders HTML when no HomePage exists."""
    panels = []
    hooks_mod.add_welcome_panel(request=rf.get("/admin/"), panels=panels)
    panel = panels[0]

    html = panel.render()
    assert isinstance(html, str)
    assert 'class="serenity-dashboard"' in html
    assert 'id="serenity-app"' in html
