from django.urls import path

from . import views

urlpatterns = [
    path('busy', views.busy),
    path('slots', views.slots),
]
