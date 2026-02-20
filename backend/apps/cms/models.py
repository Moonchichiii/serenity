"""
apps.cms.models — Compatibility layer for legacy imports.

All model definitions live in their own modules:
  • apps.cms.pages    → HomePage, HeroSlide, Specialty
  • apps.cms.settings → SerenitySettings, GiftSettings

This file re-exports them so that ``from apps.cms.models import HomePage``
continues to work (Django admin autodiscovery, third-party tooling, etc.).
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
