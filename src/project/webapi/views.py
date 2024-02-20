from django.http import JsonResponse, HttpRequest, Http404
from django.conf import settings
from django.views import View
from pathlib import Path
import json
import csv

BASE_DIR = settings.BASE_DIR

class BaseJsonView(View):
    """Base view for returning JSON data."""

    def get(self, request: HttpRequest) -> JsonResponse:
        """Return the JSON response."""
        return JsonResponse(self.get_data(request))

    def get_data(self, request: HttpRequest) -> dict:
        """Return the data to include in the JSON response."""
        raise NotImplementedError("You must implement this method in a subclass")


class ClimateJson(BaseJsonView):
    SCENARIOS = {'ssp119', 'ssp126', 'ssp245', 'ssp370', 'ssp434', 'ssp460', 'ssp534-over', 'ssp585'}
    FILETYPES = {'pos_generative_rand', 'pos_generative', 'prior_genrative_rand', 'prior_generative', 'true_generative'}
    def get_data(self, request: HttpRequest) -> dict:
        params = request.GET
        scenario = params["scenario"]
        if scenario not in self.SCENARIOS:
            raise Http404("Invalid scenario")
        filetype = params.get("file", "pos_generative_rand")
        if filetype not in self.FILETYPES:
            raise Http404("Invalid file type")
        filepath = (BASE_DIR / "webapi/data/climate" / scenario / "clean" / filetype).with_suffix(".json")
        # Maintain flexibility should this be dynamic in the future
        with open(filepath) as f:
            data = json.load(f)
        return data

class ThreeBodyJson(BaseJsonView):
    XS = {"0.04"}
    def get_data(self, request: HttpRequest) -> dict:
        params = request.GET
        x = params["x"]
        if x not in self.XS:
            raise Http404("Invalid x value")
        filepath = (BASE_DIR / "webapi/data/3body" / f"{x}" / "deriv_generative").with_suffix(".csv")
        with open(filepath, newline='') as f:
            reader = csv.reader(f, delimiter=",")
            data = {"raw_csv": [row for row in reader]}
        return data