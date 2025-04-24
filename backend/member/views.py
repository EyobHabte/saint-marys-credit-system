from urllib.parse import urlparse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from account.models import UserAccount
from account.serializers import UserAccountSerializer
from member_registration.models import MemberRequest
from .models import Member,Transaction
from .serializers import MemberSerializer,TransactionSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import RolePermission

# views.py
class AddMemberView(APIView):
    def post(self, request):
        # Make a mutable copy of request.data
        data = request.data.copy()

        # Remove 'employment_id' if it's explicitly passed as 'null'
        if data.get('employment_id') == 'null':
            data.pop('employment_id')

        # Handle existing_employment_id
        existing_employment_id = data.get('existing_employment_id')
        if existing_employment_id:
            # Extract relative path
            parsed_url = urlparse(existing_employment_id)
            data['existing_employment_id'] = parsed_url.path.lstrip('/')  # Convert to relative path

        # Pass the updated data to the serializer
        serializer = MemberSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Member added successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListMembersView(APIView):
    def get(self, request):
        username = request.query_params.get('username')
        if username:
            try:
                member = Member.objects.get(username=username)
                serializer = MemberSerializer(member)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Member.DoesNotExist:
                return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            paginator = PageNumberPagination()
            paginator.page_size = 10
            members = Member.objects.all().order_by('-created_at')
            result_page = paginator.paginate_queryset(members, request)
            serializer = MemberSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

class UpdateMemberView(APIView):
    def put(self, request, id):
        try:
            member = Member.objects.get(id=id)
            data = request.data.copy()

            # If no new employment_id file is provided, remove the key from the data
            if not request.FILES.get('employment_id'):
                data.pop('employment_id', None)

            serializer = MemberSerializer(member, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Member updated successfully!"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        
class DeleteMemberView(APIView):
    def delete(self, request, id):
        try:
            member = Member.objects.get(id=id)
            member.delete()
            return Response({"message": "Member deleted successfully!"}, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

class MemberDetailView(APIView):
    def get(self, request, username):
        try:
            member = Member.objects.get(username__iexact=username)
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        
class MemberDetailByIdView(APIView):
    def get(self, request, id):
        try:
            member = Member.objects.get(id=id)
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)



class FetchMemberDetailsByUsername(APIView):
    def get(self, request, username):
        member = get_object_or_404(Member, username=username)
        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TransactionListView(APIView):
    def get(self, request, username):
        try:
            member = Member.objects.get(username=username)
            transactions = member.transactions.all().order_by('-date')
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

class AddTransactionView(APIView):
    def post(self, request, username):
        try:
            member = Member.objects.get(username=username)
            data = request.data.copy()
            data['member'] = member.id
            serializer = TransactionSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Transaction added successfully!"}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)


class MemberDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["member"]

    def get(self, request, username):
        try:
            member = Member.objects.get(username=username)
            member_serializer = MemberSerializer(member)
            transactions = member.transactions.all().order_by('-date')[:10]
            transaction_serializer = TransactionSerializer(transactions, many=True)
            return Response({
                "member": member_serializer.data,
                "recent_transactions": transaction_serializer.data,
            }, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

