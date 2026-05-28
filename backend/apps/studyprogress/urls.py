from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('records', views.StudyRecordViewSet, basename='study-record')
router.register('checkin', views.CheckInViewSet, basename='checkin')

urlpatterns = [
    path('', include(router.urls)),
]
