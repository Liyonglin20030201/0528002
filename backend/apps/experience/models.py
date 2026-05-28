from django.db import models
from django.conf import settings


class ExperiencePost(models.Model):
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='experience_posts', verbose_name='作者')
    exam_type = models.CharField(
        max_length=20,
        choices=[('kaoyan', '考研'), ('kaogong', '考公')],
        verbose_name='类型'
    )
    tags = models.CharField(max_length=200, blank=True, default='', verbose_name='标签')
    views = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    likes = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'experience_posts'
        ordering = ['-created_at']
        verbose_name = '经验帖'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(ExperiencePost, on_delete=models.CASCADE, related_name='comments', verbose_name='帖子')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='评论者')
    content = models.TextField(verbose_name='评论内容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='评论时间')

    class Meta:
        db_table = 'experience_comments'
        ordering = ['created_at']
        verbose_name = '评论'
        verbose_name_plural = verbose_name
