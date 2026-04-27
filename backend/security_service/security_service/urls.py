from django.urls import include, path
from django.contrib import admin
from cameras.urls import router as cameras_router
from shoplifting.urls import router as shoplifting_router
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(cameras_router.urls)),
    path('api/', include(shoplifting_router.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)