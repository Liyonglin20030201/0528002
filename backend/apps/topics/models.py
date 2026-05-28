from django.db import models
from django.conf import settings


class TopicCategory(models.Model):
    name = models.CharField(max_length=50, verbose_name='分类名称')
    category_type = models.CharField(
        max_length=20,
        choices=[('school', '院校'), ('subject', '科目')],
        verbose_name='分类类型'
    )
    description = models.TextField(blank=True, default='', verbose_name='描述')

    class Meta:
        db_table = 'topic_categories'
        verbose_name = '话题分类'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Topic(models.Model):
    title = models.CharField(max_length=200, verbose_name='话题标题')
    content = models.TextField(verbose_name='话题内容')
    category = models.ForeignKey(TopicCategory, on_delete=models.CASCADE, related_name='topics', verbose_name='分类')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='发布者')
    views = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    is_pinned = models.BooleanField(default=False, verbose_name='是否置顶')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'topics'
        ordering = ['-is_pinned', '-created_at']
        verbose_name = '话题'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title


class TopicReply(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='replies', verbose_name='话题')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='回复者')
    content = models.TextField(verbose_name='回复内容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='回复时间')

    class Meta:
        db_table = 'topic_replies'
        ordering = ['created_at']
        verbose_name = '话题回复'
        verbose_name_plural = verbose_name
