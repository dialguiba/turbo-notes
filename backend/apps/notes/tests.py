import time

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
class TestCategoryModel:
    def _create_user(self, email="test@example.com", password="testpass123"):
        return User.objects.create_user(email=email, password=password)

    def test_category_has_expected_fields(self):
        from apps.notes.models import Category

        user = self._create_user()
        category = Category.objects.create(user=user, name="Work", color="#FF0000")

        assert category.name == "Work"
        assert category.color == "#FF0000"
        assert category.user == user
        assert category.created_at is not None
        assert category.updated_at is not None

    def test_str_returns_name(self):
        from apps.notes.models import Category

        user = self._create_user()
        category = Category.objects.create(user=user, name="Work", color="#FF0000")

        assert str(category) == "Work"

    def test_default_categories_created_on_signup(self):
        from apps.notes.models import DEFAULT_CATEGORIES, Category

        user = self._create_user()
        categories = Category.objects.filter(user=user).order_by("name")

        assert categories.count() == len(DEFAULT_CATEGORIES)
        expected = sorted(DEFAULT_CATEGORIES, key=lambda c: c[0])
        for cat, (name, color) in zip(categories, expected):
            assert cat.name == name
            assert cat.color == color

    def test_no_duplicate_categories_on_user_update(self):
        from apps.notes.models import DEFAULT_CATEGORIES, Category

        user = self._create_user()
        assert Category.objects.filter(user=user).count() == len(DEFAULT_CATEGORIES)

        user.save()

        assert Category.objects.filter(user=user).count() == len(DEFAULT_CATEGORIES)

    def test_unique_constraint_prevents_duplicate_category_per_user(self):
        from apps.notes.models import Category

        user = self._create_user()

        with pytest.raises(IntegrityError):
            Category.objects.create(user=user, name="Random Thoughts", color="#000000")


@pytest.mark.django_db
class TestNoteModel:
    def _create_user(self, email="test@example.com", password="testpass123"):
        return User.objects.create_user(email=email, password=password)

    def _create_category(self, user, name="Work", color="#FF0000"):
        from apps.notes.models import Category

        return Category.objects.create(user=user, name=name, color=color)

    def test_note_has_expected_fields_and_str(self):
        from apps.notes.models import Note

        user = self._create_user()
        category = self._create_category(user)
        note = Note.objects.create(
            user=user, title="My Note", content="Some content", category=category
        )

        assert note.title == "My Note"
        assert note.content == "Some content"
        assert note.user == user
        assert note.category == category
        assert note.created_at is not None
        assert note.updated_at is not None
        assert str(note) == "My Note"

        # Untitled fallback
        blank_note = Note.objects.create(user=user, category=category)
        assert str(blank_note) == "Untitled"

    def test_title_and_content_blank_by_default(self):
        from apps.notes.models import Note

        user = self._create_user()
        category = self._create_category(user)
        note = Note.objects.create(user=user, category=category)

        assert note.title == ""
        assert note.content == ""

    def test_user_cascade_deletes_notes(self):
        from apps.notes.models import Note

        user = self._create_user()
        category = self._create_category(user)
        Note.objects.create(user=user, category=category, title="Will be deleted")

        user.delete()

        assert Note.objects.count() == 0

    def test_ordering_by_updated_at_descending(self):
        from apps.notes.models import Note

        user = self._create_user()
        category = self._create_category(user)
        note_old = Note.objects.create(user=user, category=category, title="Old")
        time.sleep(0.05)
        note_new = Note.objects.create(user=user, category=category, title="New")

        notes = list(Note.objects.all())
        assert notes[0].pk == note_new.pk
        assert notes[1].pk == note_old.pk

    def test_category_deletion_sets_notes_to_null(self):
        """Deleting a category sets its notes' category to NULL via SET_NULL."""
        from apps.notes.models import Note

        user = self._create_user()
        category = self._create_category(user)
        note = Note.objects.create(user=user, category=category, title="Orphan")

        category.delete()

        note.refresh_from_db()
        assert note.category is None
