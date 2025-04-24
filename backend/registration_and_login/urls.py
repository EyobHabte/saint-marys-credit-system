from django.urls import path
from .views import register, MemberRequestsView, MemberRequestActionView, MemberRequestDetailView,add_member

urlpatterns = [
    path('register/', register, name='register'),
    path('member-requests/', MemberRequestsView.as_view(), name="member-requests"),
    path('member-requests/<int:request_id>/', MemberRequestDetailView.as_view(), name="member-request-detail"),
    path('member-requests/<int:request_id>/action/', MemberRequestActionView.as_view(), name="member-request-action"),
    path('api/add-member/', add_member, name='add-member'),
]
