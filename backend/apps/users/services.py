from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def user_signup(*, email: str, password: str) -> dict:
    user = User.objects.create_user(email=email, password=password)
    refresh = RefreshToken.for_user(user)
    refresh["email"] = user.email
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
