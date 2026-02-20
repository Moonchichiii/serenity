from __future__ import annotations

import logging
from typing import Any

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Testimonial, TestimonialReply

logger = logging.getLogger(__name__)


def _clear_testimonials_list_cache() -> None:
    """Clear all rating-filtered testimonials list cache keys."""
    for rating in range(6):
        cache.delete(f'testimonials:list:{rating}')


def _clear_hydrated_cache() -> None:
    """Clear CMS hydrated endpoint caches for all Wagtail sites."""
    from wagtail.models import Site

    site_ids = list(Site.objects.values_list('id', flat=True)) or [0]
    for site_id in site_ids:
        cache.delete(f'cms:hydrated:{site_id}:all')


def _invalidate_all() -> None:
    """Surgical cache invalidation for testimonials data."""
    _clear_testimonials_list_cache()
    _clear_hydrated_cache()
    logger.debug('Cache cleared: testimonials + hydrated')


@receiver([post_save, post_delete], sender=Testimonial)
def on_testimonial_change(sender: type[Testimonial], **kwargs: Any) -> None:
    """Invalidate caches when a Testimonial is created, updated, or deleted."""
    _invalidate_all()


@receiver([post_save, post_delete], sender=TestimonialReply)
def on_reply_change(sender: type[TestimonialReply], **kwargs: Any) -> None:
    """Invalidate caches when a TestimonialReply is created, updated, or deleted."""
    _invalidate_all()
