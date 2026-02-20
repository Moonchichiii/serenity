from django.apps import AppConfig


class CmsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.cms"
    label = "cms"

    def ready(self) -> None:
        import apps.cms.signals  # noqa: F401
