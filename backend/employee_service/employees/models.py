from django.db import models

from django.db import models

class Employee(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('manager', 'Manager'),
        ('guard', 'Guard'),
        ('inventoryManager', 'Inventory Manager'),
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='seller')

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"
