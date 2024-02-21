"""API URL definitions."""

from django.urls import path
from . import views

urlpatterns = [
    path('climate/', views.ClimateJson.as_view()),
    path('3body/', views.ThreeBodyJson.as_view()),
]
