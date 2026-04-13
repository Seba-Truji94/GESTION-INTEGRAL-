from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Usuario, LoginConfiguracion, PermisoModulo, MODULOS

Usuario = get_user_model()

MODULOS_KEYS = [m[0] for m in MODULOS]


def _permisos_admin():
    return {m: {'ver': True, 'crear': True, 'editar': True, 'eliminar': True} for m in MODULOS_KEYS}


def _permisos_usuario(obj):
    base = {m: {'ver': False, 'crear': False, 'editar': False, 'eliminar': False} for m in MODULOS_KEYS}
    for p in obj.permisos.all():
        base[p.modulo] = {
            'ver': p.puede_ver,
            'crear': p.puede_crear,
            'editar': p.puede_editar,
            'eliminar': p.puede_eliminar,
        }
    return base


class PermisoModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisoModulo
        fields = ['modulo', 'puede_ver', 'puede_crear', 'puede_editar', 'puede_eliminar']


class UsuarioSerializer(serializers.ModelSerializer):
    permisos = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol',
                  'telefono', 'avatar', 'is_active', 'permisos']
        read_only_fields = ['id']

    def get_permisos(self, obj):
        if obj.rol == 'admin':
            return _permisos_admin()
        return _permisos_usuario(obj)


class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'telefono', 'avatar', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        if user.rol != 'admin':
            for modulo_key in MODULOS_KEYS:
                PermisoModulo.objects.create(
                    usuario=user,
                    modulo=modulo_key,
                    puede_ver=True,
                    puede_crear=True,
                    puede_editar=True,
                    puede_eliminar=False,
                )
        return user


class MeSerializer(serializers.ModelSerializer):
    permisos = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'telefono', 'avatar', 'permisos']
        read_only_fields = ['id', 'username', 'rol']

    def get_permisos(self, obj):
        if obj.rol == 'admin':
            return _permisos_admin()
        return _permisos_usuario(obj)


class LoginConfiguracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginConfiguracion
        fields = '__all__'
