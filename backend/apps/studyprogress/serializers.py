from rest_framework import serializers
from .models import StudyRecord, CheckIn


class StudyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyRecord
        fields = ('id', 'date', 'duration', 'subject', 'note', 'created_at')
        read_only_fields = ('user',)


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ('id', 'date', 'created_at')
        read_only_fields = ('user', 'date')
