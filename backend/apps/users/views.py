from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers import SignUpSerializer


class SignUpView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=SignUpSerializer,
        responses={
            201: OpenApiResponse(
                response=inline_serializer(
                    name="TokenPair",
                    fields={
                        "access": serializers.CharField(),
                        "refresh": serializers.CharField(),
                    },
                ),
            ),
        },
    )
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.save()
        return Response(tokens, status=status.HTTP_201_CREATED)
