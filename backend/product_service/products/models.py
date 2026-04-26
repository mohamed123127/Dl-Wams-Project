from django.db import models
from categories.models import Category

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    barcode = models.CharField(max_length=255, unique=True, null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.IntegerField()

    def __str__(self):
        return self.name