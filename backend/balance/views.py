# balance/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from deposit.models import Deposit
from withdraw.models import Withdraw

class BalanceCalculatorView(APIView):
    def get(self, request, format=None):
        # Check if a member_id query parameter is provided:
        member_id = request.query_params.get('member_id', None)
        if member_id:
            # Calculate individual balance.
            deposits_total = Deposit.objects.filter(member_id=member_id).aggregate(
                total=Sum('deposit_amount')
            )['total'] or 0
            withdraws_total = Withdraw.objects.filter(member_id=member_id, status='approved').aggregate(
                total=Sum('withdraw_amount')
            )['total'] or 0
            balance = deposits_total - withdraws_total
            return Response({
                "member_id": member_id,
                "balance": balance,
                "total_deposits": deposits_total,
                "total_withdrawals": withdraws_total,
            }, status=status.HTTP_200_OK)
        else:
            # Calculate overall total funds for all members.
            deposits_total = Deposit.objects.all().aggregate(
                total=Sum('deposit_amount')
            )['total'] or 0
            withdraws_total = Withdraw.objects.filter(status='approved').aggregate(
                total=Sum('withdraw_amount')
            )['total'] or 0
            total_funds = deposits_total - withdraws_total
            return Response({
                "total_deposits": deposits_total,
                "total_withdrawals": withdraws_total,
                "total_funds": total_funds,
            }, status=status.HTTP_200_OK)
