# models.py (account app)
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models

class UserAccountManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)

class UserAccount(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    account_type = models.CharField(
        max_length=20,
        choices=[('admin', 'Admin'), ('finance_officer', 'Finance Officer'), ('member', 'Member')],
        default='member'
    )
    # Revert to the default max_length (128)
    password = models.CharField(max_length=128)

    groups = models.ManyToManyField(
        Group,
        related_name='useraccount_groups',
        blank=True,
        help_text="The groups this user belongs to."
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='useraccount_permissions',
        blank=True,
        help_text="Specific permissions for this user."
    )

    objects = UserAccountManager()
