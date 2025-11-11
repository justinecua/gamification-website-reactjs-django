from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TopicViewSet, MediaViewSet, GamificationProgressViewSet, tts_voice_rss

router = DefaultRouter()
router.register(r"topics", TopicViewSet)
router.register(r"media", MediaViewSet)
router.register(r"progress", GamificationProgressViewSet)

urlpatterns = [
    *router.urls,
    path("tts/", tts_voice_rss),
]
