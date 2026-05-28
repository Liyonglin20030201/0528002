from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Topic, TopicCategory, TopicReply
from .serializers import TopicListSerializer, TopicDetailSerializer, TopicCategorySerializer, TopicReplySerializer
from apps.permissions import IsOwnerOrReadOnly
from apps.messages.utils import create_notification


class TopicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TopicCategory.objects.all()
    serializer_class = TopicCategorySerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['category_type']


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.select_related('category', 'author').all()
    filterset_fields = ['category', 'category__category_type', 'is_pinned']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views']

    def get_serializer_class(self):
        if self.action == 'list':
            return TopicListSerializer
        return TopicDetailSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        if self.action == 'create':
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


class TopicReplyViewSet(viewsets.ModelViewSet):
    serializer_class = TopicReplySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return TopicReply.objects.filter(topic_id=self.kwargs.get('topic_pk'))

    def perform_create(self, serializer):
        reply = serializer.save(author=self.request.user, topic_id=self.kwargs.get('topic_pk'))
        topic = reply.topic
        create_notification(
            recipient=topic.author,
            sender=self.request.user,
            notification_type='reply',
            title='收到新回复',
            content=f'{self.request.user.username} 回复了你的话题「{topic.title}」',
            related_type='topic',
            related_id=topic.id,
        )
