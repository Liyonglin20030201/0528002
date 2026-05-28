from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='头像')
    bio = models.TextField(blank=True, default='', verbose_name='个人简介')
    exam_type = models.CharField(
        max_length=20,
        choices=[('kaoyan', '考研'), ('kaogong', '考公'), ('both', '都关注')],
        default='both',
        verbose_name='关注类型'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='注册时间')

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = verbose_name


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    content_type = models.CharField(
        max_length=20,
        choices=[('news', '资讯'), ('experience', '经验帖'), ('resource', '资源'), ('topic', '话题')],
        verbose_name='内容类型'
    )
    object_id = models.PositiveIntegerField(verbose_name='对象ID')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='收藏时间')

    class Meta:
        db_table = 'favorites'
        unique_together = ('user', 'content_type', 'object_id')
        verbose_name = '收藏'
        verbose_name_plural = verbose_name
