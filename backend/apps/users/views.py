from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, FavoriteSerializer
from .models import Favorite
from apps.messages.utils import create_notification

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


CONTENT_MODEL_MAP = {
    'experience': ('apps.experience', 'ExperiencePost'),
    'topic': ('apps.topics', 'Topic'),
    'news': ('apps.news', 'News'),
    'resource': ('apps.resources', 'Resource'),
}


def _get_content_author(content_type, object_id):
    from django.apps import apps
    mapping = CONTENT_MODEL_MAP.get(content_type)
    if not mapping:
        return None
    app_label, model_name = mapping
    try:
        model = apps.get_model(app_label, model_name)
        obj = model.objects.get(id=object_id)
        return getattr(obj, 'author', None) or getattr(obj, 'uploader', None)
    except Exception:
        return None


class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        favorite = serializer.save(user=self.request.user)
        author = _get_content_author(favorite.content_type, favorite.object_id)
        if author:
            create_notification(
                recipient=author,
                sender=self.request.user,
                notification_type='system',
                title='内容被收藏',
                content=f'{self.request.user.username} 收藏了你的{favorite.get_content_type_display()}',
                related_type=favorite.content_type if favorite.content_type in ('experience', 'topic', 'news') else None,
                related_id=favorite.object_id,
            )


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
