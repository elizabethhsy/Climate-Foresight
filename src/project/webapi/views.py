from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.utils.decorators import method_decorator
from django.views import View

# For testing only
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
class TestAPIView(View):
    """A Test view for the API."""
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request: HttpRequest):
        return JsonResponse({'msg': 'If you can see this, GET-ing some JSON data works.'})

    def post(self, request: HttpRequest):
        return JsonResponse({
            'msg': 'If you can see this, POST-ing some data works.',
            'echo': request.body.decode('utf-8')
        })
