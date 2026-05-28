from rest_framework import serializers
from .models import QuestionBank, Question, ExamRecord, WrongQuestion


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'question_type', 'content', 'option_a', 'option_b',
                  'option_c', 'option_d', 'order')


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'question_type', 'content', 'option_a', 'option_b',
                  'option_c', 'option_d', 'answer', 'explanation', 'order')


class QuestionBankListSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = ('id', 'name', 'exam_type', 'subject', 'year', 'description',
                  'question_count', 'time_limit', 'created_at')


class QuestionBankDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionBank
        fields = ('id', 'name', 'exam_type', 'subject', 'year', 'description',
                  'question_count', 'time_limit', 'questions', 'created_at')


class ExamRecordSerializer(serializers.ModelSerializer):
    bank_name = serializers.CharField(source='bank.name', read_only=True)

    class Meta:
        model = ExamRecord
        fields = ('id', 'bank', 'bank_name', 'score', 'total', 'correct_count',
                  'duration', 'started_at', 'finished_at')


class WrongQuestionSerializer(serializers.ModelSerializer):
    question_detail = QuestionWithAnswerSerializer(source='question', read_only=True)

    class Meta:
        model = WrongQuestion
        fields = ('id', 'question', 'question_detail', 'user_answer', 'added_at', 'is_mastered')
        read_only_fields = ('user',)
