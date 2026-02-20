import pytest
from django.test import RequestFactory
from wagtail.models import Page, Site

from apps.cms import selectors
from apps.cms.pages import HomePage
from apps.cms.settings import GiftSettings

pytestmark = pytest.mark.django_db


def _make_request(rf: RequestFactory, host: str = "example.com"):
    return rf.get("/", HTTP_HOST=host)


# ── get_site_for_request ────────────────────────────────────────────


def test_get_site_for_request_success(rf, site):
    req = _make_request(rf)
    resolved = selectors.get_site_for_request(req)
    assert resolved is not None
    assert resolved.hostname == "example.com"


def test_get_site_for_request_exception(monkeypatch, rf):
    def boom(*args, **kwargs):
        raise RuntimeError("fail")

    monkeypatch.setattr(selectors.Site, "find_for_request", boom)
    assert selectors.get_site_for_request(_make_request(rf)) is None


# ── get_homepage_for_site ───────────────────────────────────────────


def test_get_homepage_for_site_no_site_returns_first_live(
    homepage, hero_slides, specialties
):
    page = selectors.get_homepage_for_site(None)
    assert page is not None
    assert page.pk == homepage.pk
    assert [
        s.title_en
        for s in page.hero_slides.all().order_by("sort_order")
    ] == ["Slide A", "Slide B"]
    assert [
        s.title_en
        for s in page.specialties.all().order_by("sort_order")
    ] == ["Spec A", "Spec B"]


def test_get_homepage_for_site_site_root_is_homepage(homepage_site):
    page = selectors.get_homepage_for_site(homepage_site)
    assert page is not None
    assert page.pk == homepage_site.root_page.specific.pk


def test_get_homepage_for_site_descendant_of_root(root_page):
    """root -> section -> homepage — selector walks descendants."""
    section = Page(title="Section", slug="section")
    root_page.add_child(instance=section)
    section.save_revision().publish()

    from apps.cms.tests.conftest import _unique_slug

    home = HomePage(title="Home", slug=_unique_slug())
    section.add_child(instance=home)
    home.save_revision().publish()

    site = Site.objects.create(
        hostname="descendant.example.com",
        root_page=section,
        is_default_site=False,
    )

    page = selectors.get_homepage_for_site(site)
    assert page is not None
    assert page.pk == home.pk


def test_get_homepage_for_site_fallback_when_not_in_subtree(homepage):
    """
    Site root is a sibling page — descendant_of finds nothing,
    but the fallback grabs the first live HomePage anyway.
    """
    root = Page.get_first_root_node()
    sibling = Page(title="Other Section", slug="other-section")
    root.add_child(instance=sibling)

    site = Site.objects.create(
        hostname="sibling.example.com",
        root_page=sibling,
        is_default_site=False,
    )

    page = selectors.get_homepage_for_site(site)
    assert page is not None
    assert page.pk == homepage.pk


def test_get_homepage_for_site_returns_none_if_missing(site):
    assert selectors.get_homepage_for_site(site) is None


# ── get_globals_payload ─────────────────────────────────────────────


def test_get_globals_payload_site_for_site_fails_fallback(
    monkeypatch, site, gift_settings
):
    def boom(*args, **kwargs):
        raise RuntimeError("fail")

    monkeypatch.setattr(GiftSettings, "for_site", boom)

    payload = selectors.get_globals_payload(site=site)
    assert payload["gift"] is not None


def test_get_globals_payload_no_settings_returns_none():
    GiftSettings.objects.all().delete()
    payload = selectors.get_globals_payload(site=None)
    assert payload == {"gift": None}


# ── Performance & Contract Constraints ──────────────────────────────

@pytest.mark.performance
def test_get_hydrated_homepage_payload_query_count(
    rf: RequestFactory,
    homepage_site,
    homepage,
    hero_slides,
    specialties,
    gift_settings
):
    """
    Performance Lock: Ensure the hydrated payload remains O(1) regarding
    database roundtrips.

    Expected Queries:
    1. Wagtail Site resolution
    2. HomePage resolution (live check)
    3. HomePage hydration (prefetch_related for slides/specialties)
    4. Services fetch
    5. Testimonials fetch
    6. GiftSettings fetch
    """
    request = rf.get("/", HTTP_HOST=homepage_site.hostname)

    # We allow a small buffer for Wagtail internal overhead (e.g. 8-10 queries),
    # but the goal is to prevent this from jumping to 50+ via N+1.
    MAX_QUERY_THRESHOLD = 12

    with utils.CaptureQueriesContext(connection) as ctx:
        payload = selectors.get_hydrated_homepage_payload(request=request)

    query_count = len(ctx)

    # Validation
    assert payload["page"]["id"] == homepage.id
    assert len(payload["page"]["hero_slides"]) == 2
    assert "services" in payload
    assert "testimonials" in payload

    # Strict Performance Check
    assert query_count <= MAX_QUERY_THRESHOLD, (
        f"Hydrated payload exceeded query threshold! "
        f"Actual: {query_count}, Max: {MAX_QUERY_THRESHOLD}. "
        f"Check for N+1 issues in serializers or child selectors."
    )


def test_get_hydrated_homepage_payload_fails_deterministically(rf: RequestFactory):
    """
    Contract Lock: If the HomePage is missing, we must raise CmsHydrationError,
    not return a partial dict or None.
    """
    from apps.cms.pages import HomePage
    HomePage.objects.all().delete()

    request = rf.get("/")

    with pytest.raises(selectors.CmsHydrationError) as excinfo:
        selectors.get_hydrated_homepage_payload(request=request)

    assert "No HomePage found" in str(excinfo.value)
