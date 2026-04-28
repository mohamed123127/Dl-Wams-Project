from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('manager', 'Manager'),
        ('guard', 'Guard'),
        ('inventoryManager', 'Inventory Manager'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='seller')

    def __str__(self):
        return f"{self.username} ({self.role})"
