from rest_framework.routers import DefaultRouter
from .views import ShopliftingViewSet

router = DefaultRouter()

router.register(r'shoplifting', ShopliftingViewSet)
