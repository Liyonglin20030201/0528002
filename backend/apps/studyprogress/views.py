from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncDate
from datetime import timedelta
from .models import StudyRecord, CheckIn
from .serializers import StudyRecordSerializer, CheckInSerializer
from apps.studyplan.models import StudyPlan


class StudyRecordViewSet(viewsets.ModelViewSet):
    serializer_class = StudyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['date', 'subject', 'plan']

    def get_queryset(self):
        return StudyRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days - 1)
        records = StudyRecord.objects.filter(
            user=request.user,
            date__gte=start_date
        )
        daily_stats = records.values('date').annotate(
            total_duration=Sum('duration')
        ).order_by('date')

        total_duration = records.aggregate(total=Sum('duration'))['total'] or 0
        study_days = records.values('date').distinct().count()

        subject_stats = records.values('subject').annotate(
            total_duration=Sum('duration')
        ).order_by('-total_duration')

        return Response({
            'daily_stats': list(daily_stats),
            'total_duration': total_duration,
            'study_days': study_days,
            'avg_duration': round(total_duration / study_days) if study_days > 0 else 0,
            'subject_stats': list(subject_stats),
        })

    @action(detail=False, methods=['get'])
    def reminders(self, request):
        today = timezone.now().date()
        days_ahead = int(request.query_params.get('days', 7))
        deadline = today + timedelta(days=days_ahead)

        plans = StudyPlan.objects.filter(
            user=request.user,
            status='active',
            target_date__lte=deadline,
        ).order_by('target_date')

        reminders = []
        for plan in plans:
            days_left = (plan.target_date - today).days
            total_todos = plan.todos.count()
            completed_todos = plan.todos.filter(is_completed=True).count()
            total_study_duration = StudyRecord.objects.filter(
                user=request.user, plan=plan
            ).aggregate(total=Sum('duration'))['total'] or 0

            if days_left < 0:
                urgency = 'overdue'
            elif days_left <= 3:
                urgency = 'urgent'
            else:
                urgency = 'upcoming'

            reminders.append({
                'plan_id': plan.id,
                'title': plan.title,
                'exam_type': plan.exam_type,
                'target_date': plan.target_date.isoformat(),
                'days_left': days_left,
                'urgency': urgency,
                'todo_total': total_todos,
                'todo_completed': completed_todos,
                'total_study_duration': total_study_duration,
            })

        return Response(reminders)


class CheckInViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CheckIn.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def today(self, request):
        today = timezone.now().date()
        checkin, created = CheckIn.objects.get_or_create(
            user=request.user,
            date=today
        )
        if not created:
            return Response({'detail': '今日已打卡', 'checkin': CheckInSerializer(checkin).data})
        return Response({'detail': '打卡成功', 'checkin': CheckInSerializer(checkin).data}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def streak(self, request):
        today = timezone.now().date()
        checkins = CheckIn.objects.filter(user=request.user).order_by('-date')
        streak = 0
        current_date = today
        for checkin in checkins:
            if checkin.date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            elif checkin.date < current_date:
                break
        total_checkins = checkins.count()
        checked_today = checkins.filter(date=today).exists()
        return Response({
            'streak': streak,
            'total_checkins': total_checkins,
            'checked_today': checked_today,
        })
