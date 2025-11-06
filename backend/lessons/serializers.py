from rest_framework import serializers
from .models import Topic, Media, GamificationProgress

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = "__all__"

class TopicSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = "__all__"

class GamificationProgressSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)

    class Meta:
        model = GamificationProgress
        fields = "__all__"
