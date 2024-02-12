"""Main Webserver URL definitions."""

from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TestPage.as_view()),
    path('', views.HomePage.as_view())
]
