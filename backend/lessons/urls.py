from rest_framework.routers import DefaultRouter
from .views import TopicViewSet, MediaViewSet, GamificationProgressViewSet

router = DefaultRouter()
router.register(r"topics", TopicViewSet, basename="topic")
router.register(r"media", MediaViewSet, basename="media")
router.register(r"progress", GamificationProgressViewSet, basename="progress")

urlpatterns = router.urls
