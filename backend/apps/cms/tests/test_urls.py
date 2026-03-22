from django.urls import reverse


def test_hydrated_url_reverses():
    assert reverse("homepage-hydrated") == "/api/homepage/hydrated/"
