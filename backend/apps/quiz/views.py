from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import QuestionBank, Question, ExamRecord, WrongQuestion
from .serializers import (
    QuestionBankListSerializer, QuestionBankDetailSerializer,
    ExamRecordSerializer, WrongQuestionSerializer, QuestionWithAnswerSerializer
)


class QuestionBankViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuestionBank.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['exam_type', 'subject', 'year']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuestionBankDetailSerializer
        return QuestionBankListSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        bank = self.get_object()
        answers = request.data.get('answers', {})
        started_at = request.data.get('started_at')
        questions = bank.questions.all()

        correct_count = 0
        wrong_items = []
        for question in questions:
            user_answer = answers.get(str(question.id), '')
            if user_answer.upper() == question.answer.upper():
                correct_count += 1
            else:
                if user_answer:
                    wrong_items.append((question, user_answer))

        total = questions.count()
        score = round(correct_count / total * 100) if total > 0 else 0
        duration = int((timezone.now() - timezone.datetime.fromisoformat(started_at)).total_seconds()) if started_at else 0

        record = ExamRecord.objects.create(
            user=request.user,
            bank=bank,
            score=score,
            total=total,
            correct_count=correct_count,
            duration=duration,
            started_at=started_at or timezone.now(),
        )

        for question, user_answer in wrong_items:
            WrongQuestion.objects.update_or_create(
                user=request.user,
                question=question,
                defaults={'user_answer': user_answer, 'is_mastered': False}
            )

        return Response(ExamRecordSerializer(record).data, status=status.HTTP_201_CREATED)


class ExamRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExamRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['bank']

    def get_queryset(self):
        return ExamRecord.objects.filter(user=self.request.user)


class WrongQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = WrongQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_mastered']

    def get_queryset(self):
        return WrongQuestion.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_mastered(self, request, pk=None):
        item = self.get_object()
        item.is_mastered = not item.is_mastered
        item.save(update_fields=['is_mastered'])
        return Response(WrongQuestionSerializer(item).data)
