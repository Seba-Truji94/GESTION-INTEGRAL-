from rest_framework import serializers
from .models import GastoFijo


class GastoFijoSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = GastoFijo
        fields = [
            'id', 'nombre', 'categoria', 'categoria_display', 
            'monto', 'fecha_vencimiento', 'estado', 'estado_display',
            'comprobante', 'observaciones', 'mes', 'anio', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'mes', 'anio']
