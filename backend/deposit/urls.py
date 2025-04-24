# deposit/urls.py
from django.urls import path
from .views import CreateDepositView, ListDepositsView

urlpatterns = [
    path('add/', CreateDepositView.as_view(), name='add-deposit'),
    path('list/', ListDepositsView.as_view(), name='list-deposits'),
]
