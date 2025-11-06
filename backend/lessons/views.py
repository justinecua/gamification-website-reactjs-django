from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Topic, Media, GamificationProgress
from .serializers import TopicSerializer, MediaSerializer, GamificationProgressSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by("-created_at")
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all().order_by("-created_at")
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

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
