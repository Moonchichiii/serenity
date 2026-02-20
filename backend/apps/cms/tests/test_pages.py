import pytest

from apps.cms.pages import HeroSlide, Specialty

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


def test_specialty_str_uses_title_en(homepage):
    spec = Specialty.objects.create(
        page=homepage, sort_order=1, title_en="Sports"
    )
    assert str(spec) == "Sports"


def test_specialty_str_falls_back_to_title_fr(homepage):
    spec = Specialty.objects.create(
        page=homepage, sort_order=1, title_en="", title_fr="Sportif"
    )
    assert str(spec) == "Sportif"


def test_specialty_str_falls_back_to_pk(homepage):
    spec = Specialty.objects.create(
        page=homepage, sort_order=1, title_en="", title_fr=""
    )
    assert str(spec) == f"Specialty {spec.pk}"
