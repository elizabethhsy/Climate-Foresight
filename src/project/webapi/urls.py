"""API URL definitions."""

from django.urls import path
from . import views

urlpatterns = [
    path('climate/', views.ClimateJson.as_view())
]
