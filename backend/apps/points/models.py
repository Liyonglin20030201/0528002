from django.db import models
from django.conf import settings


class UserPoints(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_profile', verbose_name='用户')
    total_points = models.PositiveIntegerField(default=0, verbose_name='总积分')
    level = models.PositiveIntegerField(default=1, verbose_name='等级')
    sign_in_streak = models.PositiveIntegerField(default=0, verbose_name='连续签到天数')
    last_sign_in = models.DateField(null=True, blank=True, verbose_name='上次签到日期')

    class Meta:
        db_table = 'user_points'
        verbose_name = '用户积分'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - Lv.{self.level} - {self.total_points}积分'

    @staticmethod
    def get_level_for_points(points):
        thresholds = [0, 50, 150, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000]
        for i in range(len(thresholds) - 1, -1, -1):
            if points >= thresholds[i]:
                return i + 1
        return 1

    def update_level(self):
        self.level = self.get_level_for_points(self.total_points)
        self.save(update_fields=['level'])


class PointsLog(models.Model):
    ACTION_CHOICES = [
        ('sign_in', '每日签到'),
        ('post', '发帖'),
        ('comment', '评论'),
        ('like_received', '被点赞'),
        ('upload_resource', '上传资源'),
        ('quiz_complete', '完成刷题'),
        ('checkin', '学习打卡'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_logs', verbose_name='用户')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name='行为')
    points = models.IntegerField(verbose_name='积分变动')
    description = models.CharField(max_length=200, blank=True, default='', verbose_name='描述')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='时间')

    class Meta:
        db_table = 'points_log'
        ordering = ['-created_at']
        verbose_name = '积分记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - {self.action} - {self.points}'


POINTS_RULES = {
    'sign_in': 5,
    'sign_in_streak_bonus': 2,
    'post': 10,
    'comment': 3,
    'like_received': 2,
    'upload_resource': 15,
    'quiz_complete': 5,
    'checkin': 3,
}
