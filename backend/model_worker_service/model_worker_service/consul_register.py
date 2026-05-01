import consul
import socket
import atexit

SERVICE_NAME = "model-worker-service"
SERVICE_PORT = 8003

def get_url():
    return "41a0-154-244-53-158.ngrok-free.app"

def register_service():
    c = consul.Consul(host="localhost", port=8500)

    service_id = f"{SERVICE_NAME}-1"

    c.agent.service.register(
        name=SERVICE_NAME,
        service_id=service_id,
        address=get_url(),
        port=SERVICE_PORT,
        check=consul.Check.http(
            f"https://{get_url()}/health/",
            interval="10s"
        )
    )

    print(f"{SERVICE_NAME} registered successfully.")

def deregister_service():
    c = consul.Consul(host="localhost", port=8500)
    service_id = f"{SERVICE_NAME}-1"
    c.agent.service.deregister(service_id)
    print(f"{service_id} deregistered.")

atexit.register(deregister_service)

if __name__ == "__main__":
    register_service()