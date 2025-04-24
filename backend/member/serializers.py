from rest_framework import serializers
from .models import Member,Transaction



class MemberSerializer(serializers.ModelSerializer):
    existing_employment_id = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Member
        fields = '__all__'

    def validate(self, data):
        if self.instance:  # Skip validation for updates if instance exists
            return data
        if not data.get('employment_id') and not data.get('existing_employment_id'):
            raise serializers.ValidationError({
                "employment_id": "A file or an existing employment ID must be provided for new members."
            })
        return data

    def create(self, validated_data):
        existing_employment_id = validated_data.pop('existing_employment_id', None)
        if not validated_data.get('employment_id') and existing_employment_id:
            validated_data['employment_id'] = existing_employment_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        existing_employment_id = validated_data.pop('existing_employment_id', None)
        # Use the existing employment_id if a new one is not provided
        if 'employment_id' not in validated_data and existing_employment_id:
            validated_data['employment_id'] = existing_employment_id
        
        return super().update(instance, validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

