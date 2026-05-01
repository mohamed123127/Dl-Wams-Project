import requests
from django.http import HttpResponse
from .discovery import get_service_url
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

services = [
    "auth-service",
    "product-service",
    "employee-service",
    "sales-service",
    "model-worker-service",
    "security-service",
]

def get_services_urls(request):
    urls = {}

    for service in services:
        try:
            urls[service] = {
                "status": "available",
                "url": get_service_url(service)
            }
        except Exception as e:
            urls[service] = {
                "status": "unavailable",
                "error": str(e)
            }

    return JsonResponse({
        "services": urls
    })
