# withdraw/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Withdraw
from .serializers import WithdrawSerializer

class CreateWithdrawView(APIView):
    def post(self, request):
        serializer = WithdrawSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListWithdrawsView(APIView):
    def get(self, request):
        withdraws = Withdraw.objects.all().order_by('-withdraw_date')
        serializer = WithdrawSerializer(withdraws, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateWithdrawStatusView(APIView):
    def put(self, request, pk):
        try:
            withdraw = Withdraw.objects.get(pk=pk)
        except Withdraw.DoesNotExist:
            return Response({"detail": "Withdraw request not found."}, status=status.HTTP_404_NOT_FOUND)
        
        status_value = request.data.get("status")
        if status_value not in ['approved', 'rejected']:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        
        withdraw.status = status_value
        withdraw.save()
        serializer = WithdrawSerializer(withdraw)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApproveWithdrawView(APIView):
    def post(self, request, pk, format=None):
        try:
            withdraw = Withdraw.objects.get(pk=pk)
        except Withdraw.DoesNotExist:
            return Response({"detail": "Withdraw request not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if withdraw.status != 'pending':
            return Response({"detail": "Withdrawal request is not pending."}, status=status.HTTP_400_BAD_REQUEST)
        
        withdraw.status = 'approved'
        withdraw.save()
        serializer = WithdrawSerializer(withdraw)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RejectWithdrawView(APIView):
    def post(self, request, pk, format=None):
        try:
            withdraw = Withdraw.objects.get(pk=pk)
        except Withdraw.DoesNotExist:
            return Response({"detail": "Withdraw request not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if withdraw.status != 'pending':
            return Response({"detail": "Withdrawal request is not pending."}, status=status.HTTP_400_BAD_REQUEST)
        
        withdraw.status = 'rejected'
        withdraw.save()
        serializer = WithdrawSerializer(withdraw)
        return Response(serializer.data, status=status.HTTP_200_OK)
