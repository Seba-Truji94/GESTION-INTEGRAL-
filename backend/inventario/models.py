from django.db import models
from django.conf import settings


class Producto(models.Model):
    """Producto/insumo del inventario."""
    CATEGORIAS = [
        ('ingrediente', 'Ingrediente'),
        ('insumo', 'Insumo'),
        ('descartable', 'Descartable'),
        ('bebida', 'Bebida'),
        ('equipamiento', 'Equipamiento'),
        ('otro', 'Otro'),
    ]
    UNIDADES = [
        ('kg', 'Kilogramo (kg)'),
        ('lt', 'Litro (lt)'),
        ('un', 'Unidad (un)'),
        ('docena', 'Docena'),
        ('caja', 'Caja'),
        ('bolsa', 'Bolsa'),
        ('bandeja', 'Bandeja'),
        ('paquete', 'Paquete'),
    ]

    nombre = models.CharField(max_length=200, verbose_name='Nombre del Producto')
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='ingrediente')
    unidad = models.CharField(max_length=10, choices=UNIDADES, default='un')
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name='Precio Compra (CLP)')
    precio_venta = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name='Precio Venta (CLP)')
    proveedor = models.CharField(max_length=200, blank=True, default='')
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.stock_actual} {self.unidad})"

    @property
    def stock_bajo(self):
        return self.stock_actual <= self.stock_minimo

    @property
    def valor_inventario(self):
        return self.stock_actual * self.precio_compra

    @property
    def margen(self):
        if self.precio_venta > 0:
            return ((self.precio_venta - self.precio_compra) / self.precio_venta) * 100
        return 0


class MovimientoStock(models.Model):
    """Registro de movimientos de inventario."""
    TIPOS = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices=TIPOS)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    stock_anterior = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_nuevo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    motivo = models.CharField(max_length=300, blank=True, default='')
    referencia_evento = models.CharField(max_length=200, blank=True, default='',
                                          verbose_name='Evento Relacionado')
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Movimiento de Stock'
        verbose_name_plural = 'Movimientos de Stock'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_display()} {self.cantidad} {self.producto.nombre}"

    def save(self, *args, **kwargs):
        producto = self.producto
        self.stock_anterior = producto.stock_actual
        if self.tipo == 'entrada':
            producto.stock_actual += self.cantidad
        elif self.tipo == 'salida':
            producto.stock_actual -= self.cantidad
        elif self.tipo == 'ajuste':
            producto.stock_actual = self.cantidad
        self.stock_nuevo = producto.stock_actual
        producto.save(update_fields=['stock_actual'])
        super().save(*args, **kwargs)
