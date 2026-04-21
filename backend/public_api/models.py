from django.db import models


class SolicitudPedido(models.Model):
    ESTADOS = [
        ('nueva', 'Nueva'),
        ('vista', 'Vista'),
        ('respondida', 'Respondida'),
    ]
    nombre_cliente = models.CharField(max_length=200)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True, default='')
    fecha_evento = models.DateField()
    descripcion = models.TextField()
    pax = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='nueva')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Solicitud de Pedido'
        verbose_name_plural = 'Solicitudes de Pedido'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre_cliente} — {self.fecha_evento}"
