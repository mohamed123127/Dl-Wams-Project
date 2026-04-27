import requests

AUTH_SERVICE_URL = "http://127.0.0.1:8000/api/auth/verify-role/"


def verifyToken(token):
    try:
        response = requests.get(
            AUTH_SERVICE_URL,
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