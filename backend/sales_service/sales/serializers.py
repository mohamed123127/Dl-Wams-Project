from rest_framework import serializers
import requests
from .models import Sale, ItemSaled

PRODUCT_SERVICE_URL = "http://127.0.0.1:8000/api/products"
EMPLOYEE_SERVICE_URL = "http://127.0.0.1:8001/api/employees"

class ItemSaledSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemSaled
        fields = ['id', 'product_id', 'quantity', 'price']

class SaleSerializer(serializers.ModelSerializer):
    items = ItemSaledSerializer(many=True, read_only=True)
    items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Sale
        fields = ['id', 'employee_id', 'sale_date', 'total_amount', 'items', 'items_data']
        read_only_fields = ['total_amount']

    def validate(self, data):
        employee_id = data.get('employee_id')
        items_data = data.get('items_data', [])

        if not items_data:
            raise serializers.ValidationError({"items_data": "You must provide at least one item for the sale."})

        try:
            emp_response = requests.get(f"{EMPLOYEE_SERVICE_URL}/{employee_id}/", timeout=2)
            if emp_response.status_code != 200:
                raise serializers.ValidationError({"employee_id": "Employee does not exist."})
        except requests.exceptions.RequestException:
            raise serializers.ValidationError({"employee_id": "Could not connect to Employee service."})

        for item in items_data:
            product_id = item.get('product_id')
            quantity = int(item.get('quantity', 0))

            if quantity <= 0:
                raise serializers.ValidationError({"items_data": f"Quantity for product {product_id} must be greater than 0."})

            try:
                prod_response = requests.get(f"{PRODUCT_SERVICE_URL}/{product_id}/", timeout=2)
                if prod_response.status_code != 200:
                    raise serializers.ValidationError({"items_data": f"Product with ID {product_id} does not exist."})
                
                product_data = prod_response.json()
                if product_data.get('stock', 0) < quantity:
                    raise serializers.ValidationError({"items_data": f"Insufficient stock for product {product_id}."})
            except requests.exceptions.RequestException:
                raise serializers.ValidationError({"items_data": f"Could not connect to Product service for product {product_id}."})

        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        
        # Calculate total amount
        total_amount = sum(float(item['price']) * int(item['quantity']) for item in items_data)
        validated_data['total_amount'] = total_amount
        
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            product_id = int(item_data['product_id'])
            quantity = int(item_data['quantity'])
            price = float(item_data['price'])
            
            # Deduct stock
            try:
                requests.post(
                    f"{PRODUCT_SERVICE_URL}/{product_id}/deduct_stock/", 
                    json={"quantity": quantity}, 
                    timeout=2
                )
            except requests.exceptions.RequestException:
                pass

            # Only pass the exact model fields
            ItemSaled.objects.create(
                sale=sale,
                product_id=product_id,
                quantity=quantity,
                price=price,
            )
            
        return sale
