from rest_framework import serializers
from .models import Resource, ResourceCategory


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploader_name = serializers.CharField(source='uploader.username', read_only=True)

    class Meta:
        model = Resource
        fields = ('id', 'title', 'description', 'category', 'category_name', 'uploader', 'uploader_name',
                  'file', 'file_size', 'download_count', 'created_at')
        read_only_fields = ('uploader', 'file_size', 'download_count')
