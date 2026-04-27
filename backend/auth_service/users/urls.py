from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserProfileView, AdminOnlyView,VerifyTokenRoleView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('admin-only/', AdminOnlyView.as_view(), name='admin_only'),
    path('verify-role/', VerifyTokenRoleView.as_view(), name='verify_role'),
]
