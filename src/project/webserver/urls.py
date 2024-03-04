"""Main Webserver URL definitions."""

from django.urls import include, path
from . import views

from django.contrib.auth import views as auth_views

urlpatterns = [
    path('test/', views.TestPage.as_view()),

    # path("account/", include("django.contrib.auth.urls")),
    path(
        "account/login/",
        auth_views.LoginView.as_view(next_page="/"),
        name="login"
    ),
    path(
        "account/logout/",
        auth_views.LogoutView.as_view(next_page="/"),
        name="logout",
    ),

    path("models/list/", views.ModelList.as_view()),
    path("models/builtin/climate/", views.ClimateModel.as_view()),
    path("models/builtin/3body/", views.ThreeBodyModel.as_view()),

    path('', views.HomePage.as_view()),
    path('index.html/', views.HomePage.as_view()),
]
