# loan/urls.py
from django.urls import path
from .views import (
    LoanRequestSubmitView,
    LoanRequestStatusView,
    LoanRequestListView,
    LoanRequestDetailView,
    LoanRequestApproveView,  
    LoanRequestRejectView,
    LoanRepaymentSubmitView,
    LoanRepaymentListView,
)

urlpatterns = [
    path('submit/', LoanRequestSubmitView.as_view(), name='loan-submit'),
    path('status/<int:user_id>/', LoanRequestStatusView.as_view(), name='loan-status'),
    path('requests/', LoanRequestListView.as_view(), name='loan-request-list'),
    path('requests/<int:pk>/', LoanRequestDetailView.as_view(), name='loan-request-detail'),
    path('requests/<int:pk>/approve/', LoanRequestApproveView.as_view(), name='loan-request-approve'),
    path('requests/<int:pk>/reject/', LoanRequestRejectView.as_view(), name='loan-request-reject'),
    path('<int:loan_id>/repayments/', LoanRepaymentListView.as_view(), name='loan-repayment-list'),
    path('<int:loan_id>/repayments/submit/', LoanRepaymentSubmitView.as_view(), name='loan-repayment-submit'),
]
