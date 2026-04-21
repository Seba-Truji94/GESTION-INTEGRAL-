from django.contrib import admin
from .models import SolicitudPedido


@admin.register(SolicitudPedido)
class SolicitudPedidoAdmin(admin.ModelAdmin):
    list_display = ['nombre_cliente', 'email', 'telefono', 'fecha_evento', 'pax', 'estado', 'created_at']
    list_filter = ['estado', 'fecha_evento']
    search_fields = ['nombre_cliente', 'email']
    list_editable = ['estado']
