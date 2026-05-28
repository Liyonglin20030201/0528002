from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserPoints, PointsLog, POINTS_RULES
from .serializers import UserPointsSerializer, PointsLogSerializer, LeaderboardSerializer


def award_points(user, action_type, description=''):
    profile, _ = UserPoints.objects.get_or_create(user=user)
    points = POINTS_RULES.get(action_type, 0)

    if action_type == 'sign_in' and profile.sign_in_streak > 0:
        points += min(profile.sign_in_streak, 7) * POINTS_RULES['sign_in_streak_bonus']

    profile.total_points += points
    profile.update_level()
    profile.save()

    PointsLog.objects.create(
        user=user,
        action=action_type,
        points=points,
        description=description or dict(PointsLog.ACTION_CHOICES).get(action_type, ''),
    )
    return points


class PointsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_points(self, request):
        profile, _ = UserPoints.objects.get_or_create(user=request.user)
        return Response(UserPointsSerializer(profile).data)

    @action(detail=False, methods=['get'])
    def logs(self, request):
        logs = PointsLog.objects.filter(user=request.user)[:50]
        return Response(PointsLogSerializer(logs, many=True).data)

    @action(detail=False, methods=['post'])
    def sign_in(self, request):
        today = timezone.now().date()
        profile, _ = UserPoints.objects.get_or_create(user=request.user)

        if profile.last_sign_in == today:
            return Response({'detail': '今日已签到'}, status=status.HTTP_400_BAD_REQUEST)

        if profile.last_sign_in == today - timedelta(days=1):
            profile.sign_in_streak += 1
        else:
            profile.sign_in_streak = 1

        profile.last_sign_in = today
        profile.save(update_fields=['last_sign_in', 'sign_in_streak'])

        points = award_points(request.user, 'sign_in', f'每日签到(连续{profile.sign_in_streak}天)')
        return Response({
            'detail': '签到成功',
            'points_earned': points,
            'streak': profile.sign_in_streak,
            'total_points': profile.total_points,
            'level': profile.level,
        })

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        top_users = UserPoints.objects.select_related('user').order_by('-total_points')[:20]
        return Response(LeaderboardSerializer(top_users, many=True).data)

    @action(detail=False, methods=['get'])
    def level_info(self, request):
        thresholds = [0, 50, 150, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000]
        privileges = {
            1: '基础功能',
            2: '头像挂件',
            3: '自定义签名',
            4: '发帖置顶(1次/周)',
            5: '专属标识',
            6: '下载不限速',
            7: '优先审核',
            8: '创建题库',
            9: 'VIP标识',
            10: '管理员推荐',
            11: '至尊会员',
        }
        levels = []
        for i, threshold in enumerate(thresholds):
            levels.append({
                'level': i + 1,
                'points_required': threshold,
                'privilege': privileges.get(i + 1, ''),
            })
        return Response(levels)
