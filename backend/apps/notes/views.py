from django.db.models import Count
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import CursorPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.notes.models import Category
from apps.notes.serializers import CategorySerializer, NoteSerializer


class NotePagination(CursorPagination):
    page_size = 20
    ordering = "-updated_at"


class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.categories.annotate(
            note_count=Count("notes")
        ).order_by("created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Re-fetch through annotated queryset so note_count is included
        instance = self.get_queryset().get(pk=response.data["id"])
        response.data = self.get_serializer(instance).data
        return response


class NoteViewSet(ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotePagination

    def get_queryset(self):
        qs = self.request.user.notes.select_related("category")

        category_param = self.request.query_params.get("category")
        if category_param is not None:
            if category_param == "none":
                qs = qs.filter(category__isnull=True)
            else:
                try:
                    category_id = int(category_param)
                except (ValueError, TypeError):
                    raise ValidationError(
                        {
                            "category": "Invalid category filter. Use an integer ID or 'none'."
                        }
                    )
                if not Category.objects.filter(
                    pk=category_id, user=self.request.user
                ).exists():
                    raise ValidationError({"category": "Category not found."})
                qs = qs.filter(category_id=category_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
