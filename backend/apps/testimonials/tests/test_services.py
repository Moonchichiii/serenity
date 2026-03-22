import pytest
from django.test import RequestFactory

from apps.testimonials.models import Testimonial
from apps.testimonials.services import create_reply, create_testimonial


@pytest.fixture()
def rf():
    return RequestFactory()


@pytest.mark.django_db
class TestCreateTestimonial:
    def test_creates_with_correct_fields(self, rf):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "192.168.1.10"

        data = {
            "name": "Sophie",
            "email": "sophie@example.com",
            "rating": 5,
            "text": "Un massage merveilleux, très relaxant.",
        }

        t = create_testimonial(request=request, data=data)

        assert t.pk is not None
        assert t.name == "Sophie"
        assert t.email == "sophie@example.com"
        assert t.rating == 5
        assert t.text == data["text"]
        assert t.status == "pending"
        assert t.ip_address == "192.168.1.10"

    def test_email_defaults_to_empty(self, rf):
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        data = {
            "name": "Luc",
            "rating": 4,
            "text": "Très bonne expérience !",
        }

        t = create_testimonial(request=request, data=data)
        assert t.email == ""

    def test_uses_cf_connecting_ip(self, rf):
        request = rf.post("/")
        request.META["HTTP_CF_CONNECTING_IP"] = "203.0.113.77"

        data = {
            "name": "Eva",
            "email": "",
            "rating": 3,
            "text": "Correct, sans plus.",
        }

        t = create_testimonial(request=request, data=data)
        assert t.ip_address == "203.0.113.77"

    def test_logs_submission(self, rf, caplog):
        import logging

        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "1.2.3.4"

        data = {
            "name": "Hugo",
            "email": "",
            "rating": 5,
            "text": "Parfait, merci beaucoup !",
        }

        with caplog.at_level(
            logging.INFO, logger="apps.testimonials.services"
        ):
            create_testimonial(request=request, data=data)

        assert "Testimonial submitted" in caplog.text
        assert "Hugo" in caplog.text


@pytest.mark.django_db
class TestCreateReply:
    def test_creates_reply_with_correct_fields(self, rf):
        parent = Testimonial.objects.create(
            name="Alice",
            rating=5,
            text="Super massage !",
            status="approved",
        )
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.50"

        data = {
            "name": "Serenity",
            "email": "admin@serenity.test",
            "text": "Merci Alice, à bientôt !",
        }

        reply = create_reply(
            request=request, parent=parent, data=data
        )

        assert reply.pk is not None
        assert reply.parent == parent
        assert reply.name == "Serenity"
        assert reply.email == "admin@serenity.test"
        assert reply.text == data["text"]
        assert reply.status == "pending"
        assert reply.ip_address == "10.0.0.50"

    def test_reply_linked_to_parent(self, rf):
        parent = Testimonial.objects.create(
            name="Bob",
            rating=4,
            text="Très bonne séance.",
            status="approved",
        )
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        data = {
            "name": "Admin",
            "email": "a@b.com",
            "text": "Merci !",
        }

        create_reply(request=request, parent=parent, data=data)
        assert parent.replies.count() == 1

    def test_logs_reply(self, rf, caplog):
        import logging

        parent = Testimonial.objects.create(
            name="Claire",
            rating=5,
            text="Incroyable expérience !!",
            status="approved",
        )
        request = rf.post("/")
        request.META["REMOTE_ADDR"] = "1.1.1.1"

        data = {
            "name": "Staff",
            "email": "staff@serenity.test",
            "text": "Merci Claire !",
        }

        with caplog.at_level(
            logging.INFO, logger="apps.testimonials.services"
        ):
            create_reply(
                request=request, parent=parent, data=data
            )

        assert "Reply submitted" in caplog.text
