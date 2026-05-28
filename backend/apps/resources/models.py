from django.db import models
from django.conf import settings


class ResourceCategory(models.Model):
    name = models.CharField(max_length=50, verbose_name='分类名称')
    exam_type = models.CharField(
        max_length=20,
        choices=[('kaoyan', '考研'), ('kaogong', '考公')],
        verbose_name='所属类型'
    )

    class Meta:
        db_table = 'resource_categories'
        verbose_name = '资源分类'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Resource(models.Model):
    title = models.CharField(max_length=200, verbose_name='资源名称')
    description = models.TextField(blank=True, default='', verbose_name='描述')
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources', verbose_name='分类')
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='上传者')
    file = models.FileField(upload_to='resources/%Y/%m/', verbose_name='文件')
    file_size = models.PositiveIntegerField(default=0, verbose_name='文件大小(KB)')
    download_count = models.PositiveIntegerField(default=0, verbose_name='下载次数')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='上传时间')

    class Meta:
        db_table = 'resources'
        ordering = ['-created_at']
        verbose_name = '资源'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title
