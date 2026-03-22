from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from apps.core.images import (
    DEFAULT_SIZES,
    _cloudinary_image_url,
    _cloudinary_public_id,
    _file_url,
    serialize_image,
)

# ── helpers ────────────────────────────────────────────────────


def _fake_image(
    *,
    title: str = "Test",
    width: int = 1920,
    height: int = 1080,
    file_name: str | None = "images/test.jpg",
    file_url: str | None = "https://cdn.example.com/test.jpg",
):
    """Build a lightweight stand-in for a Wagtail Image."""
    img = SimpleNamespace(title=title, width=width, height=height)
    if file_name is not None:
        img.file = SimpleNamespace(name=file_name, url=file_url)
    else:
        img.file = None
    return img


# ── _file_url ──────────────────────────────────────────────────


class TestFileUrl:
    def test_returns_url(self):
        img = _fake_image()
        assert _file_url(img) == "https://cdn.example.com/test.jpg"

    def test_returns_none_when_no_file(self):
        img = _fake_image(file_name=None)
        assert _file_url(img) is None

    def test_returns_none_on_exception(self):
        img = MagicMock()
        type(img).file = property(lambda self: (_ for _ in ()).throw(OSError))
        assert _file_url(img) is None


# ── _cloudinary_public_id ─────────────────────────────────────


class TestCloudinaryPublicId:
    def test_extracts_public_id(self):
        img = _fake_image(file_name="images/photo.jpg")
        assert _cloudinary_public_id(img) == "images/photo.jpg"

    def test_rejects_media_prefix(self):
        img = _fake_image(file_name="media/photo.jpg")
        assert _cloudinary_public_id(img) is None

    def test_rejects_media_backslash_prefix(self):
        img = _fake_image(file_name="media\\photo.jpg")
        assert _cloudinary_public_id(img) is None

    def test_rejects_leading_slash(self):
        img = _fake_image(file_name="/photo.jpg")
        assert _cloudinary_public_id(img) is None

    def test_returns_none_when_no_file(self):
        img = _fake_image(file_name=None)
        assert _cloudinary_public_id(img) is None

    def test_returns_none_on_exception(self):
        img = MagicMock()
        type(img).file = property(lambda self: (_ for _ in ()).throw(OSError))
        assert _cloudinary_public_id(img) is None


# ── _cloudinary_image_url ─────────────────────────────────────


class TestCloudinaryImageUrl:
    @patch("apps.core.images.cloudinary.utils.cloudinary_url")
    def test_builds_url_eco_quality(self, mock_url):
        mock_url.return_value = ("https://res.cloudinary.com/test/w_640", {})
        result = _cloudinary_image_url("images/test.jpg", 640)
        assert result == "https://res.cloudinary.com/test/w_640"
        mock_url.assert_called_once_with(
            "images/test.jpg",
            width=640,
            crop="fill",
            gravity="auto",
            quality="auto:eco",
            fetch_format="auto",
            flags="progressive",
            secure=True,
        )

    @patch("apps.core.images.cloudinary.utils.cloudinary_url")
    def test_builds_url_good_quality(self, mock_url):
        mock_url.return_value = ("https://res.cloudinary.com/test/w_640", {})
        _cloudinary_image_url("images/test.jpg", 640, quality="good")
        mock_url.assert_called_once()
        call_kwargs = mock_url.call_args[1]
        assert call_kwargs["quality"] == "auto:good"


# ── serialize_image ────────────────────────────────────────────


class TestSerializeImage:
    def test_none_input_returns_none(self):
        assert serialize_image(None) is None

    @patch("apps.core.images._cloudinary_public_id", return_value=None)
    def test_fallback_without_cloudinary(self, _mock_pid):
        img = _fake_image()
        result = serialize_image(img)
        assert result is not None
        assert result["title"] == "Test"
        assert result["src"] == "https://cdn.example.com/test.jpg"
        assert result["srcset"] is None
        assert result["sizes"] is None

    @patch(
        "apps.core.images._cloudinary_image_url",
        side_effect=lambda pid, w, **kw: f"https://cdn/{pid}/{w}",
    )
    @patch(
        "apps.core.images._cloudinary_public_id",
        return_value="images/test.jpg",
    )
    def test_full_cloudinary_serialization(self, _mock_pid, _mock_url):
        img = _fake_image()
        result = serialize_image(img, widths=[320, 640, 960])
        assert result["src"] == "https://cdn/images/test.jpg/960"
        assert "320w" in result["srcset"]
        assert "640w" in result["srcset"]
        assert "960w" in result["srcset"]
        assert result["sizes"] == DEFAULT_SIZES
        assert result["width"] == 1920
        assert result["height"] == 1080

    @patch(
        "apps.core.images._cloudinary_image_url",
        side_effect=lambda pid, w, **kw: f"https://cdn/{pid}/{w}",
    )
    @patch(
        "apps.core.images._cloudinary_public_id",
        return_value="images/test.jpg",
    )
    def test_empty_widths_defaults_to_640(self, _mock_pid, _mock_url):
        img = _fake_image()
        result = serialize_image(img, widths=[])
        assert result["src"] == "https://cdn/images/test.jpg/640"

    @patch(
        "apps.core.images._cloudinary_image_url",
        side_effect=lambda pid, w, **kw: f"https://cdn/{pid}/{w}",
    )
    @patch(
        "apps.core.images._cloudinary_public_id",
        return_value="images/test.jpg",
    )
    def test_single_width(self, _mock_pid, _mock_url):
        img = _fake_image()
        result = serialize_image(img, widths=[800])
        # min(2, len-1) → min(2, 0) → index 0
        assert result["src"] == "https://cdn/images/test.jpg/800"

    @patch(
        "apps.core.images._cloudinary_image_url",
        side_effect=Exception("boom"),
    )
    @patch(
        "apps.core.images._cloudinary_public_id",
        return_value="images/test.jpg",
    )
    def test_returns_none_on_cloudinary_exception(self, _mock_pid, _mock_url):
        img = _fake_image()
        assert serialize_image(img) is None

    @patch(
        "apps.core.images._cloudinary_image_url",
        side_effect=lambda pid, w, **kw: f"https://cdn/{pid}/{w}",
    )
    @patch(
        "apps.core.images._cloudinary_public_id",
        return_value="images/test.jpg",
    )
    def test_custom_sizes_string(self, _mock_pid, _mock_url):
        img = _fake_image()
        result = serialize_image(img, sizes="100vw", widths=[640])
        assert result["sizes"] == "100vw"
