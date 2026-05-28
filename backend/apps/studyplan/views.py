from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import StudyPlan, TodoItem
from .serializers import StudyPlanListSerializer, StudyPlanDetailSerializer, TodoItemSerializer


class StudyPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'exam_type']

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return StudyPlanListSerializer
        return StudyPlanDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        plan = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(StudyPlan.STATUS_CHOICES):
            plan.status = new_status
            plan.save(update_fields=['status'])
            return Response({'status': plan.status})
        return Response({'error': '无效状态'}, status=status.HTTP_400_BAD_REQUEST)


class TodoItemViewSet(viewsets.ModelViewSet):
    serializer_class = TodoItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_completed', 'priority']

    def get_queryset(self):
        return TodoItem.objects.filter(plan_id=self.kwargs.get('plan_pk'), user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, plan_id=self.kwargs.get('plan_pk'))

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, **kwargs):
        todo = self.get_object()
        todo.is_completed = not todo.is_completed
        todo.completed_at = timezone.now() if todo.is_completed else None
        todo.save(update_fields=['is_completed', 'completed_at'])
        return Response(TodoItemSerializer(todo).data)
