import requests
from product_service.service_discovery import discover_service

AUTH_SERVICE_URL = discover_service("auth-service")


def verifyToken(token):
    try:
        response = requests.get(
            f"{AUTH_SERVICE_URL}/api/verify-role/",
            headers={
                "Authorization": token
            },
            timeout=5
        )

        if response.status_code == 200:
            return response.json()

        return None

    except requests.RequestException:
        return None