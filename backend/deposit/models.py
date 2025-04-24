# deposit/models.py
from django.db import models
from account.models import UserAccount

class Deposit(models.Model):
    member = models.ForeignKey(
        UserAccount,
        on_delete=models.CASCADE,
        limit_choices_to={'account_type': 'member'}
    )
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_date = models.DateTimeField(auto_now_add=True)
    remark = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Deposit of {self.deposit_amount} for {self.member.username} on {self.deposit_date}"
