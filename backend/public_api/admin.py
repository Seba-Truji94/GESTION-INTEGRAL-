from django.contrib import admin
from .models import SolicitudPedido, MediaAsset, ConfiguracionSitio


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ['seccion', 'tipo', 'label', 'orden', 'activo', 'archivo']
    list_filter = ['seccion', 'tipo', 'activo']
    list_editable = ['orden', 'activo']
    ordering = ['seccion', 'orden']


@admin.register(SolicitudPedido)
class SolicitudPedidoAdmin(admin.ModelAdmin):
    list_display = ['nombre_cliente', 'email', 'telefono', 'fecha_evento', 'pax', 'estado', 'created_at']
    list_filter = ['estado', 'fecha_evento']
    search_fields = ['nombre_cliente', 'email']
    list_editable = ['estado']


@admin.register(ConfiguracionSitio)
class ConfiguracionSitioAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Marca', {'fields': ['nombre_marca', 'eslogan', 'logo', 'hero_subtitulo', 'footer_copyright']}),
        ('Contacto', {'fields': ['email_contacto', 'telefono', 'whatsapp']}),
        ('Redes sociales', {'fields': ['instagram_url', 'instagram_usuario', 'facebook_url', 'facebook_usuario']}),
        ('Quiénes somos', {'fields': ['nosotros_titulo', 'nosotros_texto1', 'nosotros_texto2']}),
        ('Estadísticas', {'fields': ['stat1_num', 'stat1_label', 'stat2_num', 'stat2_label', 'stat3_num', 'stat3_label']}),
    ]

    def has_add_permission(self, _request):
        return not ConfiguracionSitio.objects.exists()

    def has_delete_permission(self, _request, _obj=None):
        return False
