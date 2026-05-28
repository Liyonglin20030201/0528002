from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('comment', '评论'),
        ('like', '点赞'),
        ('reply', '回复'),
        ('system', '系统通知'),
    ]
    RELATED_TYPES = [
        ('experience', '经验帖'),
        ('topic', '话题'),
        ('news', '资讯'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', verbose_name='接收者')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications', verbose_name='发送者')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, verbose_name='通知类型')
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.CharField(max_length=500, verbose_name='内容')
    related_type = models.CharField(max_length=20, choices=RELATED_TYPES, null=True, blank=True, verbose_name='关联类型')
    related_id = models.PositiveIntegerField(null=True, blank=True, verbose_name='关联ID')
    is_read = models.BooleanField(default=False, verbose_name='是否已读')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = '通知'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.title} -> {self.recipient.username}'


class Conversation(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations_as_user1', verbose_name='用户1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations_as_user2', verbose_name='用户2')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'conversations'
        unique_together = ('user1', 'user2')
        ordering = ['-updated_at']
        verbose_name = '会话'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user1.username} <-> {self.user2.username}'


class PrivateMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', verbose_name='会话')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='发送者')
    content = models.TextField(verbose_name='消息内容')
    is_read = models.BooleanField(default=False, verbose_name='是否已读')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='发送时间')

    class Meta:
        db_table = 'private_messages'
        ordering = ['created_at']
        verbose_name = '私信'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.sender.username}: {self.content[:20]}'
