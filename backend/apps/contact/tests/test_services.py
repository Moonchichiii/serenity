from unittest.mock import patch

import pytest
from django.core import mail
from django.test import override_settings

from apps.contact.models import ContactSubmission
from apps.contact.services import _send_notification_email, create_submission

EMAIL_BACKEND_LOCMEM = (
    "django.core.mail.backends.locmem.EmailBackend"
)


@pytest.mark.django_db
class TestCreateSubmission:
    def test_creates_with_correct_fields(self, rf, valid_contact_data):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        sub = create_submission(
            request=request, data=valid_contact_data
        )

        assert sub.pk is not None
        assert sub.name == "Jean Dupont"
        assert sub.email == "jean@example.com"
        assert sub.phone == "+33612345678"
        assert sub.subject == "Rendez-vous"
        assert sub.message == valid_contact_data["message"]
        assert sub.ip_address == "192.168.1.1"

    def test_phone_defaults_to_empty_string(self, rf):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"
        data = {
            "name": "Marie",
            "email": "m@example.com",
            "subject": "Info",
            "message": "Un message assez long pour le test.",
        }

        sub = create_submission(request=request, data=data)
        assert sub.phone == ""

    def test_uses_cf_connecting_ip(self, rf, valid_contact_data):
        request = rf.post("/")
        request.META["HTTP_CF_CONNECTING_IP"] = "203.0.113.50"

        sub = create_submission(
            request=request, data=valid_contact_data
        )
        assert sub.ip_address == "203.0.113.50"

    @patch("apps.contact.services._send_notification_email")
    def test_calls_notification_email(
        self, mock_send, rf, valid_contact_data
    ):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        sub = create_submission(
            request=request, data=valid_contact_data
        )
        mock_send.assert_called_once_with(sub, "10.0.0.1")

    @patch(
        "apps.contact.services._send_notification_email",
        side_effect=Exception("SMTP down"),
    )
    def test_email_failure_does_not_raise(
        self, mock_send, rf, valid_contact_data
    ):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        sub = create_submission(
            request=request, data=valid_contact_data
        )
        assert sub.pk is not None
        assert ContactSubmission.objects.count() == 1

    @patch(
        "apps.contact.services._send_notification_email",
        side_effect=Exception("boom"),
    )
    def test_email_failure_logs_exception(
        self, mock_send, rf, valid_contact_data, caplog
    ):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        import logging

        with caplog.at_level(logging.ERROR, logger="apps.contact.services"):
            create_submission(
                request=request, data=valid_contact_data
            )

        assert "Failed to send contact notification email" in caplog.text


@pytest.mark.django_db
class TestSendNotificationEmail:
    @override_settings(
        EMAIL_BACKEND=EMAIL_BACKEND_LOCMEM,
        DEFAULT_FROM_EMAIL="noreply@serenity.test",
        EMAIL_HOST_USER="admin@serenity.test",
    )
    def test_sends_email_with_correct_fields(self):
        sub = ContactSubmission.objects.create(
            name="Marie",
            email="marie@example.com",
            phone="0612345678",
            subject="Question",
            message="Ceci est mon message.",
            ip_address="1.2.3.4",
        )

        _send_notification_email(sub, "1.2.3.4")

        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        assert email.subject == "[Serenity] Nouvelle demande: Question"
        assert email.from_email == "noreply@serenity.test"
        assert email.to == ["admin@serenity.test"]
        assert email.reply_to == ["marie@example.com"]

    @override_settings(
        EMAIL_BACKEND=EMAIL_BACKEND_LOCMEM,
        DEFAULT_FROM_EMAIL="noreply@serenity.test",
        EMAIL_HOST_USER="admin@serenity.test",
    )
    def test_email_body_contains_submission_details(self):
        sub = ContactSubmission.objects.create(
            name="Pierre",
            email="pierre@example.com",
            phone="",
            subject="Tarifs",
            message="Quels sont vos tarifs ?",
            ip_address="5.6.7.8",
        )

        _send_notification_email(sub, "5.6.7.8")

        body = mail.outbox[0].body
        assert "Nom: Pierre" in body
        assert "Email: pierre@example.com" in body
        assert "Sujet: Tarifs" in body
        assert "Quels sont vos tarifs ?" in body
        assert "IP: 5.6.7.8" in body

    @override_settings(
        EMAIL_BACKEND=EMAIL_BACKEND_LOCMEM,
        DEFAULT_FROM_EMAIL="noreply@serenity.test",
        EMAIL_HOST_USER="admin@serenity.test",
    )
    def test_send_raises_on_failure(self):
        sub = ContactSubmission.objects.create(
            name="X",
            email="x@example.com",
            phone="",
            subject="S",
            message="msg",
            ip_address="1.1.1.1",
        )

        with patch(
            "apps.contact.services.EmailMessage.send",
            side_effect=Exception("connection refused"),
        ):
            with pytest.raises(Exception, match="connection refused"):
                _send_notification_email(sub, "1.1.1.1")
