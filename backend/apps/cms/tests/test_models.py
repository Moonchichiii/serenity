import pytest

from apps.cms.pages import HeroSlide, HomePage

pytestmark = pytest.mark.django_db


# ── HomePage ────────────────────────────────────────────────────────


def test_homepage_str_uses_title(homepage):
    assert str(homepage) == "Home"


def test_homepage_str_fallback():
    page = HomePage(title="")
    assert str(page) == "HomePage (untitled)"


# ── HeroSlide ───────────────────────────────────────────────────────


def test_hero_slide_str_uses_title_en(homepage):
    slide = HeroSlide.objects.create(
        page=homepage, sort_order=1, title_en="Deep Tissue"
    )
    assert str(slide) == "Deep Tissue"


def test_hero_slide_str_falls_back_to_title_fr(homepage):
    slide = HeroSlide.objects.create(
        page=homepage, sort_order=1, title_en="", title_fr="Massage"
    )
    assert str(slide) == "Massage"


def test_hero_slide_str_falls_back_to_pk(homepage):
    slide = HeroSlide.objects.create(
        page=homepage, sort_order=1, title_en="", title_fr=""
    )
    assert str(slide) == f"Slide {slide.pk}"
