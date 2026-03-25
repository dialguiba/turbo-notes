import pytest

from apps.notes.models import Category, Note

URL = "/api/categories/"


def detail_url(pk):
    return f"/api/categories/{pk}/"


# ── List ─────────────────────────────────────────


@pytest.mark.django_db
class TestListCategories:
    def test_list_returns_user_categories_with_note_count(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        Note.objects.create(user=user, title="A", category=cat)

        response = auth_client.get(URL)

        assert response.status_code == 200
        assert len(response.data) == 3  # 3 default categories
        # Find the category that has a note
        matched = [c for c in response.data if c["id"] == cat.id]
        assert matched[0]["note_count"] == 1

    def test_list_ordered_by_created_at_ascending(self, auth_client, user):
        response = auth_client.get(URL)

        assert response.status_code == 200
        ids = [c["id"] for c in response.data]
        assert ids == sorted(ids)  # created_at ascending = id ascending for defaults

    def test_list_excludes_other_users_categories(self, auth_client, user, other_user):
        Category.objects.create(user=other_user, name="Secret", color="#000000")

        response = auth_client.get(URL)

        names = [c["name"] for c in response.data]
        assert "Secret" not in names

    def test_note_count_reflects_actual_notes(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        Note.objects.create(user=user, title="N1", category=cat)
        Note.objects.create(user=user, title="N2", category=cat)

        response = auth_client.get(URL)

        matched = [c for c in response.data if c["id"] == cat.id]
        assert matched[0]["note_count"] == 2


# ── Authentication ───────────────────────────────


@pytest.mark.django_db
class TestCategoryAuth:
    def test_unauthenticated_request_returns_401(self, api_client):
        response = api_client.get(URL)

        assert response.status_code == 401


# ── Create ───────────────────────────────────────


@pytest.mark.django_db
class TestCreateCategory:
    def test_create_with_valid_data(self, auth_client, user):
        payload = {"name": "Work", "color": "#FF5733"}

        response = auth_client.post(URL, payload)

        assert response.status_code == 201
        assert response.data["name"] == "Work"
        assert response.data["color"] == "#FF5733"
        assert response.data["note_count"] == 0
        assert Category.objects.filter(user=user, name="Work").exists()

    def test_create_duplicate_name_returns_400(self, auth_client, user):
        # "Random Thoughts" already exists as a default category
        payload = {"name": "Random Thoughts", "color": "#000000"}

        response = auth_client.post(URL, payload)

        assert response.status_code == 400
        assert "name" in response.data

    def test_create_invalid_hex_color_returns_400(self, auth_client):
        payload = {"name": "Work", "color": "not-a-color"}

        response = auth_client.post(URL, payload)

        assert response.status_code == 400
        assert "color" in response.data

    def test_create_missing_fields_returns_400(self, auth_client):
        response = auth_client.post(URL, {})

        assert response.status_code == 400
        assert "name" in response.data
        assert "color" in response.data


# ── Retrieve ─────────────────────────────────────


@pytest.mark.django_db
class TestRetrieveCategory:
    def test_retrieve_own_category(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()

        response = auth_client.get(detail_url(cat.pk))

        assert response.status_code == 200
        assert response.data["id"] == cat.pk
        assert "note_count" in response.data

    def test_retrieve_other_users_category_returns_404(self, auth_client, other_user):
        other_cat = Category.objects.filter(user=other_user).first()

        response = auth_client.get(detail_url(other_cat.pk))

        assert response.status_code == 404


# ── Update ───────────────────────────────────────


@pytest.mark.django_db
class TestUpdateCategory:
    def test_put_updates_category(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()

        response = auth_client.put(
            detail_url(cat.pk),
            {"name": "Renamed", "color": "#AABBCC"},
        )

        assert response.status_code == 200
        assert response.data["name"] == "Renamed"
        assert response.data["color"] == "#AABBCC"

    def test_patch_partial_update(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        original_color = cat.color

        response = auth_client.patch(
            detail_url(cat.pk),
            {"name": "Patched"},
        )

        assert response.status_code == 200
        assert response.data["name"] == "Patched"
        assert response.data["color"] == original_color

    def test_update_duplicate_name_returns_400(self, auth_client, user):
        cat = Category.objects.filter(user=user).first()
        other_cat = Category.objects.filter(user=user).exclude(pk=cat.pk).first()

        response = auth_client.patch(
            detail_url(cat.pk),
            {"name": other_cat.name},
        )

        assert response.status_code == 400
        assert "name" in response.data


# ── Delete ───────────────────────────────────────


@pytest.mark.django_db
class TestDeleteCategory:
    def test_delete_non_system_category(self, auth_client, user):
        cat = Category.objects.create(user=user, name="Temp", color="#123456")

        response = auth_client.delete(detail_url(cat.pk))

        assert response.status_code == 204
        assert not Category.objects.filter(pk=cat.pk).exists()
