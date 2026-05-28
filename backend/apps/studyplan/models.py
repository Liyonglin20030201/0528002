from django.db import models
from django.conf import settings


class StudyPlan(models.Model):
    STATUS_CHOICES = [
        ('active', '进行中'),
        ('completed', '已完成'),
        ('abandoned', '已放弃'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans', verbose_name='用户')
    title = models.CharField(max_length=200, verbose_name='计划名称')
    description = models.TextField(blank=True, default='', verbose_name='计划描述')
    exam_type = models.CharField(
        max_length=20,
        choices=[('kaoyan', '考研'), ('kaogong', '考公')],
        verbose_name='备考类型'
    )
    target_date = models.DateField(verbose_name='目标日期')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'study_plans'
        ordering = ['-created_at']
        verbose_name = '学习计划'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title


class TodoItem(models.Model):
    PRIORITY_CHOICES = [
        ('high', '高'),
        ('medium', '中'),
        ('low', '低'),
    ]

    plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='todos', verbose_name='所属计划')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='用户')
    title = models.CharField(max_length=200, verbose_name='待办事项')
    description = models.TextField(blank=True, default='', verbose_name='详细描述')
    due_date = models.DateField(null=True, blank=True, verbose_name='截止日期')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name='优先级')
    is_completed = models.BooleanField(default=False, verbose_name='是否完成')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='完成时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'todo_items'
        ordering = ['is_completed', '-priority', 'due_date']
        verbose_name = '待办事项'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title
