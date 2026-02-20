"""
apps.cms.models - Compatibility layer for legacy imports.
Model definitions in apps.cms.pages and apps.cms.settings.
"""

from .pages import HeroSlide, HomePage, Specialty
from .settings import GiftSettings, SerenitySettings

__all__ = [
    "GiftSettings",
    "HeroSlide",
    "HomePage",
    "SerenitySettings",
    "Specialty",
]
