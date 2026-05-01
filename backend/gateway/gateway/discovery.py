import consul

def get_service_url(service_name):
    c = consul.Consul(host="localhost", port=8500)

    services = c.health.service(service_name, passing=True)[1]

    if not services:
        raise Exception(f"{service_name} not available")

    service = services[0]["Service"]

    return service["Address"]