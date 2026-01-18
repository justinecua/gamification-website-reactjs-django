from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TopicViewSet,
    MediaViewSet,
    GamificationProgressViewSet,
    tts_kokoro,
    kokoro_voices,
)

router = DefaultRouter()
router.register("topics", TopicViewSet)
router.register("media", MediaViewSet)
router.register("gamification", GamificationProgressViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("tts/kokoro/", tts_kokoro),
    path("tts/kokoro/voices/", kokoro_voices),
]
