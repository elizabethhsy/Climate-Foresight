from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.views import View

from typing import Dict, Any


class BaseView(View):
    """Parent class for pages using the `website/base.html` template."""

    template = "webserver/base.html"
    title = "Base View"

    def get_page_attrs(self, request: HttpRequest, kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Get attributes shown in the page template.

        This method will provide attributes used by the base template.
        If a subclass needs to provide its own attributes, it should also call the super function.
        """
        attrs = {
            "title": self.title,
        }

        return attrs

    def get(self, request: HttpRequest, **kwargs: Dict[str, Any]) -> HttpResponse:
        """HTTP GET Method.

        Generic method which will use get_page_attrs and self.template.
        If a subclass only needs custom attributes, just override get_page_attrs and not this method.
        """
        attrs = self.get_page_attrs(request, kwargs)
        return render(request, self.template, attrs)

class TestPage(BaseView):
    """Basic Test Page."""

    template = "webserver/test.html"


class HomePage(BaseView):
    """Website Home/Landing Page."""

    template = "webserver/home.html"
    title = "Home Page"


class ModelList(BaseView):
    """Listing of all available models."""

    template = "webserver/modellist.html"
    title = "Model Listing"


class ClimateModel(BaseView):
    """Climate Model Viz."""

    template = "webserver/models/climate.html"
    title = "Visualisations - Climate Model"


class ThreeBodyModel(BaseView):
    """3-body Model Viz."""

    template = "webserver/models/3body.html"
    title = "Visualisations - 3-body Model"
