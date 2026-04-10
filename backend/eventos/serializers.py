from rest_framework import serializers
from .models import Evento, Presupuesto, ItemPresupuesto


class ItemPresupuestoSerializer(serializers.ModelSerializer):
    total_costo = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    total_venta = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    margen = serializers.FloatField(read_only=True)

    class Meta:
        model = ItemPresupuesto
        fields = ['id', 'producto_catalogo', 'descripcion', 'categoria', 'cantidad', 'costo_unitario',
                  'venta_unitario', 'total_costo', 'total_venta', 'margen']


class PresupuestoSerializer(serializers.ModelSerializer):
    items = ItemPresupuestoSerializer(many=True, read_only=True)
    evento_nombre = serializers.CharField(source='evento.nombre', read_only=True)
    evento_cliente = serializers.CharField(source='evento.cliente', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    forma_pago_display = serializers.CharField(source='get_forma_pago_display', read_only=True)
    costo_total = serializers.SerializerMethodField()

    class Meta:
        model = Presupuesto
        fields = ['id', 'evento', 'evento_nombre', 'evento_cliente', 'numero', 'estado',
                  'estado_display', 'subtotal', 'descuento_pct', 'total', 'forma_pago',
                  'forma_pago_display', 'validez_dias', 'notas', 'cliente_nombre',
                  'cliente_rut', 'cliente_email', 'cliente_telefono', 'cliente_direccion', 'cliente_comuna', 'incluir_iva', 'items',
                  'costo_total', 'created_at', 'updated_at']
        read_only_fields = ['id', 'numero', 'subtotal', 'total', 'created_at', 'updated_at']

    def get_costo_total(self, obj):
        return sum(float(i.cantidad * i.costo_unitario) for i in obj.items.all())


class PresupuestoCreateSerializer(serializers.ModelSerializer):
    items = ItemPresupuestoSerializer(many=True, required=False)

    class Meta:
        model = Presupuesto
        fields = ['id', 'evento', 'estado', 'descuento_pct', 'forma_pago',
                  'validez_dias', 'notas', 'cliente_nombre', 'cliente_rut', 'cliente_email',
                  'cliente_telefono', 'cliente_direccion', 'cliente_comuna', 'incluir_iva', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        pres = Presupuesto.objects.create(**validated_data)
        for item_data in items_data:
            ItemPresupuesto.objects.create(presupuesto=pres, **item_data)
        pres.recalcular()
        return pres

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                ItemPresupuesto.objects.create(presupuesto=instance, **item_data)
            instance.recalcular()
        return instance


class EventoListSerializer(serializers.ModelSerializer):
    tipo_evento_display = serializers.CharField(source='get_tipo_evento_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    costo_total = serializers.FloatField(read_only=True)
    venta_total = serializers.FloatField(read_only=True)
    utilidad = serializers.FloatField(read_only=True)
    margen = serializers.FloatField(read_only=True)
    presupuestos_count = serializers.IntegerField(source='presupuestos.count', read_only=True)

    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'cliente', 'fecha', 'tipo_evento', 'tipo_evento_display',
                  'pax', 'lugar', 'estado', 'estado_display', 'costo_total', 'venta_total',
                  'utilidad', 'margen', 'presupuestos_count', 'created_at']


class EventoDetailSerializer(serializers.ModelSerializer):
    tipo_evento_display = serializers.CharField(source='get_tipo_evento_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    presupuestos = PresupuestoSerializer(many=True, read_only=True)
    costo_total = serializers.FloatField(read_only=True)
    venta_total = serializers.FloatField(read_only=True)
    utilidad = serializers.FloatField(read_only=True)
    margen = serializers.FloatField(read_only=True)

    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'cliente', 'fecha', 'tipo_evento', 'tipo_evento_display',
                  'pax', 'lugar', 'estado', 'estado_display', 'menu', 'observaciones',
                  'presupuestos', 'costo_total', 'venta_total', 'utilidad', 'margen',
                  'created_at', 'updated_at']


class EventoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'cliente', 'fecha', 'tipo_evento', 'pax',
                  'lugar', 'estado', 'menu', 'observaciones']
