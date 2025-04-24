# loan/serializers.py
from rest_framework import serializers
from .models import LoanRequest, LoanRepayment

class LoanRequestSerializer(serializers.ModelSerializer):
    # Optionally include computed fields for the frontend:
    total_repaid = serializers.SerializerMethodField(read_only=True)
    outstanding_balance = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LoanRequest
        fields = '__all__'
        read_only_fields = ('member_balance_snapshot', 'status', 'created_at')  # already fixed member details earlier

    def get_total_repaid(self, obj):
        return obj.total_repaid()

    def get_outstanding_balance(self, obj):
        return obj.outstanding_balance()

class LoanRepaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRepayment
        fields = '__all__'
        read_only_fields = ('repayment_date',)
