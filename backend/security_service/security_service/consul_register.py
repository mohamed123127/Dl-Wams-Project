import consul
import socket
import atexit
import os

consulHost = os.getenv("consulHost")
securityHost = os.getenv("securityHost")

SERVICE_NAME = "security-service"
SERVICE_PORT = 8004

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
        address=securityHost,
        port=SERVICE_PORT,
        check=consul.Check.http(
            f"https://{securityHost}/health/",
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