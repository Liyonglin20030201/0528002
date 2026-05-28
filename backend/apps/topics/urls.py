from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.TopicCategoryViewSet)
router.register('', views.TopicViewSet, basename='topic')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:topic_pk>/replies/', views.TopicReplyViewSet.as_view({'get': 'list', 'post': 'create'}), name='topic-replies'),
]
