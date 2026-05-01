import consul
import os
import atexit

consulHost = os.getenv("consulHost")
salesHost = os.getenv("salesHost")

SERVICE_NAME = "sales-service"
SERVICE_PORT = 8002


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
        address=salesHost,
        port=SERVICE_PORT,
        check=consul.Check.http(
            f"https://{salesHost}/health/",
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