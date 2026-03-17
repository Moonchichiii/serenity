"""
Property-based API smoke testing with Schemathesis.

Uses the current Schemathesis pytest integration and supports either
schema.yml or schema.yaml at the project root.
"""
from __future__ import annotations

import pathlib
from typing import Any

import pytest

schemathesis = pytest.importorskip("schemathesis")

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA_BASENAME_CANDIDATES = ("schema.yml", "schema.yaml")

SCHEMA_PATH = next(
    (
        PROJECT_ROOT / name
        for name in SCHEMA_BASENAME_CANDIDATES
        if (PROJECT_ROOT / name).exists()
    ),
    PROJECT_ROOT / "schema.yml",
)


@pytest.fixture(scope="session")
def loaded_schema() -> Any:
    """Load the OpenAPI schema once per test session."""
    if not SCHEMA_PATH.exists():
        pytest.skip(f"Schema file not found: {SCHEMA_PATH}")
    return schemathesis.openapi.from_path(str(SCHEMA_PATH))


schema = schemathesis.pytest.from_fixture("loaded_schema")


@pytest.mark.e2e
@schema.parametrize()
def test_all_endpoints(case: Any, live_server: Any) -> None:
    """
    Exercise all schema operations against the live Django test server
    and assert they do not return 5xx responses.
    """
    response = case.call(base_url=live_server.url)
    assert response.status_code < 500, (
        f"{case.method} {case.path} returned {response.status_code}"
    )


@pytest.mark.e2e
def test_schema_loads_without_error(loaded_schema: Any) -> None:
    """Sanity check: schema parsed successfully."""
    assert loaded_schema is not None
