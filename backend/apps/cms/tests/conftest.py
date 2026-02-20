import uuid

import pytest
from wagtail.models import Page, Site

from apps.cms.pages import HeroSlide, HomePage, Specialty
from apps.cms.settings import GiftSettings

pytestmark = pytest.mark.django_db


# ── Helpers (Thread-Safe Slug Generation) ───────────────────────────


def _slug(prefix: str = "home") -> str:
    """Generates unique slugs to prevent DB integrity collisions."""
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


# Alias for external imports in test modules
_unique_slug = _slug


# ── Core Wagtail Scaffolding ───────────────────────────────────────


@pytest.fixture
def wagtail_root():
    """Returns the absolute root of the Wagtail page tree."""
    return Page.get_first_root_node()


@pytest.fixture
def root_page(wagtail_root):
    """Alias for semantic clarity in selector tests."""
    return wagtail_root


@pytest.fixture
def default_site(wagtail_root):
    """
    Standard Enterprise Site configuration.
    Deletes any existing defaults to ensure the test environment
    mirrors a clean production state.
    """
    Site.objects.filter(is_default_site=True).delete()
    return Site.objects.create(
        hostname="example.com",
        root_page=wagtail_root,
        is_default_site=True,
    )


@pytest.fixture
def site(default_site):
    """Alias for general purpose site testing."""
    return default_site


# ── Page fixtures (The "Ground Zero" State) ────────────────────────


@pytest.fixture
def homepage(wagtail_root):
    """Creates a published, live HomePage node."""
    home = HomePage(title="Home", slug=_slug())
    wagtail_root.add_child(instance=home)
    home.save_revision().publish()
    return home


@pytest.fixture
def hero_slides(homepage):
    """Provides deterministic HeroSlide instances for ordering tests."""
    a = HeroSlide.objects.create(
        page=homepage, sort_order=1, title_en="Slide A"
    )
    b = HeroSlide.objects.create(
        page=homepage, sort_order=2, title_en="Slide B"
    )
    return [a, b]


@pytest.fixture
def specialties(homepage):
    """Provides deterministic Specialty instances for ordering tests."""
    a = Specialty.objects.create(
        page=homepage, sort_order=1, title_en="Spec A"
    )
    b = Specialty.objects.create(
        page=homepage, sort_order=2, title_en="Spec B"
    )
    return [a, b]


@pytest.fixture
def homepage_with_content(homepage):
    """
    Compound fixture for tests requiring a pre-hydrated homepage
    state.  Matches the naming conventions used in legacy integration
    tests.
    """
    HeroSlide.objects.create(
        page=homepage, sort_order=2, title_en="B"
    )
    HeroSlide.objects.create(
        page=homepage, sort_order=1, title_en="A"
    )

    Specialty.objects.create(
        page=homepage, sort_order=2, title_en="S2"
    )
    Specialty.objects.create(
        page=homepage, sort_order=1, title_en="S1"
    )
    return homepage


# ── Site Variants ──────────────────────────────────────────────────


@pytest.fixture
def homepage_site(homepage):
    """Covers the selector branch where the Site Root IS the HomePage."""
    return Site.objects.create(
        hostname="homepage.example.com",
        root_page=homepage,
        is_default_site=False,
    )


# ── Settings ───────────────────────────────────────────────────────


@pytest.fixture
def gift_settings(default_site):
    """Ensures Site Settings are always correctly bound to a Site
    instance."""
    return GiftSettings.objects.create(
        site=default_site, is_enabled=True
    )
