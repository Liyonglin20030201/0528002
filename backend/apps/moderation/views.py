from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.apps import apps
from .models import Report
from .serializers import ReportCreateSerializer, ReportListSerializer

CONTENT_MODEL_MAP = {
    'experience': ('experience', 'ExperiencePost'),
    'topic': ('topics', 'Topic'),
    'topic_reply': ('topics', 'TopicReply'),
    'comment': ('experience', 'Comment'),
    'resource': ('resources', 'Resource'),
}


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class ReportViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        if self.request.user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action in ['list', 'retrieve', 'my_reports']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        reports = Report.objects.filter(reporter=request.user)
        serializer = ReportListSerializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        result = request.data.get('result', '')
        if new_status not in ('resolved', 'dismissed'):
            return Response({'error': '无效状态'}, status=status.HTTP_400_BAD_REQUEST)

        report.status = new_status
        report.result = result
        report.handler = request.user
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'result', 'handler', 'resolved_at'])

        if new_status == 'resolved':
            self._handle_violating_content(report)

        return Response(ReportListSerializer(report).data)

    def _handle_violating_content(self, report):
        mapping = CONTENT_MODEL_MAP.get(report.content_type)
        if not mapping:
            return
        app_label, model_name = mapping
        try:
            model = apps.get_model(f'apps.{app_label}', model_name)
            obj = model.objects.get(id=report.object_id)
            obj.delete()
        except Exception:
            pass
