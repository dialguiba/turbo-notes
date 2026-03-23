from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.views import SignUpView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
]
