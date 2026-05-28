from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('banks', views.QuestionBankViewSet, basename='question-bank')
router.register('records', views.ExamRecordViewSet, basename='exam-record')
router.register('wrong', views.WrongQuestionViewSet, basename='wrong-question')

urlpatterns = [
    path('', include(router.urls)),
]
