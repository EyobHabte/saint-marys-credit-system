from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email', 'phone_number',
            'submitted_at', 'employment_id', 'submitted_by'
        ]
