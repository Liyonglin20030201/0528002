from rest_framework import serializers
from .models import Report


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'content_type', 'object_id', 'reason', 'description', 'created_at')
        read_only_fields = ('reporter',)


class ReportListSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    handler_name = serializers.CharField(source='handler.username', read_only=True, default=None)

    class Meta:
        model = Report
        fields = ('id', 'reporter', 'reporter_name', 'content_type', 'object_id',
                  'reason', 'description', 'status', 'handler_name', 'result',
                  'created_at', 'resolved_at')
