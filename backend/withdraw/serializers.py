from rest_framework import serializers
from .models import Withdraw
from account.models import UserAccount
from account.serializers import UserAccountSerializer

class WithdrawSerializer(serializers.ModelSerializer):
    member_detail = UserAccountSerializer(source='member', read_only=True)
    
    member = serializers.PrimaryKeyRelatedField(
        queryset=UserAccount.objects.filter(account_type='member')
    )
    
    class Meta:
        model = Withdraw
        fields = ['id', 'member', 'member_detail', 'withdraw_amount', 'bank_account', 'withdraw_date', 'remark', 'status']
