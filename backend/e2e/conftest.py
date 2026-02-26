import pytest


@pytest.fixture(autouse=True)
def _enable_debug_for_schema(settings):
    """Schema endpoint is only available when DEBUG=True."""
    settings.DEBUG = True
