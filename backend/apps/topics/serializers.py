from rest_framework import serializers
from .models import Topic, TopicCategory, TopicReply


class TopicCategorySerializer(serializers.ModelSerializer):
    topic_count = serializers.IntegerField(source='topics.count', read_only=True)

    class Meta:
        model = TopicCategory
        fields = ('id', 'name', 'category_type', 'description', 'topic_count')


class TopicReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = TopicReply
        fields = ('id', 'topic', 'author', 'author_name', 'content', 'created_at')
        read_only_fields = ('author',)


class TopicListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    reply_count = serializers.IntegerField(source='replies.count', read_only=True)

    class Meta:
        model = Topic
        fields = ('id', 'title', 'category', 'category_name', 'author_name', 'views', 'reply_count', 'is_pinned', 'created_at')


class TopicDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    replies = TopicReplySerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = '__all__'
        read_only_fields = ('author', 'views')
