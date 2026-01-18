from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from django.http import HttpResponse

from .models import Topic, Media, GamificationProgress
from .serializers import (
    TopicSerializer,
    MediaSerializer,
    GamificationProgressSerializer,
)

from .tts_kokoro import synthesize_wav_bytes


# =======================
#  TOPIC VIEWSET
# =======================
class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by("-created_at")
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# =======================
#  MEDIA VIEWSET
# =======================
class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all().order_by("-created_at")
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]


# =======================
#  GAMIFICATION VIEWSET
# =======================
class GamificationProgressViewSet(viewsets.ModelViewSet):
    queryset = GamificationProgress.objects.all()
    serializer_class = GamificationProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="update-progress")
    def update_progress(self, request):
        user = request.user
        topic_id = request.data.get("topic_id")
        stars = request.data.get("stars_earned", 0)
        completed = request.data.get("completed", False)

        if not topic_id:
            return Response({"error": "topic_id is required"}, status=400)

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({"error": "Topic not found"}, status=404)

        progress, _ = GamificationProgress.objects.update_or_create(
            user=user,
            topic=topic,
            defaults={"stars_earned": stars, "completed": completed},
        )

        return Response(self.get_serializer(progress).data)


# =======================
#  TEXT-TO-SPEECH (Kokoro)
# =======================
@api_view(["POST"])
@permission_classes([AllowAny])
def tts_kokoro(request):
    text = request.data.get("text")
    voice = request.data.get("voice", "af_heart")
    speed = request.data.get("speed", 1.0)

    if not text:
        return Response({"error": "Text is required"}, status=400)

    try:
        speed = float(speed)
    except Exception:
        speed = 1.0

    try:
        wav_bytes = synthesize_wav_bytes(text, voice, speed)
        return HttpResponse(wav_bytes, content_type="audio/wav")
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =======================
#  VOICE LIST (REAL)
# =======================
@api_view(["GET"])
@permission_classes([AllowAny])
def kokoro_voices(request):
    return Response({
        "voices": [
            # 🇺🇸 American English — Female
            {"id": "af_heart", "label": "Heart (US Female)"},
            {"id": "af_alloy", "label": "Alloy (US Female)"},
            {"id": "af_aoede", "label": "Aoede (US Female)"},
            {"id": "af_bella", "label": "Bella (US Female)"},
            {"id": "af_jessica", "label": "Jessica (US Female)"},
            {"id": "af_kore", "label": "Kore (US Female)"},
            {"id": "af_nicole", "label": "Nicole (US Female)"},
            {"id": "af_nova", "label": "Nova (US Female)"},
            {"id": "af_river", "label": "River (US Female)"},
            {"id": "af_sarah", "label": "Sarah (US Female)"},
            {"id": "af_sky", "label": "Sky (US Female)"},

            # 🇺🇸 American English — Male
            {"id": "am_adam", "label": "Adam (US Male)"},
            {"id": "am_echo", "label": "Echo (US Male)"},
            {"id": "am_eric", "label": "Eric (US Male)"},
            {"id": "am_fenrir", "label": "Fenrir (US Male)"},
            {"id": "am_liam", "label": "Liam (US Male)"},
            {"id": "am_michael", "label": "Michael (US Male)"},
            {"id": "am_onyx", "label": "Onyx (US Male)"},
            {"id": "am_puck", "label": "Puck (US Male)"},
            {"id": "am_santa", "label": "Santa (US Male)"},

            # 🇬🇧 British English — Female
            {"id": "bf_alice", "label": "Alice (UK Female)"},
            {"id": "bf_emma", "label": "Emma (UK Female)"},
            {"id": "bf_isabella", "label": "Isabella (UK Female)"},
            {"id": "bf_lily", "label": "Lily (UK Female)"},

            # 🇬🇧 British English — Male
            {"id": "bm_daniel", "label": "Daniel (UK Male)"},
            {"id": "bm_fable", "label": "Fable (UK Male)"},
            {"id": "bm_george", "label": "George (UK Male)"},
            {"id": "bm_lewis", "label": "Lewis (UK Male)"},
        ]
    })
