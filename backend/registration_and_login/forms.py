from django import forms
from django.contrib.auth.hashers import make_password
from .models import MemberRequest

class RegistrationForm(forms.Form):
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    username = forms.CharField(max_length=150)
    phone_number = forms.CharField(max_length=15)
    email = forms.EmailField(required=False)
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    employment_id = forms.ImageField()
    
    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        # Check if username already exists
        if MemberRequest.objects.filter(username=username).exists():
            raise forms.ValidationError({"username": "This username is already taken. Please choose another one."})

        # Check if passwords match
        if password != confirm_password:
            raise forms.ValidationError({"confirm_password": "Passwords do not match."})
        
        return cleaned_data

    def save(self, commit=True):
        # Create a new MemberRequest instance
        instance = MemberRequest(
            username=self.cleaned_data['username'],
            full_name=self.cleaned_data['full_name'],
            phone_number=self.cleaned_data['phone_number'],
            email=self.cleaned_data['email'],
            employment_id=self.cleaned_data['employment_id'],
        )

        # Hash the password
        instance.password = make_password(self.cleaned_data['password'])

        # Save the instance to the database if commit is True
        if commit:
            instance.save()
        return instance
