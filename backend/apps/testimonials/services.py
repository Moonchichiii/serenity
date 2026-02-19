import logging

from django.http import HttpRequest

from apps.core.utils import get_client_ip

from .models import Testimonial, TestimonialReply

logger = logging.getLogger(__name__)


def create_testimonial(
    *, request: HttpRequest, data: dict
) -> Testimonial:
    """
    Create a testimonial pending moderation.

    `data` must already be validated via SubmitTestimonialSerializer.
    """
    testimonial = Testimonial.objects.create(
        name=data["name"],
        email=data.get("email", ""),
        rating=data["rating"],
        text=data["text"],
        status="pending",
        ip_address=get_client_ip(request),
    )

    logger.info("Testimonial submitted: %s (pk=%s)", data["name"], testimonial.pk)
    return testimonial


def create_reply(
    *, request: HttpRequest, parent: Testimonial, data: dict
) -> TestimonialReply:
    """
    Create a reply to a testimonial, pending moderation.

    `data` must already be validated via SubmitReplySerializer.
    """
    reply = TestimonialReply.objects.create(
        parent=parent,
        name=data["name"],
        email=data["email"],
        text=data["text"],
        status="pending",
        ip_address=get_client_ip(request),
    )

    logger.info(
        "Reply submitted on testimonial %s by %s", parent.pk, data["name"]
    )
    return reply
