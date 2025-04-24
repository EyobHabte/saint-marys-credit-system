from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication

class RolePermission(BasePermission):
    def has_permission(self, request, view):
        jwt_auth = JWTAuthentication()
        try:
            # Extract the token from the Authorization header
            token = request.headers.get("Authorization").split()[1]
            validated_token = jwt_auth.get_validated_token(token)
            user_role = validated_token.get("role")  # Extract the 'role' claim
            allowed_roles = getattr(view, "allowed_roles", [])
            return user_role in allowed_roles
        except Exception:
            return False
