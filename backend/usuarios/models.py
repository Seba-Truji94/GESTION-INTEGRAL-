from django.contrib.auth.models import AbstractUser
from django.db import models


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

    class Meta:
        verbose_name = 'Configuración de Login'
        verbose_name_plural = 'Configuraciones de Login'

    def __str__(self):
        return "Configuración Animación Login"
