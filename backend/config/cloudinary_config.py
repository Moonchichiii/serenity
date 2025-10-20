"""
Cloudinary responsive image utilities for Serenity
"""

DEVICE_BREAKPOINTS = {
    "mobile": {"width": 640, "quality": 75},
    "tablet": {"width": 1024, "quality": 80},
    "desktop": {"width": 1920, "quality": 85},
}


def get_responsive_url(image_url: str, device: str = "desktop") -> str:
    if not image_url or "cloudinary" not in image_url:
        return image_url

    bp = DEVICE_BREAKPOINTS.get(device, DEVICE_BREAKPOINTS["desktop"])
    parts = image_url.split("/upload/")
    if len(parts) != 2:
        return image_url

    base, path = parts
    path = path.lstrip("/")
    if path.startswith("v1/"):
        path = path[3:]  # strip 'v1/'

    t = f"f_auto,q_auto:{bp['quality']},w_{bp['width']},c_limit"
    return f"{base}/upload/{t}/{path}"


def build_responsive(image_url: str) -> dict:
    if not image_url:
        return {}
    return {
        "mobile": get_responsive_url(image_url, "mobile"),
        "tablet": get_responsive_url(image_url, "tablet"),
        "desktop": get_responsive_url(image_url, "desktop"),
    }


def get_device_from_user_agent(user_agent: str) -> str:
    ua_lower = user_agent.lower()
    if any(m in ua_lower for m in ["mobile", "android", "iphone", "ipod"]):
        return "mobile"
    if any(t in ua_lower for t in ["tablet", "ipad"]):
        return "tablet"
    return "desktop"
