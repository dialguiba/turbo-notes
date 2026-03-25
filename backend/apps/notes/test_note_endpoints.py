import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.notes.models import Category, Note

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(email="user@example.com", password="testpass123")


@pytest.fixture
def other_user(db):
    return User.objects.create_user(email="other@example.com", password="testpass123")


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


URL = "/api/notes/"


def detail_url(pk):
    return f"/api/notes/{pk}/"


# ── Create ───────────────────────────────────────


@pytest.mark.django_db
class TestCreateNote:
    def test_create_with_category_returns_nested_category(self, auth_client, user):
        category = Category.objects.filter(user=user).first()
        payload = {"title": "My Note", "content": "Hello", "category": category.pk}

        response = auth_client.post(URL, payload)

        assert response.status_code == 201
        assert response.data["title"] == "My Note"
        assert response.data["content"] == "Hello"
        # Category should be a nested object, not a plain ID
        assert response.data["category"]["id"] == category.pk
        assert response.data["category"]["name"] == category.name
        assert response.data["category"]["color"] == category.color
        assert "created_at" in response.data
        assert "updated_at" in response.data
        assert Note.objects.filter(user=user, title="My Note").exists()

    def test_create_without_category_returns_null(self, auth_client, user):
        payload = {"title": "No Cat", "content": "Body"}

        response = auth_client.post(URL, payload)

        assert response.status_code == 201
        assert response.data["category"] is None

    def test_create_empty_body_for_autosave(self, auth_client, user):
        response = auth_client.post(URL, {})

        assert response.status_code == 201
        assert response.data["title"] == ""
        assert response.data["content"] == ""
        assert response.data["category"] is None

    def test_create_with_other_users_category_returns_400(
        self, auth_client, other_user
    ):
        other_cat = Category.objects.filter(user=other_user).first()

        response = auth_client.post(URL, {"category": other_cat.pk})

        assert response.status_code == 400
        assert "category" in response.data

    def test_create_with_content_exceeding_300k_returns_400(self, auth_client):
        payload = {"content": "x" * 300_001}

        response = auth_client.post(URL, payload)

        assert response.status_code == 400
        assert "content" in response.data


# ── Authentication ───────────────────────────────


@pytest.mark.django_db
class TestNoteAuth:
    def test_unauthenticated_request_returns_401(self, api_client):
        response = api_client.get(URL)

        assert response.status_code == 401


# ── Retrieve ─────────────────────────────────────


@pytest.mark.django_db
class TestRetrieveNote:
    def test_retrieve_own_note_with_nested_category(self, auth_client, user):
        category = Category.objects.filter(user=user).first()
        note = Note.objects.create(
            user=user, title="Detail", content="Full content", category=category
        )

        response = auth_client.get(detail_url(note.pk))

        assert response.status_code == 200
        assert response.data["id"] == note.pk
        assert response.data["title"] == "Detail"
        assert response.data["content"] == "Full content"
        assert response.data["category"]["id"] == category.pk

    def test_retrieve_other_users_note_returns_404(self, auth_client, other_user):
        note = Note.objects.create(user=other_user, title="Secret")

        response = auth_client.get(detail_url(note.pk))

        assert response.status_code == 404


# ── Update ───────────────────────────────────────


@pytest.mark.django_db
class TestUpdateNote:
    def test_put_full_update(self, auth_client, user):
        category = Category.objects.filter(user=user).first()
        note = Note.objects.create(user=user, title="Old", content="Old body")

        response = auth_client.put(
            detail_url(note.pk),
            {"title": "New", "content": "New body", "category": category.pk},
        )

        assert response.status_code == 200
        assert response.data["title"] == "New"
        assert response.data["content"] == "New body"
        assert response.data["category"]["id"] == category.pk

    def test_patch_partial_update_content_only(self, auth_client, user):
        note = Note.objects.create(user=user, title="Keep", content="Old")

        response = auth_client.patch(
            detail_url(note.pk),
            {"content": "Updated"},
        )

        assert response.status_code == 200
        assert response.data["content"] == "Updated"
        assert response.data["title"] == "Keep"

    def test_patch_change_category(self, auth_client, user):
        cats = Category.objects.filter(user=user)[:2]
        note = Note.objects.create(user=user, category=cats[0])

        response = auth_client.patch(
            detail_url(note.pk),
            {"category": cats[1].pk},
        )

        assert response.status_code == 200
        assert response.data["category"]["id"] == cats[1].pk
        assert response.data["category"]["name"] == cats[1].name

    def test_patch_with_other_users_category_returns_400(
        self, auth_client, user, other_user
    ):
        note = Note.objects.create(user=user, title="Mine")
        other_cat = Category.objects.filter(user=other_user).first()

        response = auth_client.patch(
            detail_url(note.pk),
            {"category": other_cat.pk},
        )

        assert response.status_code == 400
        assert "category" in response.data


# ── Delete ───────────────────────────────────────


@pytest.mark.django_db
class TestDeleteNote:
    def test_delete_own_note(self, auth_client, user):
        note = Note.objects.create(user=user, title="Bye")

        response = auth_client.delete(detail_url(note.pk))

        assert response.status_code == 204
        assert not Note.objects.filter(pk=note.pk).exists()

    def test_delete_other_users_note_returns_404(self, auth_client, other_user):
        note = Note.objects.create(user=other_user, title="Not yours")

        response = auth_client.delete(detail_url(note.pk))

        assert response.status_code == 404
        assert Note.objects.filter(pk=note.pk).exists()


# ── List ─────────────────────────────────────────


@pytest.mark.django_db
class TestListNotes:
    def test_list_returns_users_notes_with_nested_category(self, auth_client, user):
        category = Category.objects.filter(user=user).first()
        Note.objects.create(user=user, title="A", category=category)
        Note.objects.create(user=user, title="B")

        response = auth_client.get(URL)

        assert response.status_code == 200
        results = response.data["results"]
        assert len(results) == 2
        # The one with a category should have nested object
        with_cat = [n for n in results if n["title"] == "A"][0]
        assert with_cat["category"]["id"] == category.pk
        # The one without should have null
        without_cat = [n for n in results if n["title"] == "B"][0]
        assert without_cat["category"] is None

    def test_list_ordered_by_updated_at_descending(self, auth_client, user):
        n1 = Note.objects.create(user=user, title="First")
        n2 = Note.objects.create(user=user, title="Second")

        response = auth_client.get(URL)

        ids = [n["id"] for n in response.data["results"]]
        # n2 was created after n1, so it should come first
        assert ids[0] == n2.pk
        assert ids[1] == n1.pk

    def test_list_excludes_other_users_notes(self, auth_client, user, other_user):
        Note.objects.create(user=user, title="Mine")
        Note.objects.create(user=other_user, title="Theirs")

        response = auth_client.get(URL)

        titles = [n["title"] for n in response.data["results"]]
        assert "Mine" in titles
        assert "Theirs" not in titles

    def test_filter_by_category_returns_matching_notes(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        Note.objects.create(user=user, title="In cat", category=cat)
        Note.objects.create(user=user, title="No cat")

        response = auth_client.get(URL, {"category": cat.pk})

        assert response.status_code == 200
        titles = [n["title"] for n in response.data["results"]]
        assert titles == ["In cat"]

    def test_filter_by_none_returns_uncategorized_notes(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        Note.objects.create(user=user, title="Has cat", category=cat)
        Note.objects.create(user=user, title="No cat")

        response = auth_client.get(URL, {"category": "none"})

        assert response.status_code == 200
        titles = [n["title"] for n in response.data["results"]]
        assert titles == ["No cat"]

    def test_filter_by_nonexistent_category_returns_400(self, auth_client):
        response = auth_client.get(URL, {"category": 99999})

        assert response.status_code == 400
        assert "category" in response.data

    def test_filter_by_other_users_category_returns_400(self, auth_client, other_user):
        other_cat = Category.objects.filter(user=other_user).first()

        response = auth_client.get(URL, {"category": other_cat.pk})

        assert response.status_code == 400
        assert "category" in response.data

    def test_filter_by_invalid_string_returns_400(self, auth_client):
        response = auth_client.get(URL, {"category": "abc"})

        assert response.status_code == 400
        assert "category" in response.data


# ── Pagination ──────────────────────────────────


@pytest.mark.django_db
class TestNotePagination:
    def test_response_shape_has_pagination_keys(self, auth_client, user):
        Note.objects.create(user=user, title="One")

        response = auth_client.get(URL)

        assert response.status_code == 200
        assert "results" in response.data
        assert "next" in response.data
        assert "previous" in response.data
        assert len(response.data["results"]) == 1

    def test_first_page_returns_at_most_page_size_notes(self, auth_client, user):
        for i in range(25):
            Note.objects.create(user=user, title=f"Note {i}")

        response = auth_client.get(URL)

        assert response.status_code == 200
        assert len(response.data["results"]) == 20
        assert response.data["next"] is not None

    def test_cursor_navigation_returns_remaining_notes(self, auth_client, user):
        for i in range(25):
            Note.objects.create(user=user, title=f"Note {i}")

        first_page = auth_client.get(URL)
        next_url = first_page.data["next"]

        second_page = auth_client.get(next_url)

        assert second_page.status_code == 200
        assert len(second_page.data["results"]) == 5
        assert second_page.data["next"] is None
