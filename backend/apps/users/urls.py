from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.users.serializers import CustomTokenObtainPairSerializer
from apps.users.views import AuthAnonThrottle, SignUpView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path(
        "login/",
        TokenObtainPairView.as_view(
            serializer_class=CustomTokenObtainPairSerializer,
            throttle_classes=[AuthAnonThrottle],
        ),
        name="auth-login",
    ),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="auth-logout"),
]
