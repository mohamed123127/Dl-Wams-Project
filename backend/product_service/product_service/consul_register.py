import consul
import socket
import atexit
import os
from dotenv import load_dotenv

load_dotenv()
consulHost = os.getenv("consulHost")
productHost = os.getenv("productHost")

SERVICE_NAME = "product-service"
SERVICE_PORT = 8000

def register_service():
    c = consul.Consul(
        host=consulHost,
        port=443,
        scheme="https"
    )

    service_id = f"{SERVICE_NAME}-1"

    c.agent.service.register(
        name=SERVICE_NAME,
        service_id=service_id,
        address=productHost,
        port=SERVICE_PORT,
        check=consul.Check.http(
            f"https://{productHost}/health/",
            interval="10s"
        )
    )

    print(f"{SERVICE_NAME} registered successfully.")

def deregister_service():
    c = consul.Consul(
        host=consulHost,
        port=443,
        scheme="https"
    )
    service_id = f"{SERVICE_NAME}-1"
    c.agent.service.deregister(service_id)
    print(f"{service_id} deregistered.")

atexit.register(deregister_service)

if __name__ == "__main__":
    register_service()