from django.urls import path

from . import views

app_name = "testimonials"

urlpatterns = [
  path("", views.get_testimonials, name="list"),
  path("submit/", views.submit_testimonial, name="submit"),
  path("<int:testimonial_id>/reply/", views.submit_reply, name="submit_reply"),
  path("stats/", views.testimonial_stats_view, name="stats"),
]
