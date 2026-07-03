"""Stable API error contract (Form UX phase, prompt 03).

Every validation failure now ALSO carries a machine-readable list:

    {"errors": [{"code": "...", "field": "...", "message": "..."}], ...}

The legacy DRF field-map shape is kept alongside so the current
frontend keeps working until it migrates to code-based i18n mapping.
Throttled responses become {"errors": [{"code": "rate_limited", ...}]}.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from rest_framework.exceptions import Throttled, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler

if TYPE_CHECKING:
    from rest_framework.response import Response

NON_FIELD = "non_field_errors"


def _walk(field: str | None, item: Any, out: list[dict[str, Any]]) -> None:
    if isinstance(item, list):
        for entry in item:
            _walk(field, entry, out)
    elif isinstance(item, dict):
        for key, value in item.items():
            child = key if field in (None, NON_FIELD) else f"{field}.{key}"
            _walk(child, value, out)
    else:
        out.append(
            {
                "code": str(getattr(item, "code", "") or "invalid"),
                "field": None if field == NON_FIELD else field,
                "message": str(item),
            }
        )


def api_exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError):
        errors: list[dict[str, Any]] = []
        detail = exc.detail
        if isinstance(detail, dict):
            for field, value in detail.items():
                _walk(str(field), value, errors)
        else:
            _walk(None, detail, errors)

        data = (
            dict(response.data)
            if isinstance(response.data, dict)
            else {"detail": response.data}
        )
        data["errors"] = errors
        response.data = data

    elif isinstance(exc, Throttled):
        response.data = {
            "detail": response.data.get("detail")
            if isinstance(response.data, dict)
            else None,
            "errors": [
                {
                    "code": "rate_limited",
                    "field": None,
                    "message": "Too many requests. Please try again later.",
                    "params": {"wait_seconds": getattr(exc, "wait", None)},
                }
            ],
        }

    return response
