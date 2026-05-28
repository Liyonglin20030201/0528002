from django.contrib import admin
from .models import Resource, ResourceCategory

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'exam_type')

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'uploader', 'file_size', 'download_count', 'created_at')
    list_filter = ('category',)
    search_fields = ('title',)
