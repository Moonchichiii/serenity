from django.apps import AppConfig


class VouchersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.vouchers"

    def ready(self) -> None:
        import apps.vouchers.signals  # noqa: F401
