from django.urls import path

from . import views

app_name = "testimonials"


urlpatterns = [
    path("testimonials/", views.get_testimonials, name="list"),
    path("testimonials/submit/", views.submit_testimonial, name="submit"),
    path("testimonials/stats/", views.get_testimonial_stats, name="stats"),
]
