from django.db import models
from django.conf import settings


class GastoFijo(models.Model):
    CATEGORIAS = [
        ('arriendo', 'Arriendo / Bodega'),
        ('sueldos', 'Sueldos / Honorarios'),
        ('servicios', 'Servicios Públicos (Luz, Agua, Gas)'),
        ('insumos_fijos', 'Insumos de Limpieza/Oficina'),
        ('marketing', 'Marketing / Publicidad'),
        ('seguros', 'Seguros / Patentes'),
        ('mantenimiento', 'Mantenimiento'),
        ('suscripciones', 'Suscripciones (ERP, Software)'),
        ('otro', 'Otro'),
    ]
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
    ]

    nombre = models.CharField(max_length=200, verbose_name='Nombre del Gasto')
    categoria = models.CharField(max_length=30, choices=CATEGORIAS, default='otro')
    monto = models.DecimalField(max_digits=12, decimal_places=0)
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    comprobante = models.FileField(upload_to='gastos/comprobantes/', null=True, blank=True)
    observaciones = models.TextField(blank=True, default='')
    
    mes = models.PositiveIntegerField(null=True, blank=True, db_index=True) # For easier filtering
    anio = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Gasto Fijo'
        verbose_name_plural = 'Gastos Fijos'
        ordering = ['fecha_vencimiento', 'nombre']

    def __str__(self):
        return f"{self.nombre} - {self.get_categoria_display()} (${self.monto:,.0f})"

    def save(self, *args, **kwargs):
        if not self.mes:
            self.mes = self.fecha_vencimiento.month
        if not self.anio:
            self.anio = self.fecha_vencimiento.year
        super().save(*args, **kwargs)
