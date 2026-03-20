"""
Property-based public API smoke testing with Schemathesis.

This test is intentionally scoped to public /api/ endpoints and normal
HTTP methods. It excludes CMS/Wagtail admin routes and skips odd methods
such as TRACE that are not part of the supported public contract.
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

ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}


@pytest.fixture(scope="session")
def loaded_schema() -> Any:
    """Load the OpenAPI schema once per test session."""
    if not SCHEMA_PATH.exists():
        pytest.skip(f"Schema file not found: {SCHEMA_PATH}")
    return schemathesis.openapi.from_path(str(SCHEMA_PATH))


schema = schemathesis.pytest.from_fixture("loaded_schema")


@pytest.mark.e2e
@pytest.mark.django_db(transaction=True)
@schema.parametrize()
def test_all_endpoints(
    case: Any,
    live_server: Any,
    transactional_db: Any,
) -> None:
    """
    Exercise public schema operations against the live Django test server
    and assert they do not return 5xx responses.
    """
    method = case.method.upper()
    path = case.path

    # Scope this smoke test to the public API only.
    if not path.startswith("/api/"):
        pytest.skip(f"Skipping non-public path: {path}")

    # Skip methods outside the application's supported public contract.
    if method not in ALLOWED_METHODS:
        pytest.skip(f"Skipping unsupported method: {method} {path}")

    response = case.call(
        base_url=live_server.url,
        timeout=10,
    )

    assert response.status_code < 500, (
        f"{method} {path} returned {response.status_code}"
    )


@pytest.mark.e2e
def test_schema_loads_without_error(loaded_schema: Any) -> None:
    """Sanity check: schema parsed successfully."""
    assert loaded_schema is not None
