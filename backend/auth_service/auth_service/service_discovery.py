import consul
from dotenv import load_dotenv
load_dotenv()

import os

consulHost = os.getenv("consulHost")

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

    return f"http://{service['Address']}:{service['Port']}"