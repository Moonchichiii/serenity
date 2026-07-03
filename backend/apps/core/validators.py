"""Shared field validators for the public forms (prompt 03)."""

from rest_framework import serializers


def validate_no_newlines(value: str) -> None:
    """Reject CR/LF — fields like `subject` end up in email headers,
    where line breaks enable header injection (extra Bcc/Subject)."""
    if "\r" in value or "\n" in value:
        raise serializers.ValidationError(
            "Line breaks are not allowed in this field.", code="invalid"
        )
