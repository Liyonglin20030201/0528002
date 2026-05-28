from django.db import models
from django.conf import settings


class Report(models.Model):
    CONTENT_TYPES = [
        ('experience', '经验帖'),
        ('topic', '话题'),
        ('topic_reply', '话题回复'),
        ('comment', '评论'),
        ('resource', '资源'),
    ]
    REASON_CHOICES = [
        ('spam', '垃圾信息'),
        ('ads', '广告'),
        ('inappropriate', '不当内容'),
        ('plagiarism', '抄袭'),
        ('other', '其他'),
    ]
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('resolved', '已处理'),
        ('dismissed', '已驳回'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports', verbose_name='举报人')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, verbose_name='内容类型')
    object_id = models.PositiveIntegerField(verbose_name='内容ID')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, verbose_name='举报原因')
    description = models.TextField(blank=True, default='', verbose_name='详细描述')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    handler = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_reports', verbose_name='处理人')
    result = models.TextField(blank=True, default='', verbose_name='处理结果')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='举报时间')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='处理时间')

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
        verbose_name = '举报'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.reporter.username} 举报 {self.content_type}#{self.object_id}'
