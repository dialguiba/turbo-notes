import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestCustomUserManager:
    def test_create_user_with_valid_email_and_password(self):
        user = User.objects.create_user(
            email="user@example.com", password="testpass123"
        )
        assert user.email == "user@example.com"
        assert user.check_password("testpass123")
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email="  User@EXAMPLE.COM  ", password="testpass123"
        )
        assert user.email == "user@example.com"

    def test_create_user_without_email_raises_error(self):
        with pytest.raises(ValueError, match="email"):
            User.objects.create_user(email="", password="testpass123")

    def test_create_user_without_password_raises_error(self):
        with pytest.raises(ValueError, match="password"):
            User.objects.create_user(email="user@example.com", password="")

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com", password="adminpass123"
        )
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.is_active is True

    def test_create_superuser_not_staff_raises_error(self):
        with pytest.raises(ValueError, match="is_staff"):
            User.objects.create_superuser(
                email="admin@example.com", password="adminpass123", is_staff=False
            )

    def test_create_superuser_not_superuser_raises_error(self):
        with pytest.raises(ValueError, match="is_superuser"):
            User.objects.create_superuser(
                email="admin@example.com", password="adminpass123", is_superuser=False
            )


@pytest.mark.django_db
class TestCustomUserModel:
    def test_str_returns_email(self):
        user = User.objects.create_user(
            email="user@example.com", password="testpass123"
        )
        assert str(user) == "user@example.com"

    def test_username_field_is_email(self):
        assert User.USERNAME_FIELD == "email"

    def test_required_fields_is_empty(self):
        assert User.REQUIRED_FIELDS == []

    def test_model_has_no_username_field(self):
        assert not hasattr(User(), "username")

    def test_model_has_no_first_name_field(self):
        assert not hasattr(User(), "first_name")

    def test_model_has_no_last_name_field(self):
        assert not hasattr(User(), "last_name")

    def test_model_has_expected_fields(self):
        user = User()
        expected_fields = {"email", "password", "is_active", "is_staff", "date_joined"}
        model_fields = {f.name for f in user._meta.get_fields() if hasattr(f, "name")}
        # PermissionsMixin adds is_superuser, groups, user_permissions
        assert expected_fields.issubset(model_fields)

    def test_email_is_unique(self):
        email_field = User._meta.get_field("email")
        assert email_field.unique is True
