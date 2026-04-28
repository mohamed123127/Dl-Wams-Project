from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework import generics, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, UserSerializer
from .permissions import IsAdminRole, IsManagerRole, IsSellerRole, IsGuardRole, IsInventoryManagerRole

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AdminOnlyView(views.APIView):
    permission_classes = (IsAuthenticated, IsAdminRole,)

    def get(self, request):
        return Response({"message": "Hello Admin"})

class VerifyTokenRoleView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response({
            "valid": True,
            "user_id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": request.user.role,
        })
