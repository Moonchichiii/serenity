import pytest
from pytest_django.fixtures import SettingsWrapper


@pytest.fixture(autouse=True)
def _enable_debug_for_schema(settings: SettingsWrapper) -> None:
    """Schema endpoint is only available when DEBUG=True."""
    settings.DEBUG = True
