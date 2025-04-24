from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views import View
from .forms import RegistrationForm
from .models import MemberRequest
from .models import Member
from .serializers import MemberSerializer
import json

# Existing register view
@csrf_exempt
def register(request):
    if request.method == "POST":
        form = RegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return JsonResponse({"message": "Registration successful."}, status=201)
        else:
            # Return form errors in a JSON format
            return JsonResponse({"errors": form.errors}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=405)


# New MemberRequestsView to fetch pending requests
class MemberRequestsView(View):
    def get(self, request):
        """
        Fetch pending member requests with pagination.
        Query parameters:
            - page: The page number (e.g., ?page=1)
            - per_page: Number of records per page (default=5)
        """
        # Filter only pending requests
        pending_requests = MemberRequest.objects.filter(is_approved=False)
        
        # Pagination parameters
        page = request.GET.get("page", 1)  # Default to page 1
        per_page = request.GET.get("per_page", 5)  # Default 5 items per page

        # Setup paginator
        paginator = Paginator(pending_requests, per_page)
        
        try:
            requests_page = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver the first page
            requests_page = paginator.page(1)
        except EmptyPage:
            # If page is out of range, deliver an empty list
            return JsonResponse({
                "results": [],
                "page": page,
                "per_page": per_page,
                "total_pages": paginator.num_pages,
                "total_results": paginator.count
            }, status=200)

        # Serialize data for the current page
        data = list(requests_page.object_list.values(
            'id', 'username', 'full_name', 'phone_number', 'email', 'employment_id','submitted_at'
        ))

        # Return paginated response
        return JsonResponse({
            "results": data,
            "page": requests_page.number,
            "per_page": per_page,
            "total_pages": paginator.num_pages,
            "total_results": paginator.count
        }, status=200)
# New MemberRequestActionView to handle approve/reject actions
@method_decorator(csrf_exempt, name="dispatch")
class MemberRequestActionView(View):
    def post(self, request, request_id):
        """
        Approve or reject a member request.
        """
        try:
            body = json.loads(request.body)
            action = body.get("action")  # "approve" or "reject"
            comment = body.get("comment", "")
            member_request = MemberRequest.objects.get(id=request_id)

            if action == "approve":
                member_request.is_approved = True
                member_request.save()
                # Notify user and create additional member logic here (if needed)
                return JsonResponse({"message": "Request approved successfully."})

            elif action == "reject":
                # Handle rejection logic (e.g., send comment to the user)
                return JsonResponse({"message": f"Request rejected with comment: {comment}"})

            return JsonResponse({"error": "Invalid action."}, status=400)

        except MemberRequest.DoesNotExist:
            return JsonResponse({"error": "Request not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
class MemberRequestDetailView(View):
    def get(self, request, request_id):
        try:
            member_request = MemberRequest.objects.get(id=request_id)
            data = {
                "id": member_request.id,
                "first_name": member_request.first_name,
                "last_name": member_request.last_name,
                "username": member_request.username,
                "phone_number": member_request.phone_number,
                "email": member_request.email,
                "submitted_at": member_request.submitted_at,
                "employment_id": member_request.employment_id.url if member_request.employment_id else None,
                "is_approved": member_request.is_approved
            }
            return JsonResponse(data, status=200)
        except MemberRequest.DoesNotExist:
            return JsonResponse({"error": "Request not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
@api_view(['POST'])
def add_member(request):
    """
    Add a new member to the Members table.
    """
    if request.method == 'POST':
        serializer = MemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Member added successfully!", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)