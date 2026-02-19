from django.conf import settings


class CacheHeaderMiddleware:
    """
    Development-only middleware that adds an X-Cache-Status header.

    To make this useful, set `response._cache_hit = True` in any view
    or middleware that serves from cache. Otherwise defaults to MISS.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if settings.DEBUG:
            cache_hit = getattr(response, "_cache_hit", False)
            response["X-Cache-Status"] = "HIT" if cache_hit else "MISS"

        return response
