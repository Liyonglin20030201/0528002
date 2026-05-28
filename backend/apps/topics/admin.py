from django.contrib import admin
from .models import Topic, TopicCategory, TopicReply

@admin.register(TopicCategory)
class TopicCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_type')

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'views', 'is_pinned', 'created_at')
    list_filter = ('category', 'is_pinned')
    search_fields = ('title',)

@admin.register(TopicReply)
class TopicReplyAdmin(admin.ModelAdmin):
    list_display = ('topic', 'author', 'created_at')
