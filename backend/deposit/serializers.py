# deposit/serializers.py
from rest_framework import serializers
from .models import Deposit
from account.models import UserAccount  # Add this import
from account.serializers import UserAccountSerializer  # Ensure this serializer excludes sensitive fields

class DepositSerializer(serializers.ModelSerializer):
    member_detail = UserAccountSerializer(source='member', read_only=True)
    
    member = serializers.PrimaryKeyRelatedField(
        queryset=UserAccount.objects.filter(account_type='member')
    )
    
    class Meta:
        model = Deposit
        fields = ['id', 'member', 'member_detail', 'deposit_amount', 'deposit_date', 'remark']
