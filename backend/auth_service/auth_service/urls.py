from django.contrib import admin
from django.urls import path, include
from . import view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', view.health),
    path('api/', include('users.urls')),
]
