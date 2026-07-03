from collections.abc import Iterator

import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _isolated_cache() -> Iterator[None]:
    """Every test starts with an empty cache.

    Throttle counters (DRF AnonRateThrottle) live in the default cache;
    without this, tests poison each other's rate windows and the suite
    only passes by accident of ordering.
    """
    cache.clear()
    yield
