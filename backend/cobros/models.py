from django.db import models
from django.conf import settings
from eventos.models import Presupuesto, Evento


class Cobro(models.Model):
    """Cobro enviado al cliente por un presupuesto."""
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('parcial', 'Parcialmente Pagado'),
        ('pagado', 'Pagado Completo'),
        ('cancelado', 'Cancelado'),
    ]

    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name='cobros')
    monto_total = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Monto Total a Cobrar')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_envio = models.DateField(auto_now_add=True, verbose_name='Fecha de Envío')
    fecha_vencimiento = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cobro'
        verbose_name_plural = 'Cobros'
        ordering = ['-created_at']

    def __str__(self):
        return f"Cobro #{self.id} - {self.presupuesto.numero} (${self.monto_total:,.0f})"

    @property
    def monto_pagado(self):
        return sum(p.monto for p in self.pagos.all())

    @property
    def saldo_pendiente(self):
        return self.monto_total - self.monto_pagado

    def actualizar_estado(self):
        """Recalculate payment status based on payments received."""
        pagado = self.monto_pagado
        if pagado >= self.monto_total:
            self.estado = 'pagado'
        elif pagado > 0:
            self.estado = 'parcial'
        else:
            self.estado = 'pendiente'
        self.save(update_fields=['estado'])


class Pago(models.Model):
    """Pago recibido contra un cobro."""
    METODOS = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
    ]

    cobro = models.ForeignKey(Cobro, on_delete=models.CASCADE, related_name='pagos')
    monto = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Monto del Pago')
    metodo_pago = models.CharField(max_length=20, choices=METODOS, default='transferencia')
    fecha_pago = models.DateField(verbose_name='Fecha del Pago', db_index=True)
    comprobante = models.CharField(max_length=200, blank=True, default='', verbose_name='N° Comprobante')
    observaciones = models.TextField(blank=True, default='')
    evidencia = models.FileField(upload_to='pagos/evidencia/', null=True, blank=True, verbose_name='Evidencia de Transferencia')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-fecha_pago']

    def __str__(self):
        return f"Pago ${self.monto:,.0f} ({self.get_metodo_pago_display()}) - {self.fecha_pago}"


class SeguimientoEvento(models.Model):
    """Registro de seguimiento/timeline de un evento."""
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='seguimientos')
    estado_anterior = models.CharField(max_length=20, blank=True, default='')
    estado_nuevo = models.CharField(max_length=20)
    notas = models.TextField(blank=True, default='')
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Seguimiento'
        verbose_name_plural = 'Seguimientos'
        ordering = ['fecha']

    def __str__(self):
        return f"{self.evento.nombre}: {self.estado_anterior} → {self.estado_nuevo}"

class DatosTransferencia(models.Model):
    """Datos bancarios para recibir transferencias."""
    banco = models.CharField(max_length=100)
    titular = models.CharField(max_length=200)
    rut = models.CharField(max_length=20)
    numero_cuenta = models.CharField(max_length=50)
    tipo_cuenta = models.CharField(max_length=50)
    email = models.EmailField()
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dato de Transferencia'
        verbose_name_plural = 'Datos de Transferencia'
        ordering = ['-activo', '-created_at']

    def __str__(self):
        return f"{self.banco} - {self.titular} ({'Activo' if self.activo else 'Inactivo'})"
