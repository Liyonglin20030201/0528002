from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncDate
from datetime import timedelta
from .models import StudyRecord, CheckIn
from .serializers import StudyRecordSerializer, CheckInSerializer


class StudyRecordViewSet(viewsets.ModelViewSet):
    serializer_class = StudyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['date', 'subject']

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
