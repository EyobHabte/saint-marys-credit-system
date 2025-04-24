# loan/models.py
from django.db import models
from django.conf import settings

class LoanRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    loan_amount = models.DecimalField(max_digits=10, decimal_places=2)
    loan_term = models.PositiveIntegerField()  # in months
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)
    interest_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    member_balance_snapshot = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    def total_repaid(self):
        # Sum of all repayments made on this loan
        repayments = self.repayments.all()
        total = sum([repayment.amount_paid for repayment in repayments]) if repayments else 0
        return total

    def outstanding_balance(self):
        # Outstanding is total_payment minus repaid amount
        return float(self.total_payment) - float(self.total_repaid())
    
    def __str__(self):
        return f"LoanRequest #{self.id} for {self.user.username}"

class LoanRepayment(models.Model):
    loan = models.ForeignKey(LoanRequest, related_name='repayments', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    repayment_date = models.DateTimeField(auto_now_add=True)
    remark = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Repayment of {self.amount_paid} on {self.repayment_date.strftime('%Y-%m-%d')}"
