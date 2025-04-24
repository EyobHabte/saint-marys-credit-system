# account/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer
from .views import (
    CreateAccountView,
    ListAccountsView,
    UpdateAccountView,
    DeleteAccountView,
    AccountDetailView, 
    LoginView,
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
urlpatterns = [
    path('create/', CreateAccountView.as_view(), name='create-account'),
    path('list/', ListAccountsView.as_view(), name='list-accounts'),
    path('detail/<int:pk>/', AccountDetailView.as_view(), name='account-detail'),
    path('update/<int:pk>/', UpdateAccountView.as_view(), name='update-account'),
    path('delete/<int:pk>/', DeleteAccountView.as_view(), name='delete-account'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]