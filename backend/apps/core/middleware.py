from __future__ import annotations

from typing import TYPE_CHECKING

from django.conf import settings

if TYPE_CHECKING:
    from collections.abc import Callable

    from django.http import HttpRequest, HttpResponse


class CacheHeaderMiddleware:
    """
    Development-only middleware that adds an X-Cache-Status header.

    To make this useful, set `response._cache_hit = True` in any view
    or middleware that serves from cache. Otherwise defaults to MISS.
    """

    def __init__(
        self, get_response: Callable[[HttpRequest], HttpResponse]
    ) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)

        if settings.DEBUG:
            cache_hit = getattr(response, '_cache_hit', False)
            response['X-Cache-Status'] = 'HIT' if cache_hit else 'MISS'

        return response
