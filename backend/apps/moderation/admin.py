from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'content_type', 'object_id', 'reason', 'status', 'handler', 'created_at')
    list_filter = ('status', 'reason', 'content_type')
    search_fields = ('description',)
    readonly_fields = ('reporter', 'content_type', 'object_id', 'reason', 'description', 'created_at')
