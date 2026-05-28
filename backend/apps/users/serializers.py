from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Favorite

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 'exam_type')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': '两次密码不一致'})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            exam_type=validated_data.get('exam_type', 'both'),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'bio', 'exam_type', 'created_at')
        read_only_fields = ('id', 'created_at')


class FavoriteSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ('id', 'content_type', 'object_id', 'title', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_title(self, obj):
        from apps.news.models import News
        from apps.experience.models import ExperiencePost
        from apps.resources.models import Resource
        from apps.topics.models import Topic

        model_map = {
            'news': News,
            'experience': ExperiencePost,
            'resource': Resource,
            'topic': Topic,
        }
        model_cls = model_map.get(obj.content_type)
        if model_cls:
            instance = model_cls.objects.filter(id=obj.object_id).first()
            return instance.title if instance else '内容已删除'
        return ''
