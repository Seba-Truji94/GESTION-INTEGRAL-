from rest_framework import serializers
from .models import SolicitudPedido


class SolicitudPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudPedido
        fields = ['id', 'nombre_cliente', 'email', 'telefono', 'fecha_evento',
                  'descripcion', 'pax', 'created_at']
        read_only_fields = ['id', 'created_at']
