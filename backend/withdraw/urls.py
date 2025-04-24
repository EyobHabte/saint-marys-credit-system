# withdraw/urls.py
from django.urls import path
from .views import (
    CreateWithdrawView, 
    ListWithdrawsView, 
    UpdateWithdrawStatusView,
    ApproveWithdrawView,
    RejectWithdrawView
)

urlpatterns = [
    path('add/', CreateWithdrawView.as_view(), name='add-withdraw'),
    path('list/', ListWithdrawsView.as_view(), name='list-withdraws'),
    path('<int:pk>/update/', UpdateWithdrawStatusView.as_view(), name='update-withdraw'),
    path('<int:pk>/approve/', ApproveWithdrawView.as_view(), name='approve-withdraw'),
    path('<int:pk>/reject/', RejectWithdrawView.as_view(), name='reject-withdraw'),
]
