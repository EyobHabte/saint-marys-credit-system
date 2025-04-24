# withdraw/models.py
from django.db import models
from account.models import UserAccount

class Withdraw(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    member = models.ForeignKey(
        UserAccount,
        on_delete=models.CASCADE,
        limit_choices_to={'account_type': 'member'}
    )
    withdraw_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # New bank account field:
    bank_account = models.CharField(max_length=50, blank=True, null=True)
    withdraw_date = models.DateTimeField(auto_now_add=True)
    remark = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Withdraw {self.withdraw_amount} for {self.member.username} on {self.withdraw_date}"
