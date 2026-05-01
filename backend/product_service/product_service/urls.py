from django.contrib import admin
from django.urls import path, include
from . import view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', view.health, name='health'),
    path('api/', include('products.urls')),
    path('api/', include('categories.urls')),
]
