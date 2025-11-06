from django.db import models
from django.contrib.auth.models import User

class Topic(models.Model):
    title = models.CharField(max_length=100)
    letter = models.CharField(max_length=2, blank=True, null=True)
    theme = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("youtube", "YouTube Video"),
        ("mp4", "Uploaded MP4"),
        ("story", "Narrated Story"),
    ]
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="media")
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES)
    media_url = models.URLField(blank=True, null=True)
    uploaded_file = models.FileField(upload_to="videos/", blank=True, null=True)
    autoplay = models.BooleanField(default=True)
    allow_controls = models.BooleanField(default=True)
    duration = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic.title} ({self.media_type})"


class GamificationProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progress")
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    stars_earned = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_watched = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "topic")

    def __str__(self):
        return f"{self.user.username} - {self.topic.title} ({'Done' if self.completed else 'In Progress'})"
