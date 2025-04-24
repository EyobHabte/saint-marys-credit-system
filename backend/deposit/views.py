# deposit/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Deposit
from .serializers import DepositSerializer
from account.models import UserAccount

class CreateDepositView(APIView):
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListDepositsView(APIView):
    def get(self, request):
        # Optionally filter by a parameter (e.g., by member) if needed.
        deposits = Deposit.objects.all()
        serializer = DepositSerializer(deposits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
