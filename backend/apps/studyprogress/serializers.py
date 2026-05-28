from rest_framework import serializers
from .models import StudyRecord, CheckIn


class StudyRecordSerializer(serializers.ModelSerializer):
    plan_title = serializers.CharField(source='plan.title', read_only=True, default=None)

    class Meta:
        model = StudyRecord
        fields = ('id', 'plan', 'plan_title', 'date', 'duration', 'subject', 'note', 'created_at')
        read_only_fields = ('user',)


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ('id', 'date', 'created_at')
        read_only_fields = ('user', 'date')
