from django.contrib.auth.models import AbstractUser
from django.db import models


MODULOS = [
    ('dashboard', 'Dashboard'),
    ('eventos', 'Eventos'),
    ('presupuestos', 'Presupuestos'),
    ('cobros', 'Cobros'),
    ('gastos', 'Gastos'),
    ('inventario', 'Inventario'),
    ('catalogo', 'Catálogo'),
    ('reportes', 'Reportes'),
    ('configuracion', 'Configuración'),
    ('configuracion_login', 'Visual Login'),
    ('mantenedor', 'Mantenedor'),
]


class Usuario(AbstractUser):
    """Custom user model with roles."""
    ROLES = [
        ('admin', 'Administrador'),
        ('operador', 'Operador'),
    ]
    rol = models.CharField(max_length=20, choices=ROLES, default='operador')
    telefono = models.CharField(max_length=30, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, help_text="Fotografía de perfil del usuario.")

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_rol_display()})"


class PermisoModulo(models.Model):
    """Granular per-module permissions for non-admin users."""
    usuario = models.ForeignKey(
        'Usuario', on_delete=models.CASCADE, related_name='permisos'
    )
    modulo = models.CharField(max_length=30, choices=MODULOS)
    puede_ver = models.BooleanField(default=True)
    puede_crear = models.BooleanField(default=True)
    puede_editar = models.BooleanField(default=True)
    puede_eliminar = models.BooleanField(default=False)

    class Meta:
        unique_together = ('usuario', 'modulo')
        verbose_name = 'Permiso de Módulo'
        verbose_name_plural = 'Permisos de Módulos'

    def __str__(self):
        return f"{self.usuario} — {self.modulo}"


class LoginConfiguracion(models.Model):
    """Configuration for the login background animation."""
    ANIMATION_TYPES = [
        ('balatro', 'Balatro'),
        ('linewaves', 'Line Waves'),
        ('hyperspeed', 'Hyperspeed'),
    ]
    animation_type = models.CharField(max_length=20, choices=ANIMATION_TYPES, default='balatro')
    color1 = models.CharField(max_length=7, default='#DE443B', help_text="Hex code for Color 1")
    color2 = models.CharField(max_length=7, default='#006BB4', help_text="Hex code for Color 2")
    color3 = models.CharField(max_length=7, default='#162325', help_text="Hex code for Color 3")
    pixel_filter = models.IntegerField(default=745, help_text="Resolution filter (pixelation)")
    is_rotate = models.BooleanField(default=False, help_text="Enable circular spin")
    mouse_interaction = models.BooleanField(default=True, help_text="Enable mouse interaction")
    spin_speed = models.FloatField(default=7.0)
    spin_rotation = models.FloatField(default=-2.0)
    spin_amount = models.FloatField(default=0.25)
    spin_ease = models.FloatField(default=1.0)
    contrast = models.FloatField(default=3.5)
    lighting = models.FloatField(default=0.4)
    # LineWaves specific
    lw_inner_line_count = models.IntegerField(default=32)
    lw_outer_line_count = models.IntegerField(default=36)
    lw_warp_intensity = models.FloatField(default=1.0)
    lw_rotation = models.FloatField(default=-45.0)
    lw_edge_fade_width = models.FloatField(default=0.0)
    lw_color_cycle_speed = models.FloatField(default=1.0)
    lw_brightness = models.FloatField(default=0.2)
    lw_mouse_influence = models.FloatField(default=2.0)
    # Hyperspeed specific
    hs_preset = models.CharField(
        max_length=10, default='one',
        choices=[
            ('one', 'Preset 1 — Turbulento Violeta/Cyan'),
            ('two', 'Preset 2 — Montaña Rojo/Gris'),
            ('three', 'Preset 3 — XY Rojo/Dorado'),
            ('four', 'Preset 4 — Long Race Rosa/Turquesa'),
            ('five', 'Preset 5 — Turbulento Naranja/Azul'),
            ('six', 'Preset 6 — Deep Rojo/Crema'),
        ],
        help_text='Preset de colores y distorsión para Hyperspeed',
    )
    hs_speed_up = models.FloatField(default=2.0, help_text='Factor de aceleración al hacer clic')

    class Meta:
        verbose_name = 'Configuración de Login'
        verbose_name_plural = 'Configuraciones de Login'

    def __str__(self):
        return "Configuración Animación Login"
