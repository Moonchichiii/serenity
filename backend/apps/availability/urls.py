from django.urls import path

from . import views

urlpatterns = [
    path("busy/", views.busy, name="availability_busy"),
    path("slots/", views.slots, name="availability_slots"),
]
