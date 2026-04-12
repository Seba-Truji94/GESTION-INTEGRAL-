from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Usuario, LoginConfiguracion, PermisoModulo, MODULOS
from .serializers import (
    UsuarioSerializer, UsuarioCreateSerializer, MeSerializer,
    LoginConfiguracionSerializer
)

Usuario = get_user_model()
MODULOS_KEYS = [m[0] for m in MODULOS]


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'


class IsAdminOrMantenedor(permissions.BasePermission):
    """Allows access to admins OR users with mantenedor module permission."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.rol == 'admin':
            return True
        return request.user.permisos.filter(modulo='mantenedor', puede_ver=True).exists()


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
    """List/Create users (admin or mantenedor)."""
    queryset = Usuario.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminOrMantenedor]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UsuarioCreateSerializer
        return UsuarioSerializer


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detail/Update/Delete user (admin or mantenedor)."""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminOrMantenedor]


class UsuarioPermisosView(APIView):
    """Get/Set module permissions for a user (admin or mantenedor)."""
    permission_classes = [IsAdminOrMantenedor]

    def get(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'detail': 'No encontrado'}, status=404)

        permisos = {}
        for p in usuario.permisos.all():
            permisos[p.modulo] = {
                'ver': p.puede_ver, 'crear': p.puede_crear,
                'editar': p.puede_editar, 'eliminar': p.puede_eliminar
            }
        return Response(permisos)

    def put(self, request, pk):
        """
        Expects body: { "dashboard": {"ver": true, "crear": false, ...}, ... }
        """
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'detail': 'No encontrado'}, status=404)

        data = request.data
        for modulo_key in MODULOS_KEYS:
            if modulo_key in data:
                vals = data[modulo_key]
                PermisoModulo.objects.update_or_create(
                    usuario=usuario, modulo=modulo_key,
                    defaults={
                        'puede_ver': bool(vals.get('ver', False)),
                        'puede_crear': bool(vals.get('crear', False)),
                        'puede_editar': bool(vals.get('editar', False)),
                        'puede_eliminar': bool(vals.get('eliminar', False)),
                    }
                )

        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)


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
