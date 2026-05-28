from django.contrib import admin
from .models import StudyPlan, TodoItem


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'exam_type', 'target_date', 'status', 'created_at')
    list_filter = ('status', 'exam_type')
    search_fields = ('title',)


@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'plan', 'user', 'priority', 'is_completed', 'due_date')
    list_filter = ('priority', 'is_completed')
    search_fields = ('title',)
