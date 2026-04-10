from rest_framework import serializers
from .models import Producto, MovimientoStock


class ProductoSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    unidad_display = serializers.CharField(source='get_unidad_display', read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)
    valor_inventario = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    margen = serializers.FloatField(read_only=True)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'categoria', 'categoria_display', 'unidad', 'unidad_display',
                  'stock_actual', 'stock_minimo', 'precio_compra', 'precio_venta', 'proveedor',
                  'activo', 'stock_bajo', 'valor_inventario', 'margen', 'created_at', 'updated_at']


class MovimientoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = MovimientoStock
        fields = ['id', 'producto', 'producto_nombre', 'tipo', 'tipo_display', 'cantidad',
                  'stock_anterior', 'stock_nuevo', 'motivo', 'referencia_evento',
                  'usuario', 'usuario_nombre', 'fecha']
        read_only_fields = ['id', 'stock_anterior', 'stock_nuevo', 'fecha']

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return 'Sistema'
