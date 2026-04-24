from django.db import models
from django.conf import settings


class LoginLog(models.Model):
    """Tracks login/logout events separately from model audit."""
    ACCION_CHOICES = [
        ('login', 'Inicio de sesión'),
        ('logout', 'Cierre de sesión'),
        ('login_fallido', 'Intento fallido'),
    ]
    usuario = models.CharField(max_length=150)
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Log de acceso'
        verbose_name_plural = 'Logs de acceso'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.usuario} — {self.accion} — {self.timestamp:%d/%m/%Y %H:%M}'
