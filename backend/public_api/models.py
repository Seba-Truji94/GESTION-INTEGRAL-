from django.db import models


SECCIONES = [
    ('hero_video',      'Hero — Video principal'),
    ('hero_imagen',     'Hero — Imagen fallback'),
    ('nosotros_banner', 'Nosotros — Banner principal'),
    ('nosotros_foto1',  'Nosotros — Foto cocina/interior'),
    ('nosotros_foto2',  'Nosotros — Foto producto/tabla'),
    ('galeria',         'Galería — Foto (se pueden subir varias)'),
    ('galeria_video',   'Galería — Video showcase (después de fotos)'),
]


class MediaAsset(models.Model):
    TIPOS = [('imagen', 'Imagen'), ('video', 'Video')]
    seccion  = models.CharField(max_length=30, choices=SECCIONES)
    tipo     = models.CharField(max_length=10, choices=TIPOS)
    archivo  = models.FileField(upload_to='website/')
    label    = models.CharField(max_length=100, blank=True, help_text='Texto opcional para galería')
    orden    = models.PositiveIntegerField(default=0, help_text='Orden en galería')
    activo   = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Media del Sitio Web'
        verbose_name_plural = 'Media del Sitio Web'
        ordering = ['seccion', 'orden']

    def __str__(self):
        return f"{self.get_seccion_display()} — {self.archivo.name}"


class SolicitudPedido(models.Model):
    ESTADOS = [
        ('nueva', 'Nueva'),
        ('vista', 'Vista'),
        ('respondida', 'Respondida'),
    ]
    nombre_cliente = models.CharField(max_length=200)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True, default='')
    fecha_evento = models.DateField()
    descripcion = models.TextField()
    pax = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='nueva')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Solicitud de Pedido'
        verbose_name_plural = 'Solicitudes de Pedido'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre_cliente} — {self.fecha_evento}"


class ConfiguracionSitio(models.Model):
    nombre_marca     = models.CharField(max_length=100, default='RyF banqueteria')
    eslogan          = models.CharField(max_length=200, default='Banquetería & Repostería')
    logo             = models.ImageField(upload_to='website/logo/', blank=True, null=True, help_text='Logo opcional. Si no se sube, se usa el nombre como texto.')
    hero_subtitulo   = models.CharField(max_length=200, default='Arte en cada evento')
    footer_copyright = models.CharField(max_length=300, default='Banquetería & Repostería. Todos los derechos reservados.')
    email_contacto   = models.EmailField(default='contacto@ryfbanqueteria.cl')
    telefono         = models.CharField(max_length=30, default='+56 9 0000 0000')
    instagram_url    = models.URLField(blank=True, default='https://instagram.com/ryfbanqueteria')
    instagram_usuario= models.CharField(max_length=100, blank=True, default='@ryfbanqueteria')
    facebook_url     = models.URLField(blank=True, default='https://facebook.com/ryfbanqueteria')
    facebook_usuario = models.CharField(max_length=100, blank=True, default='RyF banqueteria')
    whatsapp         = models.CharField(max_length=30, blank=True, default='')
    nosotros_titulo  = models.CharField(max_length=200, default='Pasión que se transforma en sabor')
    nosotros_texto1  = models.TextField(default='En RyF banqueteria creamos experiencias gastronómicas únicas para cada celebración. Desde bodas íntimas hasta grandes eventos corporativos, nuestra cocina combina técnica de alta cocina con ingredientes locales de temporada.')
    nosotros_texto2  = models.TextField(default='Cada detalle importa — desde la selección de ingredientes hasta la presentación final — porque sabemos que los momentos que vivís merecen algo verdaderamente especial.')
    stat1_num        = models.PositiveIntegerField(default=8)
    stat1_label      = models.CharField(max_length=100, default='Años de experiencia')
    stat2_num        = models.PositiveIntegerField(default=500)
    stat2_label      = models.CharField(max_length=100, default='Eventos realizados')
    stat3_num        = models.PositiveIntegerField(default=12)
    stat3_label      = models.CharField(max_length=100, default='Chefs especializados')

    class Meta:
        verbose_name = 'Configuración del Sitio'
        verbose_name_plural = 'Configuración del Sitio'

    def __str__(self):
        return self.nombre_marca

    @classmethod
    def get_config(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# Signals to auto-create events from web inquiries
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=SolicitudPedido)
def create_event_from_inquiry(sender, instance, created, **kwargs):
    if created:
        from eventos.models import Evento
        Evento.objects.create(
            nombre=f"Consulta Web: {instance.nombre_cliente}",
            cliente=instance.nombre_cliente,
            fecha=instance.fecha_evento,
            pax=instance.pax if instance.pax > 0 else 1,
            estado='prospecto',
            es_externo=True,
            observaciones=(
                f"Email: {instance.email}\n"
                f"Tel: {instance.telefono}\n\n"
                f"Descripción: {instance.descripcion}"
            )
        )
