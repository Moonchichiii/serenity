from django.urls import reverse


def test_homepage_url_reverses():
    assert reverse("homepage") == "/api/homepage/"


def test_hydrated_url_reverses():
    assert reverse("homepage-hydrated") == "/api/homepage/hydrated/"


def test_services_url_reverses():
    assert reverse("services") == "/api/services/"


def test_globals_url_reverses():
    assert reverse("cms-globals") == "/api/globals/"
