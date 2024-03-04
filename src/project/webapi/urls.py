"""API URL definitions."""

from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings
BASE_DIR = settings.BASE_DIR

urlpatterns = [
    path('climate/', views.ClimateJson.as_view()),
]   + static('climate2/', document_root = BASE_DIR / 'webapi/static/large_data/climate2') \
    + static('3body/', document_root = BASE_DIR / 'webapi/static/large_data/3body')
