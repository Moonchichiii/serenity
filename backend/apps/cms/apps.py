"""
apps.cms.apps — Django AppConfig for the CMS app.
"""

from django.apps import AppConfig


class CmsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.cms"
    label = "cms"

    def ready(self) -> None:
        # Signal-based cache invalidation is prepared in signals.py
        # but currently disabled.  Uncomment the import below to
        # activate it:
        #
        #   import apps.cms.signals
        pass
