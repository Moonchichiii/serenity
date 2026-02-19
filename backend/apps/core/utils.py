from django.http import HttpRequest


def get_client_ip(request: HttpRequest) -> str:
    """
    Resolve the client IP from the request.

    Priority:
      1. CF-Connecting-IP  (Cloudflare proxy)
      2. X-Forwarded-For   (generic reverse proxy — first entry)
      3. REMOTE_ADDR        (direct connection)
    """
    if cf_ip := request.META.get("HTTP_CF_CONNECTING_IP"):
        return cf_ip

    if xff := request.META.get("HTTP_X_FORWARDED_FOR"):
        return xff.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR", "unknown")


def safe_format(template: str, **kwargs) -> str:
    """
    Format a CMS-authored string without crashing on malformed braces.

    Returns the original string if formatting fails.
    """
    if not template:
        return ""
    try:
        return template.format(**kwargs)
    except (KeyError, IndexError, ValueError):
        return template
