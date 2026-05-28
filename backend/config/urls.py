from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/news/', include('apps.news.urls')),
    path('api/experience/', include('apps.experience.urls')),
    path('api/resources/', include('apps.resources.urls')),
    path('api/topics/', include('apps.topics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
