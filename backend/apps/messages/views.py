from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Notification, Conversation, PrivateMessage
from .serializers import (
    NotificationSerializer, ConversationListSerializer,
    ConversationCreateSerializer, PrivateMessageSerializer
)

User = get_user_model()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_read', 'notification_type']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(user1=user) | Q(user2=user))

    def create(self, request, *args, **kwargs):
        serializer = ConversationCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['user_id']
        other_user = User.objects.get(id=user_id)
        user1, user2 = (request.user, other_user) if request.user.id < other_user.id else (other_user, request.user)
        conversation, created = Conversation.objects.get_or_create(user1=user1, user2=user2)
        output_serializer = ConversationListSerializer(conversation, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()
        messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        serializer = PrivateMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': '消息内容不能为空'}, status=status.HTTP_400_BAD_REQUEST)
        msg = PrivateMessage.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
        )
        conversation.save()
        serializer = PrivateMessageSerializer(msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
