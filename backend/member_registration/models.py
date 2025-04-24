from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings

class MemberRequest(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=150, unique=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    password = models.CharField(max_length=256)  # Encrypted password
    confirm_password = models.CharField(max_length=256)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')])
    address = models.TextField()
    date_of_birth = models.DateField()
    employment_type = models.CharField(max_length=50, choices=[
        ('Lecturer', 'Lecturer'),
        ('Administrative Staff', 'Administrative Staff'),
        ('Technical Staff', 'Technical Staff'),
        ('Support Staff', 'Support Staff'),
    ])
    employment_id = models.ImageField(upload_to='employment_ids/')
    is_approved = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def set_encrypted_password(self, raw_password):
        cipher = Fernet(settings.SECRET_ENCRYPTION_KEY)
        self.password = cipher.encrypt(raw_password.encode()).decode()

    def get_encrypted_password(self):
        return self.password

    def get_decrypted_password(self):
        try:
            cipher = Fernet(settings.SECRET_ENCRYPTION_KEY)
            return cipher.decrypt(self.password.encode()).decode()
        except Exception as e:
            print(f"Decryption error: {e}")
            return None

    def save(self, *args, **kwargs):
        if not self.pk:  # Encrypt password only on creation
            self.set_encrypted_password(self.password)
        super().save(*args, **kwargs)