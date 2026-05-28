from django.db import models
from django.conf import settings


class NewsCategory(models.Model):
    name = models.CharField(max_length=50, verbose_name='分类名称')
    category_type = models.CharField(
        max_length=20,
        choices=[('kaoyan', '考研'), ('kaogong', '考公')],
        verbose_name='所属类型'
    )

    class Meta:
        db_table = 'news_categories'
        verbose_name = '资讯分类'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class News(models.Model):
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    category = models.ForeignKey(NewsCategory, on_delete=models.CASCADE, related_name='news', verbose_name='分类')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='作者')
    source = models.CharField(max_length=100, blank=True, default='', verbose_name='信息来源')
    views = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    is_top = models.BooleanField(default=False, verbose_name='是否置顶')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'news'
        ordering = ['-is_top', '-created_at']
        verbose_name = '资讯'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title
