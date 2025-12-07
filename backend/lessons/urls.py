from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    TopicViewSet,
    MediaViewSet,
    GamificationProgressViewSet,
    tts_voice_rss,
    tts_fine_voice,
    tts_fine_voice_voices, 
)

router = DefaultRouter()
router.register(r"topics", TopicViewSet)
router.register(r"media", MediaViewSet)
router.register(r"progress", GamificationProgressViewSet)

urlpatterns = [
    *router.urls,
    path("tts/", tts_voice_rss),
    path("tts/finevoice/", tts_fine_voice),
    path("tts/finevoice/voices/", tts_fine_voice_voices), 
]
