from django.conf import settings


class CacheHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add X-Cache-Status header in dev
        if settings.DEBUG:
            if hasattr(response, "_cache_hit"):
                response["X-Cache-Status"] = "HIT"
            else:
                response["X-Cache-Status"] = "MISS"

        return response
