from rest_framework import serializers
from .models import UserPoints, PointsLog


class UserPointsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    next_level_points = serializers.SerializerMethodField()

    class Meta:
        model = UserPoints
        fields = ('total_points', 'level', 'sign_in_streak', 'last_sign_in',
                  'username', 'next_level_points')

    def get_next_level_points(self, obj):
        thresholds = [0, 50, 150, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000]
        if obj.level < len(thresholds):
            return thresholds[obj.level]
        return None


class PointsLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = PointsLog
        fields = ('id', 'action', 'action_display', 'points', 'description', 'created_at')


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = UserPoints
        fields = ('username', 'avatar', 'total_points', 'level')
