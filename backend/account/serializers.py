from rest_framework import serializers
from .models import UserAccount
from member.models import Member
from member_registration.models import MemberRequest
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.account_type  # Assuming the user's role is stored in `account_type`

        return token


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'account_type', 'first_name', 'last_name', 'email', 'phone_number', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False, 'allow_blank': True},
        }

    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if UserAccount.objects.filter(username__iexact=value).exists() and (not self.instance or self.instance.username.lower() != value.lower()):
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate_email(self, value):
        if UserAccount.objects.filter(email__iexact=value).exists() and (not self.instance or self.instance.email.lower() != value.lower()):
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_phone_number(self, value):
        if not re.match(r'^\d{10,15}$', value):
            raise serializers.ValidationError("Phone number must contain 10-15 digits.")
        return value

    def validate(self, data):
        # For updates, use instance data for account_type and username if not provided in data.
        const_account_type = data.get('account_type') or (self.instance.account_type if self.instance else None)
        const_username = data.get('username') or (self.instance.username if self.instance else None)

        if const_account_type == 'member' and not self.instance:
            # On creation, ensure that the member exists in the Member table.
            try:
                member = Member.objects.get(username=const_username)
                data['first_name'] = member.first_name
                data['last_name'] = member.last_name
                data['email'] = member.email
                data['phone_number'] = member.phone_number
            except Member.DoesNotExist:
                raise serializers.ValidationError("Member username not found in the Member table.")
        elif const_account_type in ['admin', 'finance_officer']:
            required_fields = ['first_name', 'last_name', 'email', 'phone_number']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                raise serializers.ValidationError(
                    f"The following fields are required for admin or finance officer accounts: {', '.join(missing_fields)}"
                )
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user_account = UserAccount.objects.create(**validated_data)
        if password:
            user_account.set_password(password)
        user_account.save()
        return user_account

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password is not None and password != '':
            instance.set_password(password)
        return super().update(instance, validated_data)
