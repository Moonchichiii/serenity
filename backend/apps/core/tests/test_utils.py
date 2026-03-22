from __future__ import annotations

from django.test import RequestFactory

from apps.core.utils import get_client_ip, safe_format

# ── get_client_ip ──────────────────────────────────────────────


class TestGetClientIP:
    def _make_request(self, **meta: str):
        rf = RequestFactory()
        req = rf.get("/")
        req.META.update(meta)
        return req

    def test_cf_connecting_ip_takes_priority(self):
        req = self._make_request(
            HTTP_CF_CONNECTING_IP="1.1.1.1",
            HTTP_X_FORWARDED_FOR="2.2.2.2, 3.3.3.3",
            REMOTE_ADDR="4.4.4.4",
        )
        assert get_client_ip(req) == "1.1.1.1"

    def test_xff_used_when_no_cf_header(self):
        req = self._make_request(
            HTTP_X_FORWARDED_FOR="10.0.0.1, 10.0.0.2",
            REMOTE_ADDR="4.4.4.4",
        )
        assert get_client_ip(req) == "10.0.0.1"

    def test_xff_strips_whitespace(self):
        req = self._make_request(
            HTTP_X_FORWARDED_FOR="  9.9.9.9 , 8.8.8.8",
        )
        assert get_client_ip(req) == "9.9.9.9"

    def test_remote_addr_fallback(self):
        req = self._make_request(REMOTE_ADDR="127.0.0.1")
        # Remove any proxy headers that RequestFactory might set
        req.META.pop("HTTP_CF_CONNECTING_IP", None)
        req.META.pop("HTTP_X_FORWARDED_FOR", None)
        assert get_client_ip(req) == "127.0.0.1"

    def test_unknown_when_nothing_set(self):
        req = self._make_request()
        req.META.pop("HTTP_CF_CONNECTING_IP", None)
        req.META.pop("HTTP_X_FORWARDED_FOR", None)
        req.META.pop("REMOTE_ADDR", None)
        assert get_client_ip(req) == "unknown"


# ── safe_format ────────────────────────────────────────────────


class TestSafeFormat:
    def test_basic_substitution(self):
        assert safe_format("Hello {name}!", name="World") == "Hello World!"

    def test_multiple_keys(self):
        result = safe_format("{a}-{b}", a="1", b="2")
        assert result == "1-2"

    def test_missing_key_returns_original(self):
        template = "Hello {missing}!"
        assert safe_format(template) == template

    def test_empty_string_returns_empty(self):
        assert safe_format("") == ""

    def test_none_like_empty(self):
        # empty string is falsy
        assert safe_format("") == ""

    def test_malformed_braces_returns_original(self):
        template = "Hello {name!!"
        assert safe_format(template, name="X") == template

    def test_index_error_returns_original(self):
        template = "Hello {0}"
        assert safe_format(template) == template

    def test_no_placeholders(self):
        assert safe_format("plain text", foo="bar") == "plain text"
