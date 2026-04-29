from rest_framework.permissions import BasePermission
from .auth import verifyToken


class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        token = request.headers.get("Authorization")
        if not token:
            return False

        user_data = verifyToken(token)

        if not user_data:
            return False

        request.remote_user = user_data
        return user_data.get("role") in self.allowed_roles


class IsAdmin(RolePermission):
    allowed_roles = ['admin']


class IsManager(RolePermission):
    allowed_roles = ['admin', 'manager']


class IsSeller(RolePermission):
    allowed_roles = ['admin', 'seller', 'manager']


class IsInventoryManager(RolePermission):
    allowed_roles = ['admin', 'inventoryManager', 'manager']