from django.db import models
from django.utils import timezone

class MemberRequest(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    password = models.CharField(max_length=128)
    confirm_password = models.CharField(max_length=128)
    employment_id = models.ImageField(upload_to='employment_ids/')
    is_approved = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username
class Member(models.Model):
    full_name = models.CharField(max_length=255)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(default=timezone.now)
    employment_id = models.ImageField(upload_to='employment_ids/')
    submitted_by = models.CharField(max_length=255)  # Name of the submitter

    def __str__(self):
        return f"{self.full_name} ({self.username})"