from django.urls import path
from .views import MemberRequestView, ApproveRejectMemberRequestView, MemberRequestDetailView,FetchEncryptedPasswordView

urlpatterns = [
    path("register/", MemberRequestView.as_view(), name="member-register"),  # Add this line
    path("member-requests/", MemberRequestView.as_view(), name="member-requests"),
    path("member-requests/<int:id>/", MemberRequestDetailView.as_view(), name="member-request-detail"),
    path("member-requests/<int:request_id>/action/", ApproveRejectMemberRequestView.as_view(), name="approve-reject-request"),
    path("fetch-encrypted-password/<str:username>/", FetchEncryptedPasswordView.as_view(), name="fetch-encrypted-password"),
]
