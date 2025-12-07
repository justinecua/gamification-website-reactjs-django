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
import requests

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
#  TEXT-TO-SPEECH (VoiceRSS)
# =======================
@api_view(["POST"])
@permission_classes([AllowAny])
def tts_voice_rss(request):
    text = request.data.get("text")
    voice = request.data.get("voice", "Linda")

    print("\n===== TTS REQUEST (VoiceRSS) =====")
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


# =======================
#  TEXT-TO-SPEECH (FineVoice)
# =======================
@api_view(["POST"])
@permission_classes([AllowAny])
def tts_fine_voice(request):
    try:
        print("\n===== FINEVOICE REQUEST =====")
        print("Incoming JSON:", request.data)

        text = request.data.get("text")
        voice = request.data.get("voice", "Madison")
        emotion = request.data.get("emotion")

        if not text:
            return Response({"error": "Text is required"}, status=400)

        url = "https://ttsapi.fineshare.com/v1/text-to-speech"
        headers = {
            "x-api-key": settings.FINE_VOICE_API_KEY,
            "Content-Type": "application/json",
        }

        payload = {
            "voice": voice,
            "speech": text,
            "format": "mp3",
            "noCdn": True,
        }
        if emotion:
            payload["amotion"] = emotion

        print("Payload:", payload)

        # Step 1: request TTS job
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        print("API Status:", response.status_code)
        print("API Response:", response.text)

        if response.status_code != 200:
            return Response({"error": "FineVoice API error"}, status=500)

        data = response.json()

        download_url = data.get("downloadUrl")
        if not download_url:
            return Response({"error": "FineVoice did not return audio URL."}, status=500)

        # Step 2: download the MP3
        file_response = requests.get(
            download_url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15,
        )

        if file_response.status_code != 200:
            print("🔥 AUDIO DOWNLOAD ERROR:", file_response.status_code, file_response.text)
            return Response({"error": "Failed to download TTS audio"}, status=500)

        audio_data = file_response.content

        # Step 3: return MP3 directly
        resp = HttpResponse(audio_data, content_type="audio/mpeg")
        resp["Content-Disposition"] = "inline; filename=tts.mp3"
        resp["Cache-Control"] = "no-store"

        return resp

    except Exception as e:
        import traceback
        print("🔥 SERVER ERROR (FineVoice TTS):", e)
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)


# =======================
#  FINEVOICE VOICE LIST PROXY
# =======================
@api_view(["GET"])
@permission_classes([AllowAny])
def tts_fine_voice_voices(request):
    """
    Proxy for FineVoice /v1/voices so the frontend never touches the external API/key directly.
    Supports optional ?page=&limit= query params.
    """
    try:
        page = request.query_params.get("page", 1)
        limit = request.query_params.get("limit", 1000)  # grab a lot at once

        url = "https://ttsapi.fineshare.com/v1/voices"
        headers = {
            "x-api-key": settings.FINE_VOICE_API_KEY,
        }
        params = {"page": page, "limit": limit}

        print("\n===== FINEVOICE VOICES REQUEST =====")
        print("Params:", params)

        response = requests.get(url, headers=headers, params=params, timeout=15)
        print("VOICES Status:", response.status_code)
        print("VOICES Response:", response.text)

        if response.status_code != 200:
            return Response({"error": "Failed to fetch FineVoice voices"}, status=500)

        data = response.json()
        return Response(data, status=200)

    except Exception as e:
        import traceback
        print("SERVER ERROR (FineVoice Voices):", e)
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)
