from django.db import models
from inventario.models import Producto

class ProductoCatalogo(models.Model):
    """Product that can be sold (e.g. Torta, Cena 3 tiempos)."""
    CATEGORIAS = [
        ('reposteria', 'Repostería'),
        ('banqueteria', 'Banquetería'),
        ('cocteleria', 'Coctelería'),
        ('bebidas', 'Bebidas'),
        ('otro', 'Otro'),
    ]
    
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, default='')
    imagen = models.ImageField(upload_to='catalogo/', null=True, blank=True)
    categoria = models.CharField(max_length=30, choices=CATEGORIAS, default='otro')
    precio_venta = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto de Catálogo'
        verbose_name_plural = 'Productos de Catálogo'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

    @property
    def costo_base(self):
        """Calculates the sum of costs of all ingredients in the recipe."""
        total = 0
        for item in self.ingredientes.all():
            total += item.producto.precio_compra * item.cantidad
        return total

    @property
    def margen_estimado(self):
        if self.precio_venta > 0:
            return ((self.precio_venta - self.costo_base) / self.precio_venta) * 100
        return 0

class RecetaItem(models.Model):
    """Link between a Catalog Product and an Inventory Ingredient."""
    producto_catalogo = models.ForeignKey(ProductoCatalogo, on_delete=models.CASCADE, related_name='ingredientes')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='usado_en_recetas')
    cantidad = models.DecimalField(max_digits=10, decimal_places=3) # e.g. 0.500 kg

    class Meta:
        verbose_name = 'Item de Receta'
        verbose_name_plural = 'Items de Receta'

    def __str__(self):
        return f"{self.cantidad} {self.producto.unidad} de {self.producto.nombre}"
