"""
Cloudinary responsive image utilities for Serenity
"""

# Device breakpoints for responsive images
DEVICE_BREAKPOINTS = {
    "mobile": {"width": 640, "quality": 75},
    "tablet": {"width": 1024, "quality": 80},
    "desktop": {"width": 1920, "quality": 85},
}


def get_responsive_url(image_url: str, device: str = "desktop") -> str:
    """
    Transform Cloudinary URL for responsive delivery

    Args:
        image_url: Original Cloudinary URL
        device: 'mobile', 'tablet', or 'desktop'

    Returns:
        Optimized Cloudinary URL with transformations
    """
    if not image_url or "cloudinary" not in image_url:
        return image_url

    breakpoint = DEVICE_BREAKPOINTS.get(device, DEVICE_BREAKPOINTS["desktop"])

    # Cloudinary URL transformation format:
    # https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
    parts = image_url.split("/upload/")
    if len(parts) != 2:
        return image_url

    base, path = parts
    transformations = f"f_auto,q_auto:{breakpoint['quality']},w_{breakpoint['width']},c_limit,dpr_auto"

    return f"{base}/upload/{transformations}/{path}"


def get_device_from_user_agent(user_agent: str) -> str:
    """Detect device type from User-Agent header"""
    ua_lower = user_agent.lower()

    if any(mobile in ua_lower for mobile in ["mobile", "android", "iphone", "ipod"]):
        return "mobile"
    elif any(tablet in ua_lower for tablet in ["tablet", "ipad"]):
        return "tablet"
    return "desktop"
