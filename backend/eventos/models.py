from django.db import models
from django.conf import settings


class Evento(models.Model):
    """Evento de banquetería/catering."""
    TIPOS = [
        ('matrimonio', 'Matrimonio'),
        ('quinceanios', 'Quinceaños'),
        ('cumpleanios', 'Cumpleaños'),
        ('graduacion', 'Graduación'),
        ('bautizo', 'Bautizo'),
        ('cena_corporativa', 'Cena Corporativa'),
        ('almuerzo_ejecutivo', 'Almuerzo Ejecutivo'),
        ('coctel', 'Cóctel'),
        ('brunch', 'Brunch'),
        ('buffet', 'Buffet'),
        ('cafe', 'Café'),
        ('baby_shower', 'Baby Shower'),
        ('reunion_familiar', 'Reunión Familiar'),
        ('otro', 'Otro'),
    ]
    ESTADOS = [
        ('prospecto', 'Prospecto'),
        ('presupuestado', 'Presupuestado'),
        ('confirmado', 'Confirmado'),
        ('en_proceso', 'En Proceso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    nombre = models.CharField(max_length=200, verbose_name='Nombre del Evento')
    cliente = models.CharField(max_length=200, verbose_name='Cliente')
    fecha = models.DateField(verbose_name='Fecha del Evento', db_index=True)
    tipo_evento = models.CharField(max_length=30, choices=TIPOS, default='otro')
    pax = models.PositiveIntegerField(default=1, verbose_name='Cantidad de Personas')
    lugar = models.CharField(max_length=300, blank=True, default='')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='presupuestado')
    es_externo = models.BooleanField(default=False, verbose_name='Origen Externo (Web)')
    menu = models.TextField(blank=True, default='', verbose_name='Descripción del Menú')
    observaciones = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='eventos_creados'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.nombre} - {self.cliente} ({self.get_estado_display()})"

    @property
    def costo_total(self):
        """Costo total sumando todos los productos de todos sus presupuestos."""
        total = 0
        for pres in self.presupuestos.all():
            total += sum(i.cantidad * i.costo_unitario for i in pres.items.all())
        return total

    @property
    def venta_total(self):
        """Venta total sumando todos los productos de todos sus presupuestos."""
        total = 0
        for pres in self.presupuestos.all():
            total += pres.total
        return total

    @property
    def utilidad(self):
        return self.venta_total - self.costo_total

    @property
    def margen(self):
        if self.venta_total > 0:
            return (self.utilidad / self.venta_total) * 100
        return 0


class Presupuesto(models.Model):
    """Presupuesto/Cotización asociado a un evento."""
    ESTADOS = [
        ('borrador', 'Borrador'),
        ('enviado', 'Enviado'),
        ('en_espera', 'En Espera'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]
    FORMAS_PAGO = [
        ('50_50', '50% anticipo, 50% día del evento'),
        ('100_anticipo', '100% anticipado'),
        ('30_70', '30% anticipo, 70% día del evento'),
        ('al_finalizar', 'Pago al finalizar el evento'),
    ]

    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='presupuestos')
    numero = models.CharField(max_length=30, unique=True, verbose_name='N° Presupuesto')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    descuento_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    incluir_iva = models.BooleanField(default=False, verbose_name='Incluir IVA (19%)')
    forma_pago = models.CharField(max_length=30, choices=FORMAS_PAGO, default='50_50')
    validez_dias = models.PositiveIntegerField(default=15)
    notas = models.TextField(blank=True, default='')
    # Datos del cliente en el presupuesto
    cliente_nombre = models.CharField(max_length=200, blank=True, default='')
    cliente_rut = models.CharField(max_length=20, blank=True, default='')
    cliente_email = models.CharField(max_length=200, blank=True, default='')
    cliente_telefono = models.CharField(max_length=50, blank=True, default='')
    cliente_direccion = models.CharField(max_length=300, blank=True, default='')
    cliente_comuna = models.CharField(max_length=100, blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    stock_procesado = models.BooleanField(default=False, verbose_name='Stock deducido')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Presupuesto'
        verbose_name_plural = 'Presupuestos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.numero} - {self.evento.cliente} (${self.total:,.0f})"

    def recalcular(self):
        """Recalculate subtotal and total from items."""
        from decimal import Decimal
        self.subtotal = sum(i.cantidad * i.venta_unitario for i in self.items.all())
        descuento = self.subtotal * self.descuento_pct / 100
        base = self.subtotal - descuento
        if self.incluir_iva:
            self.total = base * Decimal('1.19')
        else:
            self.total = base
        self.save(update_fields=['subtotal', 'total'])

    def save(self, *args, **kwargs):
        if not self.numero:
            import datetime, random
            now = datetime.datetime.now()
            self.numero = f"P-{now.year}-{now.month:02d}{now.day:02d}-{random.randint(100,999)}"
        super().save(*args, **kwargs)


class ItemPresupuesto(models.Model):
    """Item individual dentro de un presupuesto."""
    CATEGORIAS = [
        ('I', 'Ingrediente / Insumo'),
        ('M', 'Mano de Obra'),
        ('O', 'Otro'),
    ]

    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name='items')
    producto_catalogo = models.ForeignKey(
        'catalogo.ProductoCatalogo', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='items_presupuesto'
    )
    descripcion = models.CharField(max_length=300)
    categoria = models.CharField(max_length=1, choices=CATEGORIAS, default='I')
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    venta_unitario = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Item de Presupuesto'
        verbose_name_plural = 'Items de Presupuesto'

    def __str__(self):
        return f"{self.descripcion} x{self.cantidad}"

    @property
    def total_costo(self):
        return self.cantidad * self.costo_unitario

    @property
    def total_venta(self):
        return self.cantidad * self.venta_unitario

    @property
    def margen(self):
        if self.total_venta > 0:
            return ((self.total_venta - self.total_costo) / self.total_venta) * 100
        return 0
