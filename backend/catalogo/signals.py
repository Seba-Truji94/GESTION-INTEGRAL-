from django.db.models.signals import post_save
from django.dispatch import receiver
from eventos.models import Evento
from inventario.models import MovimientoStock
from .models import ProductoCatalogo

@receiver(post_save, sender=Evento)
def procesar_stock_evento_confirmado(sender, instance, created, **kwargs):
    """
    Cuando un evento se confirma, descontamos del inventario los insumos
    de todos los presupuestos APROBADOS asociados que aún no hayan sido procesados.
    """
    if instance.estado == 'confirmado':
        # Buscamos presupuestos aprobados que no hayan descontado stock todavía
        presupuestos_aprobados = instance.presupuestos.filter(estado='aprobado', stock_procesado=False)
        
        for pres in presupuestos_aprobados:
            for item in pres.items.all():
                if item.producto_catalogo:
                    # Descontar cada ingrediente según la receta
                    for rec_item in item.producto_catalogo.ingredientes.all():
                        MovimientoStock.objects.create(
                            producto=rec_item.producto,
                            tipo='salida',
                            cantidad=rec_item.cantidad * item.cantidad,
                            motivo=f"Reserva: {item.descripcion} (Conf. Evento: {instance.nombre})",
                            referencia_evento=instance.nombre,
                            usuario=pres.created_by
                        )
            
            # Marcar el presupuesto como procesado para evitar duplicados
            pres.stock_procesado = True
            pres.save()
