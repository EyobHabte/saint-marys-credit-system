# report/urls.py
from django.urls import path
from .views import MemberReportView, AdminReportView

urlpatterns = [
    path('member/', MemberReportView.as_view(), name='member-report'),
    path('admin/', AdminReportView.as_view(), name='admin-report'),
]
