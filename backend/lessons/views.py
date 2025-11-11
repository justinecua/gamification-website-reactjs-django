from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Topic, Media, GamificationProgress
from .serializers import TopicSerializer, MediaSerializer, GamificationProgressSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.conf import settings
from rest_framework.permissions import AllowAny
from lessons import voicerss_tts


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
            return Response({"error": "topic_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)

        progress, created = GamificationProgress.objects.update_or_create(
            user=user,
            topic=topic,
            defaults={"stars_earned": stars, "completed": completed},
        )

        serializer = self.get_serializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)


# =======================
#  TEXT-TO-SPEECH ENDPOINT
# =======================
@api_view(["POST"])
@permission_classes([AllowAny])
def tts_voice_rss(request):
    text = request.data.get("text")
    voice = request.data.get("voice", "Linda")

    print("\n===== TTS REQUEST =====")
    print("VOICE_RSS_API_KEY:", settings.VOICE_RSS_API_KEY)
    print("TEXT LENGTH:", len(text) if text else 0)
    print("VOICE:", voice)

    if not text:
        return Response({"error": "Text is required"}, status=400)

    try:
        # Call VoiceRSS API
        speech = voicerss_tts.speech({
            'key': settings.VOICE_RSS_API_KEY,
            'hl': 'en-us',
            'v': voice,
            'src': text,
            'r': '0',
            'c': 'mp3',
            'f': '44khz_16bit_stereo',
            'ssml': 'false',
            'b64': 'false'
        })

        # If VoiceRSS returned an error
        if speech.get("error"):
            print("VOICE RSS ERROR:", speech["error"])
            return Response({"error": str(speech["error"])}, status=500)

        # If content starts with "ERROR ..."
        if speech["response"].startswith(b"ERROR"):
            print("VOICE RSS ERROR CONTENT:", speech["response"])
            return Response({"error": speech["response"].decode()}, status=500)

        print("✅ TTS OK — Bytes:", len(speech["response"]))

        # Return MP3 audio
        return HttpResponse(speech["response"], content_type="audio/mpeg")

    except Exception as e:
        print("🔥 SERVER TTS EXCEPTION:", e)
        return Response({"error": str(e)}, status=500)
