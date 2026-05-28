from django.contrib import admin
from .models import QuestionBank, Question, ExamRecord, WrongQuestion


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ('name', 'exam_type', 'subject', 'year', 'question_count')
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('bank', 'order', 'question_type', 'content', 'answer')
    list_filter = ('bank', 'question_type')


admin.site.register(ExamRecord)
admin.site.register(WrongQuestion)
