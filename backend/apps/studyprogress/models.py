from django.db import models
from django.conf import settings


class StudyRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_records', verbose_name='用户')
    plan = models.ForeignKey('studyplan.StudyPlan', on_delete=models.SET_NULL, null=True, blank=True, related_name='study_records', verbose_name='关联计划')
    date = models.DateField(verbose_name='学习日期')
    duration = models.PositiveIntegerField(default=0, verbose_name='学习时长(分钟)')
    subject = models.CharField(max_length=50, blank=True, default='', verbose_name='学习科目')
    note = models.CharField(max_length=200, blank=True, default='', verbose_name='学习备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'study_records'
        ordering = ['-date']
        unique_together = ('user', 'date', 'subject')
        verbose_name = '学习记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - {self.date} - {self.duration}min'


class CheckIn(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='checkins', verbose_name='用户')
    date = models.DateField(verbose_name='打卡日期')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='打卡时间')

    class Meta:
        db_table = 'checkins'
        unique_together = ('user', 'date')
        ordering = ['-date']
        verbose_name = '打卡记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - {self.date}'
