from __future__ import annotations

from django.test import RequestFactory, override_settings

from apps.core.middleware import CacheHeaderMiddleware


def _make_middleware(*, response_attrs: dict | None = None):
    """Build middleware with a stub get_response."""
    from django.http import HttpResponse

    def get_response(request):
        resp = HttpResponse("ok")
        for k, v in (response_attrs or {}).items():
            setattr(resp, k, v)
        return resp

    return CacheHeaderMiddleware(get_response)


class TestCacheHeaderMiddleware:
    @override_settings(DEBUG=True)
    def test_miss_header_when_debug_and_no_cache_hit(self):
        mw = _make_middleware()
        request = RequestFactory().get("/")
        resp = mw(request)
        assert resp["X-Cache-Status"] == "MISS"

    @override_settings(DEBUG=True)
    def test_hit_header_when_debug_and_cache_hit(self):
        mw = _make_middleware(
            response_attrs={"_cache_hit": True}
        )
        request = RequestFactory().get("/")
        resp = mw(request)
        assert resp["X-Cache-Status"] == "HIT"

    @override_settings(DEBUG=False)
    def test_no_header_when_not_debug(self):
        mw = _make_middleware()
        request = RequestFactory().get("/")
        resp = mw(request)
        assert resp.get("X-Cache-Status") is None

    @override_settings(DEBUG=True)
    def test_cache_hit_false_treated_as_miss(self):
        mw = _make_middleware(
            response_attrs={"_cache_hit": False}
        )
        request = RequestFactory().get("/")
        resp = mw(request)
        assert resp["X-Cache-Status"] == "MISS"
