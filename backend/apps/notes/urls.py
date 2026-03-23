from rest_framework.routers import DefaultRouter

from apps.notes.views import CategoryViewSet, NoteViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("notes", NoteViewSet, basename="note")

urlpatterns = router.urls
