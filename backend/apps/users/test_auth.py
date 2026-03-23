import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_payload():
    return {"email": "newuser@example.com", "password": "securepass123"}


@pytest.fixture
def existing_user(db):
    return User.objects.create_user(
        email="existing@example.com", password="testpass123"
    )


# ── Signup ────────────────────────────────────────


@pytest.mark.django_db
class TestSignup:
    url = "/api/auth/signup/"

    def test_signup_success(self, api_client, user_payload):
        response = api_client.post(self.url, user_payload)

        assert response.status_code == 201
        assert "access" in response.data
        assert "refresh" in response.data
        assert User.objects.filter(email=user_payload["email"]).exists()

    def test_signup_duplicate_email(self, api_client, existing_user):
        payload = {"email": existing_user.email, "password": "anotherpass123"}
        response = api_client.post(self.url, payload)

        assert response.status_code == 400
        assert "email" in response.data

    def test_signup_missing_email(self, api_client):
        response = api_client.post(self.url, {"password": "securepass123"})

        assert response.status_code == 400
        assert "email" in response.data

    def test_signup_missing_password(self, api_client):
        response = api_client.post(self.url, {"email": "user@example.com"})

        assert response.status_code == 400
        assert "password" in response.data


# ── Login ─────────────────────────────────────────


@pytest.mark.django_db
class TestLogin:
    url = "/api/auth/login/"

    def test_login_success(self, api_client, existing_user):
        response = api_client.post(
            self.url, {"email": existing_user.email, "password": "testpass123"}
        )

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self, api_client, existing_user):
        response = api_client.post(
            self.url, {"email": existing_user.email, "password": "wrongpass"}
        )

        assert response.status_code == 401

    def test_login_nonexistent_email(self, api_client):
        response = api_client.post(
            self.url, {"email": "nobody@example.com", "password": "whatever123"}
        )

        assert response.status_code == 401


# ── Token Refresh ─────────────────────────────────


@pytest.mark.django_db
class TestTokenRefresh:
    login_url = "/api/auth/login/"
    refresh_url = "/api/auth/refresh/"

    def test_refresh_returns_new_access_token(self, api_client, existing_user):
        # First, login to get a refresh token
        login_response = api_client.post(
            self.login_url,
            {"email": existing_user.email, "password": "testpass123"},
        )
        refresh_token = login_response.data["refresh"]

        # Then, use the refresh token to get a new access token
        response = api_client.post(self.refresh_url, {"refresh": refresh_token})

        assert response.status_code == 200
        assert "access" in response.data
