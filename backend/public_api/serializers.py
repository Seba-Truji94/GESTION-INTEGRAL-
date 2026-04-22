from rest_framework import serializers
from .models import SolicitudPedido, MediaAsset, ConfiguracionSitio


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'seccion', 'tipo', 'archivo', 'url', 'label', 'orden']
        extra_kwargs = {'archivo': {'write_only': True}}


    def get_url(self, obj):
        return obj.archivo.url if obj.archivo else None


class SolicitudPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudPedido
        fields = ['id', 'nombre_cliente', 'email', 'telefono', 'fecha_evento',
                  'descripcion', 'pax', 'estado', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConfiguracionSitioSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = ConfiguracionSitio
        fields = [
            'nombre_marca', 'eslogan', 'logo', 'logo_url',
            'hero_subtitulo', 'footer_copyright',
            'email_contacto', 'telefono',
            'instagram_url', 'instagram_usuario',
            'facebook_url', 'facebook_usuario',
            'whatsapp',
            'nosotros_titulo', 'nosotros_texto1', 'nosotros_texto2',
            'stat1_num', 'stat1_label', 'stat2_num', 'stat2_label', 'stat3_num', 'stat3_label',
        ]

    def get_logo_url(self, obj):
        return obj.logo.url if obj.logo else None
