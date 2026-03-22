from __future__ import annotations

import logging
from typing import Any

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Service

logger = logging.getLogger(__name__)


@receiver([post_save, post_delete], sender=Service)
def clear_services_cache(sender: type[Service], **kwargs: Any) -> None:
    """Invalidate the services list cache when any Service changes."""
    cache.delete('cms:services')
    logger.debug('Cache cleared: cms:services')
