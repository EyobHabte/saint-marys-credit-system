from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserAccount
from .serializers import UserAccountSerializer
from member_registration.models import MemberRequest
from rest_framework.test import APITestCase
import logging
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken  # Also needed for tokens
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import RolePermission
from rest_framework import serializers

logger = logging.getLogger(__name__)

class CreateAccountView(APIView):
    def post(self, request):
        serializer = UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            account_type = serializer.validated_data.get('account_type')
            username = serializer.validated_data.get('username')

            # If the account type is 'member', fetch the decrypted password from MemberRequest
            if account_type == 'member':
                try:
                    member_request = MemberRequest.objects.get(username=username)
                    decrypted_password = member_request.get_decrypted_password()

                    if not decrypted_password:
                        raise serializers.ValidationError("Decryption failed for the member's password.")

                    # Hash the decrypted password before assigning it
                    user_account = serializer.save()
                    user_account.set_password(decrypted_password)  # Hash the password
                    user_account.is_active = True  # Ensure the account is active
                    user_account.save()

                    # Mark the member request as approved
                    member_request.is_approved = True
                    member_request.save()

                    return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)

                except MemberRequest.DoesNotExist:
                    return Response({"error": "Member request not found."}, status=status.HTTP_404_NOT_FOUND)

            else:
                # For admin or finance_officer accounts, hash the provided password
                user_account = serializer.save()
                user_account.set_password(serializer.validated_data['password'])  # Hash the password
                user_account.is_active = True  # Ensure the account is active
                user_account.save()
                return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)

        logger.error(f"Account creation failed: {serializer.errors}")
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ListAccountsView(APIView):
    def get(self, request):
        accounts = UserAccount.objects.all()
        serializer = UserAccountSerializer(accounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateAccountView(APIView):
    def put(self, request, pk):
        try:
            account = UserAccount.objects.get(pk=pk)
            serializer = UserAccountSerializer(account, data=request.data, partial=True)
            if serializer.is_valid():
                # Only set the password if it is provided
                if 'password' in serializer.validated_data:
                    account.set_password(serializer.validated_data['password'])
                serializer.save()
                return Response({"message": "Account updated successfully."}, status=status.HTTP_200_OK)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except UserAccount.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)
        
class DeleteAccountView(APIView):
    def delete(self, request, pk):
        try:
            account = UserAccount.objects.get(pk=pk)
            account.delete()
            return Response({"message": "Account deleted successfully."}, status=status.HTTP_200_OK)
        except UserAccount.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            if not user.is_active:
                return Response({"detail": "This account is inactive."}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
class AdminOnlyView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["admin"]  # Restrict this view to admins only

    def get(self, request):
        return Response({"message": "Welcome, Admin!"}, status=status.HTTP_200_OK)

class FinanceAndAdminView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["finance_officer", "admin"]

    def get(self, request):
        return Response({"message": "Welcome, Finance Officer or Admin!"}, status=status.HTTP_200_OK)

class MemberAPITest(APITestCase):
    def test_member_creation_api(self):
        data = {
            "first_name": "Jane",
            "last_name": "Doe",
            "username": "janedoe",
            "email": "jane.doe@example.com",
            "phone_number": "9876543210",
            "gender": "Female",
            "job_position": "Finance Officer"
        }
        response = self.client.post("/api/members/add/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Member added successfully!")

class AccountDetailView(APIView):
    def get(self, request, pk):
        try:
            account = UserAccount.objects.get(pk=pk)
            serializer = UserAccountSerializer(account)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserAccount.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)