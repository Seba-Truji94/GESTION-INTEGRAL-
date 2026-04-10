from rest_framework import serializers
from .models import ProductoCatalogo, RecetaItem
from inventario.models import Producto

class RecetaItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_unidad = serializers.ReadOnlyField(source='producto.unidad')
    
    class Meta:
        model = RecetaItem
        fields = ['id', 'producto', 'producto_nombre', 'producto_unidad', 'cantidad']

class ProductoCatalogoSerializer(serializers.ModelSerializer):
    ingredientes = RecetaItemSerializer(many=True)
    costo_base = serializers.ReadOnlyField()
    margen_estimado = serializers.ReadOnlyField()

    class Meta:
        model = ProductoCatalogo
        fields = ['id', 'nombre', 'descripcion', 'categoria', 'precio_venta', 'ingredientes', 'costo_base', 'margen_estimado', 'activo']

    def create(self, validated_data):
        ingredientes_data = validated_data.pop('ingredientes', [])
        producto_catalogo = ProductoCatalogo.objects.create(**validated_data)
        for ing_data in ingredientes_data:
            RecetaItem.objects.create(producto_catalogo=producto_catalogo, **ing_data)
        return producto_catalogo

    def update(self, instance, validated_data):
        ingredientes_data = validated_data.pop('ingredientes', None)
        
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.categoria = validated_data.get('categoria', instance.categoria)
        instance.precio_venta = validated_data.get('precio_venta', instance.precio_venta)
        instance.activo = validated_data.get('activo', instance.activo)
        instance.save()

        if ingredientes_data is not None:
            # Simple approach: clear and recreate
            instance.ingredientes.all().delete()
            for ing_data in ingredientes_data:
                RecetaItem.objects.create(producto_catalogo=instance, **ing_data)
        
        return instance
