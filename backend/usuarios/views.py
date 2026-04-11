from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Usuario, LoginConfiguracion
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, MeSerializer, LoginConfiguracionSerializer

Usuario = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'


class MeView(APIView):
    """Get current user profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UsuarioListCreateView(generics.ListCreateAPIView):
    """List/Create users (admin only)."""
    queryset = Usuario.objects.all().order_by('-date_joined')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UsuarioCreateSerializer
        return UsuarioSerializer


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detail/Update/Delete user (admin only)."""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdmin]


class LoginConfigView(APIView):
    """Returns and updates the login animation configuration."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdmin()]

    def _get_or_create_config(self):
        config = LoginConfiguracion.objects.first()
        if not config:
            config = LoginConfiguracion.objects.create()
        return config

    def get(self, request):
        serializer = LoginConfiguracionSerializer(self._get_or_create_config())
        return Response(serializer.data)

    def put(self, request):
        config = self._get_or_create_config()
        serializer = LoginConfiguracionSerializer(config, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        config = self._get_or_create_config()
        serializer = LoginConfiguracionSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
