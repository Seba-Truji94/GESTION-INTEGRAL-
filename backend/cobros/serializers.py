from rest_framework import serializers
from .models import Cobro, Pago, SeguimientoEvento, DatosTransferencia


class PagoSerializer(serializers.ModelSerializer):
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    evento_nombre = serializers.CharField(source='cobro.presupuesto.evento.nombre', read_only=True)
    presupuesto_numero = serializers.CharField(source='cobro.presupuesto.numero', read_only=True)
    cliente_nombre = serializers.CharField(source='cobro.presupuesto.evento.cliente', read_only=True)
    gestor_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Pago
        fields = ['id', 'cobro', 'evento_nombre', 'presupuesto_numero', 'cliente_nombre',
                  'monto', 'metodo_pago', 'metodo_pago_display', 'gestor_nombre',
                  'fecha_pago', 'comprobante', 'evidencia', 'observaciones', 'created_at']
        read_only_fields = ['id', 'cobro', 'created_at', 'evidencia']

    def get_gestor_nombre(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'S/I'


class CobroSerializer(serializers.ModelSerializer):
    pagos = PagoSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    monto_pagado = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    saldo_pendiente = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    presupuesto_numero = serializers.CharField(source='presupuesto.numero', read_only=True)
    evento_nombre = serializers.CharField(source='presupuesto.evento.nombre', read_only=True)
    cliente = serializers.CharField(source='presupuesto.evento.cliente', read_only=True)

    class Meta:
        model = Cobro
        fields = ['id', 'presupuesto', 'presupuesto_numero', 'evento_nombre', 'cliente',
                  'monto_total', 'estado', 'estado_display', 'fecha_envio', 'fecha_vencimiento',
                  'observaciones', 'pagos', 'monto_pagado', 'saldo_pendiente',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'fecha_envio', 'created_at', 'updated_at']


class CobroCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cobro
        fields = ['id', 'presupuesto', 'monto_total', 'fecha_vencimiento', 'observaciones']


class SeguimientoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = SeguimientoEvento
        fields = ['id', 'evento', 'estado_anterior', 'estado_nuevo', 'notas',
                  'usuario', 'usuario_nombre', 'fecha']
        read_only_fields = ['id', 'evento', 'estado_anterior', 'usuario', 'fecha']

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return 'Sistema'

class DatosTransferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosTransferencia
        fields = '__all__'
