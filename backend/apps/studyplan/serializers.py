from rest_framework import serializers
from .models import StudyPlan, TodoItem


class TodoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItem
        fields = ('id', 'plan', 'title', 'description', 'due_date', 'priority',
                  'is_completed', 'completed_at', 'created_at')
        read_only_fields = ('plan', 'user', 'completed_at')


class StudyPlanListSerializer(serializers.ModelSerializer):
    todo_total = serializers.IntegerField(source='todos.count', read_only=True)
    todo_completed = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = ('id', 'title', 'exam_type', 'target_date', 'status',
                  'todo_total', 'todo_completed', 'created_at')

    def get_todo_completed(self, obj):
        return obj.todos.filter(is_completed=True).count()


class StudyPlanDetailSerializer(serializers.ModelSerializer):
    todos = TodoItemSerializer(many=True, read_only=True)

    class Meta:
        model = StudyPlan
        fields = ('id', 'title', 'description', 'exam_type', 'target_date',
                  'status', 'todos', 'created_at', 'updated_at')
        read_only_fields = ('user',)
