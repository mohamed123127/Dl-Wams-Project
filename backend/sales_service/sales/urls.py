from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, ItemSaledViewSet

router = DefaultRouter()
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'items', ItemSaledViewSet, basename='item-saled')

urlpatterns = [
    path('', include(router.urls)),
]
