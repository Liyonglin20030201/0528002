from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('plans', views.StudyPlanViewSet, basename='studyplan')

urlpatterns = [
    path('', include(router.urls)),
    path('plans/<int:plan_pk>/todos/', views.TodoItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='plan-todos'),
    path('plans/<int:plan_pk>/todos/<int:pk>/', views.TodoItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='plan-todo-detail'),
    path('plans/<int:plan_pk>/todos/<int:pk>/toggle_complete/', views.TodoItemViewSet.as_view({'post': 'toggle_complete'}), name='plan-todo-toggle'),
]
