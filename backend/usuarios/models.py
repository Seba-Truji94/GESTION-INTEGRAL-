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

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_rol_display()})"
