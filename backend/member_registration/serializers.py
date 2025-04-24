from rest_framework import serializers
from .models import MemberRequest
from django.contrib.auth.hashers import make_password

class MemberRequestSerializer(serializers.ModelSerializer):
    employment_id = serializers.ImageField(required=False)  # Make it optional

    class Meta:
        model = MemberRequest
        fields = '__all__'
        extra_kwargs = {
            'unencrypted_password': {'read_only': True},  # Admin can only read this field
        }

    def validate(self, data):
        # Ensure passwords match
        if data['password'] != data.get('confirm_password', ''):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # If employment_id is not provided, raise a user-friendly error
        if not data.get('employment_id'):
            raise serializers.ValidationError({"employment_id": "Employment ID is required for registration."})

        return data

    def create(self, validated_data):
       
        validated_data.pop('confirm_password', None)
        return super().create(validated_data)
