from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action,permission_classes
from .models import Product
from .serializers import ProductSerializer
from product_service.permissions import IsInventoryManager,IsSeller

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsInventoryManager]

    def create(self, request, *args, **kwargs):
        # Business Logic: Ensure selling price > purchase price
        purchase_price = float(request.data.get('purchase_price', 0))
        selling_price = float(request.data.get('selling_price', 0))

        if selling_price <= purchase_price:
            return Response(
                {"error": "Selling price must be greater than purchase price."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'],permission_classes=[IsInventoryManager | IsSeller])
    def deduct_stock(self, request, pk=None):
        product = self.get_object()
        quantity_to_deduct = int(request.data.get('quantity', 0))

        if quantity_to_deduct <= 0:
            return Response({"error": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
        
        if product.stock < quantity_to_deduct:
            return Response({"error": "Insufficient stock"}, status=status.HTTP_400_BAD_REQUEST)

        product.stock -= quantity_to_deduct
        product.save()

        return Response({"status": "stock deducted", "new_stock": product.stock})