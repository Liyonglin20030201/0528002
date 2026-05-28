from rest_framework import serializers
from .models import ExperiencePost, Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'author_name', 'content', 'created_at')
        read_only_fields = ('author',)


class ExperienceListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = ExperiencePost
        fields = ('id', 'title', 'author_name', 'exam_type', 'tags', 'views', 'likes', 'comment_count', 'created_at')


class ExperienceDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = ExperiencePost
        fields = '__all__'
        read_only_fields = ('author', 'views', 'likes')
