from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, ResourceCategory
from .serializers import ResourceSerializer, ResourceCategorySerializer


class ResourceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.AllowAny]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.select_related('category', 'uploader').all()
    serializer_class = ResourceSerializer
    filterset_fields = ['category', 'category__exam_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'download_count']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        file_size = file.size // 1024 if file else 0
        serializer.save(uploader=self.request.user, file_size=file_size)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.download_count += 1
        resource.save(update_fields=['download_count'])
        return Response({'download_url': request.build_absolute_uri(resource.file.url)})
