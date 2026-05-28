from django.db import models
from django.conf import settings


class QuestionBank(models.Model):
    EXAM_TYPE_CHOICES = [
        ('kaoyan', '考研'),
        ('kaogong', '考公'),
    ]

    name = models.CharField(max_length=100, verbose_name='题库名称')
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES, verbose_name='考试类型')
    subject = models.CharField(max_length=50, verbose_name='科目')
    year = models.PositiveIntegerField(null=True, blank=True, verbose_name='年份')
    description = models.TextField(blank=True, default='', verbose_name='描述')
    question_count = models.PositiveIntegerField(default=0, verbose_name='题目数量')
    time_limit = models.PositiveIntegerField(default=0, verbose_name='限时(分钟)，0表示不限时')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'question_banks'
        ordering = ['-year', 'subject']
        verbose_name = '题库'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Question(models.Model):
    TYPE_CHOICES = [
        ('single', '单选'),
        ('multiple', '多选'),
        ('judge', '判断'),
    ]

    bank = models.ForeignKey(QuestionBank, on_delete=models.CASCADE, related_name='questions', verbose_name='所属题库')
    question_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='single', verbose_name='题型')
    content = models.TextField(verbose_name='题目内容')
    option_a = models.CharField(max_length=500, blank=True, default='', verbose_name='选项A')
    option_b = models.CharField(max_length=500, blank=True, default='', verbose_name='选项B')
    option_c = models.CharField(max_length=500, blank=True, default='', verbose_name='选项C')
    option_d = models.CharField(max_length=500, blank=True, default='', verbose_name='选项D')
    answer = models.CharField(max_length=10, verbose_name='正确答案')
    explanation = models.TextField(blank=True, default='', verbose_name='解析')
    order = models.PositiveIntegerField(default=0, verbose_name='题目顺序')

    class Meta:
        db_table = 'questions'
        ordering = ['order']
        verbose_name = '题目'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.bank.name} - 第{self.order}题'


class ExamRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_records', verbose_name='用户')
    bank = models.ForeignKey(QuestionBank, on_delete=models.CASCADE, related_name='exam_records', verbose_name='题库')
    score = models.PositiveIntegerField(default=0, verbose_name='得分')
    total = models.PositiveIntegerField(default=0, verbose_name='总题数')
    correct_count = models.PositiveIntegerField(default=0, verbose_name='正确数')
    duration = models.PositiveIntegerField(default=0, verbose_name='用时(秒)')
    started_at = models.DateTimeField(verbose_name='开始时间')
    finished_at = models.DateTimeField(auto_now_add=True, verbose_name='结束时间')

    class Meta:
        db_table = 'exam_records'
        ordering = ['-finished_at']
        verbose_name = '考试记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - {self.bank.name} - {self.score}分'


class WrongQuestion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wrong_questions', verbose_name='用户')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='wrong_records', verbose_name='题目')
    user_answer = models.CharField(max_length=10, verbose_name='用户答案')
    added_at = models.DateTimeField(auto_now_add=True, verbose_name='加入时间')
    is_mastered = models.BooleanField(default=False, verbose_name='是否已掌握')

    class Meta:
        db_table = 'wrong_questions'
        unique_together = ('user', 'question')
        ordering = ['-added_at']
        verbose_name = '错题'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.user.username} - {self.question}'
