from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    只允许对象的作者执行编辑和删除操作。
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        author_field = getattr(obj, 'author', None) or getattr(obj, 'uploader', None)
        return author_field == request.user
