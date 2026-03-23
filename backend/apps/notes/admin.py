from django.contrib import admin

from apps.notes.models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "color"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "category", "updated_at"]
    list_filter = ["category"]
    search_fields = ["title", "content"]
