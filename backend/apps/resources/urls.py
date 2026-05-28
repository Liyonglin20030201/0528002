from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.ResourceCategoryViewSet)
router.register('', views.ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
