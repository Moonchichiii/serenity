import pytest

from apps.cms.serializers import (
    GiftSettingsSerializer,
    HeroSlideSerializer,
    HomePageSerializer,
    SpecialtySerializer,
)

pytestmark = pytest.mark.django_db


# ── HeroSlideSerializer ─────────────────────────────────────────────

def test_hero_slide_serializer_no_image():
    slide = type(
        "S",
        (),
        {
            "image": None,
            "title_en": "t",
            "title_fr": "",
            "subtitle_en": "",
            "subtitle_fr": "",
        },
    )()
    data = HeroSlideSerializer(slide).data
    assert data["image"] is None


def test_hero_slide_serializer_image_url_exception():
    """When image.file raises, src should be None (not crash)."""

    class BrokenImg:
        title = "oops"
        width = 100
        height = 100

        @property
        def file(self):
            raise RuntimeError("boom")

    slide = type(
        "S",
        (),
        {
            "image": BrokenImg(),
            "title_en": "t",
            "title_fr": "",
            "subtitle_en": "",
            "subtitle_fr": "",
        },
    )()
    data = HeroSlideSerializer(slide).data
    assert data["image"]["src"] is None
    assert data["image"]["title"] == "oops"


# ── SpecialtySerializer ─────────────────────────────────────────────

def test_specialty_serializer_no_image():
    spec = type(
        "Sp",
        (),
        {"title_en": "Sports", "title_fr": "Sportif", "image": None},
    )()
    data = SpecialtySerializer(spec).data
    assert data["image"] is None
    assert data["title_en"] == "Sports"


# ── HomePageSerializer ──────────────────────────────────────────────

def test_homepage_serializer_orders_related_items(homepage, hero_slides, specialties):
    payload = HomePageSerializer(homepage, context={"request": None}).data
    assert [s["title_en"] for s in payload["hero_slides"]] == [
        "Slide A",
        "Slide B",
    ]
    assert [s["title_en"] for s in payload["specialties"]] == [
        "Spec A",
        "Spec B",
    ]


def test_services_hero_video_url_handles_no_file(homepage):
    payload = HomePageSerializer(homepage).data
    assert payload["services_hero_video_url"] is None


def test_services_hero_video_url_handles_exception(homepage):
    class BrokenFile:
        @property
        def url(self):
            raise RuntimeError("boom")

    homepage.services_hero_video_file = BrokenFile()
    serializer = HomePageSerializer()
    assert serializer.get_services_hero_video_url(homepage) is None


# ── GiftSettingsSerializer ──────────────────────────────────────────

def test_gift_settings_serializer_no_icon_returns_none(gift_settings):
    payload = GiftSettingsSerializer(gift_settings).data
    assert payload["floating_icon"] is None


def test_gift_settings_serializer_cloudinary_success(monkeypatch, gift_settings):
    class DummyFile:
        name = "serenity/icon"

    class DummyImg:
        title = "Icon"
        file = DummyFile()
        width = 150
        height = 150

    class FakeSettings:
        floating_icon = DummyImg()

    def fake_cloudinary_url(public_id, **kwargs):
        return ("https://cdn.example/icon.webp", {})

    import apps.core.images as img_mod

    monkeypatch.setattr(img_mod.cloudinary.utils, "cloudinary_url", fake_cloudinary_url)

    serializer = GiftSettingsSerializer()
    result = serializer.get_floating_icon(FakeSettings())

    assert result["src"] == "https://cdn.example/icon.webp"
    assert result["title"] == "Icon"
    assert result["sizes"] == "150px"
    assert result["srcset"] is not None


def test_gift_settings_serializer_cloudinary_failure(monkeypatch, gift_settings):
    class DummyFile:
        name = "serenity/icon"

    class DummyImg:
        title = "Icon"
        file = DummyFile()

    class FakeSettings:
        floating_icon = DummyImg()

    import apps.core.images as img_mod

    def boom(*args, **kwargs):
        raise RuntimeError("fail")

    monkeypatch.setattr(img_mod.cloudinary.utils, "cloudinary_url", boom)

    serializer = GiftSettingsSerializer()
    result = serializer.get_floating_icon(FakeSettings())

    assert result is None
