from sales_service.permissions import IsSeller
from rest_framework import viewsets, status
from rest_framework.response import Response
import requests
from sales_service.service_discovery import discover_service
from .models import Sale, ItemSaled
from .serializers import SaleSerializer, ItemSaledSerializer

PRODUCT_SERVICE_URL = f"{discover_service('product-service')}/api/products"
EMPLOYEE_SERVICE_URL = f"{discover_service('employee-service')}/api/employees"

def get_employee_data(employee_id):
    try:
        response = requests.get(f"{EMPLOYEE_SERVICE_URL}/{employee_id}/", timeout=2)
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return None

def get_product_data(product_id):
    try:
        response = requests.get(f"{PRODUCT_SERVICE_URL}/{product_id}/", timeout=2)
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return None

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsSeller]

    def get_full_sale_data(self, instance):
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Fetch Employee Data
        employee_data = get_employee_data(instance.employee_id)
        if employee_data:
            data['employee_details'] = employee_data
        else:
            data['employee_details'] = "Service unavailable or not found"

        # Fetch Product Data for items
        for item in data.get('items', []):
            product_data = get_product_data(item['product_id'])
            if product_data:
                item['product_details'] = product_data
            else:
                item['product_details'] = "Service unavailable or not found"
        
        return data

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        instance = serializer.instance
        data = self.get_full_sale_data(instance)
        
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_full_sale_data(instance)
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        return Response(data)

class ItemSaledViewSet(viewsets.ModelViewSet):
    queryset = ItemSaled.objects.all()
    serializer_class = ItemSaledSerializer
    permission_classes = [IsSeller]

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        
        # Calculate total amount
        total_amount = sum(float(item['price']) * int(item['quantity']) for item in items_data)
        validated_data['total_amount'] = total_amount
        
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            product_id = item_data['product_id']
            quantity = int(item_data['quantity'])
            
            # Deduct stock
            try:
                requests.post(
                    f"{PRODUCT_SERVICE_URL}/{product_id}/deduct_stock/", 
                    json={"quantity": quantity}, 
                    timeout=2
                )
            except requests.exceptions.RequestException:
                pass
                
            ItemSaled.objects.create(sale=sale, **item_data)
            
        return sale

