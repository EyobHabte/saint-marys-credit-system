from django.urls import path
from .views import (
    AddMemberView, ListMembersView, UpdateMemberView, DeleteMemberView, 
    MemberDetailView, FetchMemberDetailsByUsername, MemberDetailByIdView,
    TransactionListView, AddTransactionView, MemberDashboardView
)

urlpatterns = [
    path('add/', AddMemberView.as_view(), name='add-member'),
    path('list/', ListMembersView.as_view(), name='list-members'),
    path('update/<int:id>/', UpdateMemberView.as_view(), name='update-member'),
    path('delete/<int:id>/', DeleteMemberView.as_view(), name='delete-member'),
    path('detail/<str:username>/', MemberDetailView.as_view(), name='member-detail'),
    path('', ListMembersView.as_view(), name='list-members'),  # Default to list members
    path('detail-by-username/<str:username>/', FetchMemberDetailsByUsername.as_view(), name='fetch-member-details'),
    path('detail-by-id/<int:id>/', MemberDetailByIdView.as_view(), name='member-detail-by-id'),
    path('<str:username>/transactions/', TransactionListView.as_view(), name='list-transactions'),
    path('<str:username>/transactions/add/', AddTransactionView.as_view(), name='add-transaction'),
    path('<str:username>/dashboard/', MemberDashboardView.as_view(), name='member-dashboard'),
]

