import pytest

from apps.cms.pages import HeroSlide

pytestmark = pytest.mark.django_db


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
