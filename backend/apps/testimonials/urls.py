from django.urls import path

from . import views

app_name = "testimonials"

urlpatterns = [
    path("api/testimonials/", views.get_testimonials, name="list"),
    path("api/testimonials/submit/", views.submit_testimonial, name="submit"),
    path("api/testimonials/stats/", views.get_testimonial_stats, name="stats"),
]
