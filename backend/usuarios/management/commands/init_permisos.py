from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from usuarios.models import PermisoModulo, MODULOS

Usuario = get_user_model()
MODULOS_KEYS = [m[0] for m in MODULOS]


class Command(BaseCommand):
    help = 'Crea permisos por defecto para operadores que no tienen ninguno'

    def handle(self, *args, **kwargs):
        operadores = Usuario.objects.filter(rol='operador')
        creados = 0
        for user in operadores:
            for modulo_key in MODULOS_KEYS:
                _, created = PermisoModulo.objects.get_or_create(
                    usuario=user,
                    modulo=modulo_key,
                    defaults={
                        'puede_ver': True,
                        'puede_crear': True,
                        'puede_editar': True,
                        'puede_eliminar': False,
                    }
                )
                if created:
                    creados += 1
        self.stdout.write(self.style.SUCCESS(
            f'Listo. {creados} permisos creados para {operadores.count()} operadores.'
        ))
