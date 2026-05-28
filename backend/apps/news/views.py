from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import News, NewsCategory
from .serializers import NewsListSerializer, NewsDetailSerializer, NewsCategorySerializer


class NewsCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer
    permission_classes = [permissions.AllowAny]


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.select_related('category', 'author').all()
    filterset_fields = ['category', 'category__category_type', 'is_top']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views']

    def get_serializer_class(self):
        if self.action == 'list':
            return NewsListSerializer
        return NewsDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
