from django.urls import path

from . import views

app_name = "testimonials"

urlpatterns = [
    path("testimonials/", views.get_testimonials, name="list"),
    path(
        "testimonials/submit/",
        views.submit_testimonial,
        name="submit",
    ),
    path(
        "testimonials/<int:testimonial_id>/reply/",
        views.submit_reply,
        name="submit_reply",
    ),
    path(
        "testimonials/stats/",
        views.testimonial_stats_view,
        name="stats",
    ),
]
