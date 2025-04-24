# balance/urls.py
from django.urls import path
from .views import BalanceCalculatorView

urlpatterns = [
    path('calculate/', BalanceCalculatorView.as_view(), name='balance-calculate'),
]
