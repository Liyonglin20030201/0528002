from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, Conversation, PrivateMessage

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True, default='系统')

    class Meta:
        model = Notification
        fields = ('id', 'sender', 'sender_name', 'notification_type', 'title', 'content',
                  'related_type', 'related_id', 'is_read', 'created_at')
        read_only_fields = ('sender',)


class PrivateMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = PrivateMessage
        fields = ('id', 'conversation', 'sender', 'sender_name', 'content', 'is_read', 'created_at')
        read_only_fields = ('sender', 'conversation')


class ConversationListSerializer(serializers.ModelSerializer):
    user1_name = serializers.CharField(source='user1.username', read_only=True)
    user2_name = serializers.CharField(source='user2.username', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'user1', 'user1_name', 'user2', 'user2_name', 'last_message', 'unread_count', 'updated_at')

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {'content': msg.content[:50], 'sender_name': msg.sender.username, 'created_at': msg.created_at}
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class ConversationCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError('用户不存在')
        if value == self.context['request'].user.id:
            raise serializers.ValidationError('不能和自己创建会话')
        return value
