import pytest
from django.test import RequestFactory

from apps.testimonials.models import Testimonial, TestimonialReply


@pytest.fixture()
def rf():
    return RequestFactory()


@pytest.fixture()
def approved_testimonial(db):
    return Testimonial.objects.create(
        name="Alice",
        email="alice@example.com",
        rating=5,
        text="Excellent massage, très relaxant !",
        status="approved",
        ip_address="10.0.0.1",
    )


@pytest.fixture()
def pending_testimonial(db):
    return Testimonial.objects.create(
        name="Bob",
        email="bob@example.com",
        rating=4,
        text="Très bien, je recommande.",
        status="pending",
        ip_address="10.0.0.2",
    )


@pytest.fixture()
def approved_reply(db, approved_testimonial):
    return TestimonialReply.objects.create(
        parent=approved_testimonial,
        name="Serenity",
        email="admin@serenity.test",
        text="Merci Alice !",
        status="approved",
        ip_address="10.0.0.99",
    )
