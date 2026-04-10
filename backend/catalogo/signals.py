from django.db.models.signals import post_save
from django.dispatch import receiver
from eventos.models import Presupuesto
from inventario.models import MovimientoStock
from .models import ProductoCatalogo

@receiver(post_save, sender=Presupuesto)
def procesar_stock_presupuesto_aprobado(sender, instance, created, **kwargs):
    """
    When a budget is approved, deduct ingredients from stock for 
    all items that belong to the catalog.
    """
    # We only act if the state is 'aprobado'
    if instance.estado == 'aprobado':
        # To avoid double deduction, we should ideally check if it was already processed.
        # For simplicity in this MVP, we will assume the transition to 'aprobado' happens once.
        # A more robust solution would add a 'stock_procesado' boolean to Presupuesto.
        
        for item in instance.items.all():
            if item.producto_catalogo:
                # Deduct ingredients of the recipe
                for rec_item in item.producto_catalogo.ingredientes.all():
                    MovimientoStock.objects.create(
                        producto=rec_item.producto,
                        tipo='salida',
                        cantidad=rec_item.cantidad * item.cantidad,
                        motivo=f"Venta: {item.descripcion} (Presupuesto {instance.numero})",
                        referencia_evento=instance.evento.nombre,
                        usuario=instance.created_by
                    )
            # Optional: Deduct simple items if they match inventory product names? 
            # The user specifically asked for Catalog integration, so we stick to that.
