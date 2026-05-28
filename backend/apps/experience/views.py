from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ExperiencePost, Comment
from .serializers import ExperienceListSerializer, ExperienceDetailSerializer, CommentSerializer


class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = ExperiencePost.objects.select_related('author').all()
    filterset_fields = ['exam_type', 'author']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'views', 'likes']

    def get_serializer_class(self):
        if self.action == 'list':
            return ExperienceListSerializer
        return ExperienceDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        post.likes += 1
        post.save(update_fields=['likes'])
        return Response({'likes': post.likes})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs.get('post_pk'))

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, post_id=self.kwargs.get('post_pk'))
