import consul
from dotenv import load_dotenv
import os

load_dotenv()

consulHost = os.environ.get("consulHost")

def discover_service(service_name):
    c = consul.Consul(
        host=consulHost,
        port=443,
        scheme="https"
    )
    services = c.health.service(service_name, passing=True)[1] #passing=True means healthy services only

    if not services:
        raise Exception(f"{service_name} not found")

    service = services[0]["Service"]

    return f"https://{service['Address']}"