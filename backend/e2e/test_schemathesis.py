"""
Property-based API testing with Schemathesis.

Handles version mismatches across schemathesis 2.x / 3.x by probing
multiple import paths for the schema loader.
"""
from __future__ import annotations

import logging
import pathlib
from typing import Any

import pytest

logger = logging.getLogger(__name__)

SCHEMA_PATH = (
    pathlib.Path(__file__).resolve().parent.parent / "schema.yaml"
)


# ── Safely resolve the loader across schemathesis versions ───


def _try_import(dotted_path: str) -> Any | None:
    """Return the callable at *dotted_path*, or ``None`` on failure."""
    parts = dotted_path.rsplit(".", 1)
    if len(parts) != 2:
        return None
    module_path, attr = parts
    try:
        import importlib

        mod = importlib.import_module(module_path)
        return getattr(mod, attr, None)
    except (ImportError, ModuleNotFoundError):
        return None


def load_schema_safely(
    path: str | pathlib.Path | None = None,
    url: str | None = None,
) -> Any:
    """
    Attempt to load an OpenAPI schema via several import paths to cope
    with breaking changes between schemathesis releases.

    Raises ``RuntimeError`` if no loader can be found.
    """
    loader_candidates_path = [
        "schemathesis.specs.openapi.loaders.from_path",  # 3.x
        "schemathesis.from_path",  # 2.x
    ]
    loader_candidates_url = [
        "schemathesis.specs.openapi.loaders.from_url",  # 3.x
        "schemathesis.from_url",
        "schemathesis.from_uri",  # 2.x
    ]

    if path is not None:
        for candidate in loader_candidates_path:
            loader = _try_import(candidate)
            if loader is not None:
                logger.info("Using schema loader: %s", candidate)
                return loader(str(path))

    if url is not None:
        for candidate in loader_candidates_url:
            loader = _try_import(candidate)
            if loader is not None:
                logger.info("Using schema loader: %s", candidate)
                return loader(url)

    raise RuntimeError(
        "Could not find a working schemathesis schema loader. "
        "Tried path candidates: "
        f"{loader_candidates_path} and URL candidates: "
        f"{loader_candidates_url}"
    )


# ── Fixtures ─────────────────────────────────────────────────

schemathesis = pytest.importorskip("schemathesis")


@pytest.fixture(scope="session")
def loaded_schema():
    """Load the OpenAPI schema once per test session."""
    if not SCHEMA_PATH.exists():
        pytest.skip(f"Schema file not found: {SCHEMA_PATH}")
    return load_schema_safely(path=SCHEMA_PATH)


# ── Tests ────────────────────────────────────────────────────


@pytest.mark.e2e
@pytest.mark.skipif(
    not SCHEMA_PATH.exists(),
    reason="schema.yaml not present",
)
class TestOpenAPISchema:
    """
    Run every operation described in the OpenAPI schema against the
    live Django test server.
    """

    def test_all_endpoints(self, loaded_schema, live_server):
        """
        Iterate through all operations and assert none return 5xx.
        """
        has_any = False

        # schemathesis 3.x exposes get_all_operations / as_strategy;
        # 2.x exposes get_all_tests.  Try both.
        if hasattr(loaded_schema, "get_all_operations"):
            for operation in loaded_schema.get_all_operations():
                has_any = True
                case = operation.make_case(base_url=live_server.url)
                response = case.call()
                assert response.status_code < 500, (
                    f"{case.method} {case.path} returned "
                    f"{response.status_code}"
                )
        elif hasattr(loaded_schema, "get_all_tests"):
            for endpoint, test_func in loaded_schema.get_all_tests(
                base_url=live_server.url
            ):
                has_any = True
                test_func()
        else:
            pytest.skip(
                "Loaded schema exposes neither get_all_operations "
                "nor get_all_tests"
            )

        if not has_any:
            pytest.skip("No operations found in schema")

    def test_schema_loads_without_error(self, loaded_schema):
        """Sanity check: schema parsed successfully."""
        assert loaded_schema is not None
