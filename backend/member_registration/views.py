from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import MemberRequest

from .serializers import MemberRequestSerializer
from member.models import Member
from member.serializers import MemberSerializer


class MemberRequestView(APIView):
    def get(self, request):
        username = request.query_params.get("username", None)
        if username:
            try:
                member_request = MemberRequest.objects.get(username=username)
                decrypted_password = member_request.get_decrypted_password()
                if not decrypted_password:
                    return Response({"error": "Decryption failed"}, status=status.HTTP_400_BAD_REQUEST)
                data = MemberRequestSerializer(member_request).data
                data["decrypted_password"] = decrypted_password
                return Response(data, status=status.HTTP_200_OK)
            except MemberRequest.DoesNotExist:
                return Response({"error": "Member request not found."}, status=status.HTTP_404_NOT_FOUND)

        # Handle paginated listing of member requests that are not yet approved
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get("per_page", 5)
        member_requests = MemberRequest.objects.filter(is_approved=False).order_by("-submitted_at")
        result_page = paginator.paginate_queryset(member_requests, request)
        serializer = MemberRequestSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = MemberRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful."}, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class MemberRequestDetailView(APIView):
    def get(self, request, id):
        try:
            member_request = MemberRequest.objects.get(id=id)
            serializer = MemberRequestSerializer(
                member_request, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except MemberRequest.DoesNotExist:
            return Response({"error": "Member request not found."}, status=status.HTTP_404_NOT_FOUND)


class ApproveRejectMemberRequestView(APIView):
    def post(self, request, request_id):
        action = request.data.get("action")
        try:
            member_request = MemberRequest.objects.get(id=request_id)
            if action == "approve":
                # Add approved request to Member table
                member_data = {
                    "first_name": member_request.first_name,
                    "last_name": member_request.last_name,
                    "username": member_request.username,
                    "email": member_request.email,
                    "phone_number": member_request.phone_number,
                    "gender": member_request.gender,
                    "job_position": member_request.employment_type,
                    "employment_id": member_request.employment_id,
                    "submitted_by": "System Admin",  # Replace with dynamic admin info if needed
                }
                serializer = MemberSerializer(data=member_data)
                if serializer.is_valid():
                    serializer.save()
                    # Mark the request as approved
                    member_request.is_approved = True
                    member_request.save()
                    return Response({"message": "Request approved and member added."}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            elif action == "reject":
                # Mark the request as rejected
                member_request.is_approved = True
                member_request.save()
                reason = request.data.get("reason", "")
                return Response({"message": f"Request rejected. Reason: {reason}"}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
        except MemberRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
class FetchEncryptedPasswordView(APIView):
    def get(self, request, username):
        try:
            member_request = MemberRequest.objects.get(username__iexact=username)
            encrypted_password = member_request.get_encrypted_password()  # This now works as expected
            return Response({"encrypted_password": encrypted_password}, status=status.HTTP_200_OK)
        except MemberRequest.DoesNotExist:
            return Response({"error": "Member request not found."}, status=status.HTTP_404_NOT_FOUND)
