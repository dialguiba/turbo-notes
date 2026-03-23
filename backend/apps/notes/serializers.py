import re

from rest_framework import serializers

from apps.notes.models import Category, Note

HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class CategoryMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color"]


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "color",
            "note_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_color(self, value):
        if not HEX_COLOR_RE.match(value):
            raise serializers.ValidationError(
                "Color must be a valid hex code (e.g. #FF00AA)."
            )
        return value

    def validate_name(self, value):
        user = self.context["request"].user
        qs = Category.objects.filter(user=user, name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "You already have a category with this name."
            )
        return value


class NoteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Note
        fields = ["id", "title", "content", "category", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_category(self, value):
        if value and value.user != self.context["request"].user:
            raise serializers.ValidationError("Category does not belong to you.")
        return value

    def validate_content(self, value):
        if len(value) > 300_000:
            raise serializers.ValidationError(
                "Content must not exceed 300,000 characters."
            )
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.category:
            data["category"] = CategoryMinimalSerializer(instance.category).data
        else:
            data["category"] = None
        return data
