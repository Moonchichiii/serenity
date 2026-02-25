import pytest
from django.test import RequestFactory


@pytest.fixture()
def rf():
    return RequestFactory()


@pytest.fixture()
def valid_contact_data():
    return {
        "name": "Jean Dupont",
        "email": "jean@example.com",
        "phone": "+33612345678",
        "subject": "Rendez-vous",
        "message": "Bonjour, je souhaite prendre rendez-vous pour un massage.",
    }
