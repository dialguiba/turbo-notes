import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    """Clear DRF throttle cache between tests to prevent cross-test 429s."""
    yield
    cache.clear()
