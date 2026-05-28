from django.contrib import admin
from .models import ExperiencePost, Comment

@admin.register(ExperiencePost)
class ExperiencePostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'exam_type', 'views', 'likes', 'created_at')
    list_filter = ('exam_type',)
    search_fields = ('title',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
