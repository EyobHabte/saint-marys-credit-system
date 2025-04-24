# report/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from deposit.models import Deposit
from withdraw.models import Withdraw
from loan.models import LoanRequest
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import datetime

class MemberReportView(APIView):
    """
    Returns a report for the logged-in member. It aggregates deposits, withdrawals,
    and loan requests made by that member, optionally filtering by a provided date range.
    """
    def get(self, request, format=None):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Optionally filter by date range provided as query parameters (YYYY-MM-DD)
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        
        deposits = Deposit.objects.filter(member=user)
        withdraws = Withdraw.objects.filter(member=user)
        loans = LoanRequest.objects.filter(user=user)
        
        if start:
            try:
                start_date = datetime.strptime(start, "%Y-%m-%d")
            except ValueError:
                return Response({"detail": "Invalid start date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            deposits = deposits.filter(deposit_date__gte=start_date)
            withdraws = withdraws.filter(withdraw_date__gte=start_date)
            loans = loans.filter(created_at__gte=start_date)
        
        if end:
            try:
                end_date = datetime.strptime(end, "%Y-%m-%d")
            except ValueError:
                return Response({"detail": "Invalid end date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            deposits = deposits.filter(deposit_date__lte=end_date)
            withdraws = withdraws.filter(withdraw_date__lte=end_date)
            loans = loans.filter(created_at__lte=end_date)
        
        total_deposits = deposits.aggregate(total=Sum('deposit_amount'))['total'] or 0
        # Note: In your Withdraw model the amount field is named "withdraw_amount"
        total_withdrawals = withdraws.aggregate(total=Sum('withdraw_amount'))['total'] or 0
        net_balance = total_deposits - total_withdrawals
        total_loans_requested = loans.aggregate(total=Sum('loan_amount'))['total'] or 0
        active_loans = loans.filter(status='approved').count()
        pending_loans = loans.filter(status='pending').count()
        # For completed loans we assume loans that are approved and have zero outstanding balance.
        # (This logic may need to be adapted to your business rules.)
        completed_loans = loans.filter(status='approved').filter(total_payment=0).count()

        # Monthly transactions: combine deposits (positive) and withdrawals (negative)
        deposit_by_month = deposits.annotate(month=TruncMonth('deposit_date')).values('month').annotate(total=Sum('deposit_amount')).order_by('month')
        withdraw_by_month = withdraws.annotate(month=TruncMonth('withdraw_date')).values('month').annotate(total=Sum('withdraw_amount')).order_by('month')
        
        monthly_transactions = {}
        for item in deposit_by_month:
            month_str = item['month'].strftime("%b %Y")
            monthly_transactions[month_str] = monthly_transactions.get(month_str, 0) + float(item['total'])
        for item in withdraw_by_month:
            month_str = item['month'].strftime("%b %Y")
            # Withdrawals count as negative
            monthly_transactions[month_str] = monthly_transactions.get(month_str, 0) - float(item['total'])
        # Convert the dictionary to a sorted list (by date)
        monthly_transactions_list = [
            {"month": month, "amount": monthly_transactions[month]}
            for month in sorted(monthly_transactions, key=lambda m: datetime.strptime(m, "%b %Y"))
        ]

        data = {
            "total_deposits": float(total_deposits),
            "total_withdrawals": float(total_withdrawals),
            "net_balance": float(net_balance),
            "total_loans_requested": float(total_loans_requested),
            "active_loans": active_loans,
            "pending_loans": pending_loans,
            "completed_loans": completed_loans,
            "monthly_transactions": monthly_transactions_list,
        }
        return Response(data, status=status.HTTP_200_OK)


class AdminReportView(APIView):
    """
    Returns a report for the entire system (for admin/finance purposes). Aggregates data
    across all members. Date filtering via query parameters is supported.
    """
    def get(self, request, format=None):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        
        deposits = Deposit.objects.all()
        withdraws = Withdraw.objects.all()
        loans = LoanRequest.objects.all()
        
        if start:
            try:
                start_date = datetime.strptime(start, "%Y-%m-%d")
            except ValueError:
                return Response({"detail": "Invalid start date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            deposits = deposits.filter(deposit_date__gte=start_date)
            withdraws = withdraws.filter(withdraw_date__gte=start_date)
            loans = loans.filter(created_at__gte=start_date)
        
        if end:
            try:
                end_date = datetime.strptime(end, "%Y-%m-%d")
            except ValueError:
                return Response({"detail": "Invalid end date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            deposits = deposits.filter(deposit_date__lte=end_date)
            withdraws = withdraws.filter(withdraw_date__lte=end_date)
            loans = loans.filter(created_at__lte=end_date)
        
        total_deposits = deposits.aggregate(total=Sum('deposit_amount'))['total'] or 0
        total_withdrawals = withdraws.aggregate(total=Sum('withdraw_amount'))['total'] or 0
        net_balance = total_deposits - total_withdrawals
        total_loans_requested = loans.aggregate(total=Sum('loan_amount'))['total'] or 0
        active_loans = loans.filter(status='approved').count()
        pending_loans = loans.filter(status='pending').count()
        completed_loans = loans.filter(status='approved').filter(total_payment=0).count()

        deposit_by_month = deposits.annotate(month=TruncMonth('deposit_date')).values('month').annotate(total=Sum('deposit_amount')).order_by('month')
        withdraw_by_month = withdraws.annotate(month=TruncMonth('withdraw_date')).values('month').annotate(total=Sum('withdraw_amount')).order_by('month')
        
        monthly_transactions = {}
        for item in deposit_by_month:
            month_str = item['month'].strftime("%b %Y")
            monthly_transactions[month_str] = monthly_transactions.get(month_str, 0) + float(item['total'])
        for item in withdraw_by_month:
            month_str = item['month'].strftime("%b %Y")
            monthly_transactions[month_str] = monthly_transactions.get(month_str, 0) - float(item['total'])
        monthly_transactions_list = [
            {"month": month, "amount": monthly_transactions[month]}
            for month in sorted(monthly_transactions, key=lambda m: datetime.strptime(m, "%b %Y"))
        ]
        
        data = {
            "total_deposits": float(total_deposits),
            "total_withdrawals": float(total_withdrawals),
            "net_balance": float(net_balance),
            "total_loans_requested": float(total_loans_requested),
            "active_loans": active_loans,
            "pending_loans": pending_loans,
            "completed_loans": completed_loans,
            "monthly_transactions": monthly_transactions_list,
        }
        return Response(data, status=status.HTTP_200_OK)
