# loan/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from .models import LoanRequest, LoanRepayment
from .serializers import LoanRequestSerializer, LoanRepaymentSerializer

class LoanRepaymentSubmitView(APIView):
    """
    Submit a repayment installment for a loan.
    Expects: { "amount_paid": "...", "remark": "Optional remark" }
    """
    def post(self, request, loan_id, format=None):
        try:
            loan = LoanRequest.objects.get(id=loan_id)
        except LoanRequest.DoesNotExist:
            return Response({"detail": "Loan not found."}, status=status.HTTP_404_NOT_FOUND)

        # Validate repayment amount
        try:
            amount = float(request.data.get("amount_paid"))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid repayment amount."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"detail": "Repayment amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure repayment does not exceed outstanding balance
        if amount > loan.outstanding_balance():
            return Response({"detail": "Repayment amount exceeds outstanding balance."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the repayment record
        data = {
            "loan": loan.id,
            "amount_paid": amount,
            "remark": request.data.get("remark", "")
        }
        serializer = LoanRepaymentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoanRepaymentListView(ListAPIView):
    """
    List all repayment installments for a given loan.
    """
    serializer_class = LoanRepaymentSerializer

    def get_queryset(self):
        loan_id = self.kwargs.get("loan_id")
        return LoanRepayment.objects.filter(loan_id=loan_id).order_by("-repayment_date")


class LoanRequestSubmitView(APIView):
    def post(self, request, format=None):
        # ... (existing code for submitting a loan request)
        # [Your existing code remains unchanged]
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            loan_amount = float(request.data.get('loan_amount'))
            loan_term = int(request.data.get('loan_term'))
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid loan amount or term.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate interest and total payment (simple interest)
        interest_rate = 2.00  # 2% per month
        interest_amount = loan_amount * (interest_rate / 100) * loan_term
        total_payment = loan_amount + interest_amount
        
        # Retrieve member balance from the user (assuming a balance field exists)
        member_balance = getattr(user, 'balance', 0.00)
        
        # Prepare data for the serializer
        data = request.data.copy()
        data['user'] = user.id
        data['interest_rate'] = interest_rate
        data['interest_amount'] = interest_amount
        data['total_payment'] = total_payment
        data['member_balance_snapshot'] = member_balance
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['email'] = user.email
        data['phone_number'] = user.phone_number
        
        serializer = LoanRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoanRequestStatusView(APIView):
    def get(self, request, user_id, format=None):
        # Return the most recent loan request for the given user
        loan = LoanRequest.objects.filter(user__id=user_id).order_by('-created_at').first()
        if loan:
            serializer = LoanRequestSerializer(loan)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_200_OK)
        
class LoanRequestListView(ListAPIView):
    """
    View to list all loan requests.
    """
    queryset = LoanRequest.objects.all().order_by('-created_at')
    serializer_class = LoanRequestSerializer

class LoanRequestDetailView(APIView):
    """
    View to retrieve the details of a single loan request.
    """
    def get(self, request, pk, format=None):
        try:
            loan = LoanRequest.objects.get(pk=pk)
            serializer = LoanRequestSerializer(loan)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LoanRequest.DoesNotExist:
            return Response({"detail": "Loan request not found."}, status=status.HTTP_404_NOT_FOUND)

class LoanRequestApproveView(APIView):
    def post(self, request, pk, format=None):
        try:
            loan_request = LoanRequest.objects.get(pk=pk)
            if loan_request.status != 'pending':
                return Response({'detail': 'Loan request is not pending.'}, status=status.HTTP_400_BAD_REQUEST)
            loan_request.status = 'approved'
            loan_request.save()
            serializer = LoanRequestSerializer(loan_request)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LoanRequest.DoesNotExist:
            return Response({'detail': 'Loan request not found.'}, status=status.HTTP_404_NOT_FOUND)

class LoanRequestRejectView(APIView):
    def post(self, request, pk, format=None):
        try:
            loan_request = LoanRequest.objects.get(pk=pk)
            if loan_request.status != 'pending':
                return Response({'detail': 'Loan request is not pending.'}, status=status.HTTP_400_BAD_REQUEST)
            # Optionally, capture a rejection reason from the request data:
            # rejection_reason = request.data.get('reason', '')
            loan_request.status = 'rejected'
            # If you want to save the reason, you could add a field to your model (e.g., rejection_reason)
            loan_request.save()
            serializer = LoanRequestSerializer(loan_request)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LoanRequest.DoesNotExist:
            return Response({'detail': 'Loan request not found.'}, status=status.HTTP_404_NOT_FOUND)
