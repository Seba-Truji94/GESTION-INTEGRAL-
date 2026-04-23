"""
Usage:
    python manage.py seed_data           # create everything
    python manage.py seed_data --clear   # wipe and recreate
"""
import io
import urllib.request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from public_api.models import MediaAsset, ConfiguracionSitio
from catalogo.models import ProductoCatalogo


def _fetch(url, filename):
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return ContentFile(r.read(), name=filename)
    except Exception as e:
        print(f"  ⚠  Could not download {url}: {e}")
        return None


UNSPLASH = "https://images.unsplash.com/photo-{id}?w={w}&auto=format&fit=crop&q=80"

MEDIA_SEEDS = [
    # seccion, tipo, unsplash_id, width, label, orden
    ('hero_imagen',     'imagen', '1414235077428-338989a2e8c0', 1920, '', 0),
    ('nosotros_banner', 'imagen', '1555244162-803834f70033',    1600, '', 0),
    ('nosotros_foto1',  'imagen', '1556909114-f6e7ad7d3136',    900,  '', 0),
    ('nosotros_foto2',  'imagen', '1565299624946-b28f40a0ae38', 900,  '', 0),
    ('galeria', 'imagen', '1467003909585-2f8a72700288', 800, 'Cena de gala',          1),
    ('galeria', 'imagen', '1540189549336-e6e99c3679fe', 800, 'Ensalada de temporada', 2),
    ('galeria', 'imagen', '1504674900247-0877df9cc836', 800, 'Mesa del chef',          3),
    ('galeria', 'imagen', '1565958011703-44f9829ba187', 800, 'Repostería fina',        4),
    ('galeria', 'imagen', '1555244162-803834f70033',    800, 'Banquete completo',      5),
    ('galeria', 'imagen', '1527529482837-4698179dc6ce', 800, 'Coctelería',             6),
    ('galeria', 'imagen', '1517457373958-b7bdd4587205', 800, 'Evento corporativo',     7),
    ('galeria', 'imagen', '1551782450-a2132b4ba21d',    800, 'Plato estrella',         8),
    ('galeria', 'imagen', '1414235077428-338989a2e8c0', 800, 'Fine dining',            9),
]

CATALOGO_SEEDS = [
    ('Torta Naked Cake',     'Torta de bizcocho húmedo con relleno de manjar y frutos rojos frescos. Decoración rústica con flores comestibles.',                   '1565299543923-37dd37887442', 'reposteria',  38000),
    ('Macarons Franceses',   'Selección de 12 macarons artesanales: frambuesa, chocolate, pistacho y vainilla.',                                                   '1558326567-6cb58d57c6c0',    'reposteria',  18000),
    ('Cheesecake de Berries','Base crocante de galleta, relleno cremoso de queso Philadelphia y coulis de berries casero.',                                         '1571115177098-24ec42ed204d', 'reposteria',  28000),
    ('Cena 3 Tiempos',       'Entrada, plato de fondo y postre personalizable. Incluye mise en place completo. Precio por persona.',                                '1414235077428-338989a2e8c0', 'banqueteria', 18500),
    ('Brunch Gourmet',       'Huevos benedictinos, pan artesanal, fruta de temporada y jugos naturales. Por persona.',                                             '1504674900247-0877df9cc836', 'banqueteria', 12000),
    ('Finger Foods x20',     '20 piezas: brochetas, mini sándwiches, crostini y tartaletas saladas. Ideal para cócteles.',                                         '1555244162-803834f70033',    'banqueteria', 22000),
    ('Asado Cordero al Palo','Cordero entero a las brasas, 8 horas de cocción lenta. Ensaladas, panes y chimichurri casero. Por persona.',                          '1467003909585-2f8a72700288', 'banqueteria', 25000),
    ('Pisco Sour Premium',   'Pisco ABA 40°, limón de pica, clara de huevo y angostura. Preparación en vivo. Por persona por hora.',                               '1527529482837-4698179dc6ce', 'cocteleria',   8500),
    ('Barra de Cócteles',    '5 cócteles de carta + mocktails. Barman con hielos, vasos y decoraciones. 3 horas.',                                                 '1551782450-a2132b4ba21d',    'cocteleria',  95000),
    ('Sangría de la Casa',   'Sangría artesanal con vino tinto, naranja, manzana, canela y brandy. Jarra de 2 litros.',                                            '1544145945-f90425340c7e',    'bebidas',     14000),
    ('Aguas Saborizadas x6', 'Set de 6 botellas: pepino-menta, limón-jengibre y frutos rojos. Sin azúcar.',                                                        '1548839038-88977e52aa90',    'bebidas',      9000),
    ('Mesa de Dulces',       'Montaje decorativo con torta central, cupcakes, galletas, trufas y candy bar. Para 30 personas.',                                     '1565299624946-b28f40a0ae38', 'otro',        85000),
]


class Command(BaseCommand):
    help = 'Seed website with demo media and catalog products'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete existing records first')

    def handle(self, *args, **options):
        if options['clear']:
            MediaAsset.objects.all().delete()
            ProductoCatalogo.objects.all().delete()
            self.stdout.write('  Cleared existing data.')

        # Site config
        config = ConfiguracionSitio.get_config()
        config.nombre_marca   = 'RyF banqueteria'
        config.eslogan        = 'Banquetería & Repostería'
        config.hero_subtitulo = 'Arte en cada evento'
        config.nosotros_titulo = 'Pasión que se transforma en sabor'
        config.email_contacto = 'contacto@ryfbanqueteria.cl'
        config.telefono       = '+56 9 1234 5678'
        config.stat1_num = 8;   config.stat1_label = 'Años de experiencia'
        config.stat2_num = 500; config.stat2_label = 'Eventos realizados'
        config.stat3_num = 12;  config.stat3_label = 'Chefs especializados'
        config.save()
        self.stdout.write('✓ ConfiguracionSitio updated')

        # Media
        self.stdout.write('Downloading media...')
        for seccion, tipo, uid, width, label, orden in MEDIA_SEEDS:
            url = UNSPLASH.format(id=uid, w=width)
            filename = f"seed_{uid[:12]}.jpg"
            content = _fetch(url, filename)
            if content:
                asset = MediaAsset(seccion=seccion, tipo=tipo, label=label, orden=orden, activo=True)
                asset.archivo.save(filename, content, save=True)
                self.stdout.write(f'  ✓ {seccion} — {label or filename}')

        # Catalog
        self.stdout.write('Creating catalog products...')
        for nombre, desc, uid, cat, precio in CATALOGO_SEEDS:
            if ProductoCatalogo.objects.filter(nombre=nombre).exists():
                self.stdout.write(f'  – {nombre} already exists, skipping')
                continue
            url = UNSPLASH.format(id=uid, w=400)
            filename = f"prod_{uid[:12]}.jpg"
            content = _fetch(url, filename)
            prod = ProductoCatalogo(nombre=nombre, descripcion=desc, categoria=cat, precio_venta=precio, activo=True)
            if content:
                prod.imagen.save(filename, content, save=False)
            prod.save()
            self.stdout.write(f'  ✓ {nombre}')

        self.stdout.write(self.style.SUCCESS('\nSeed complete.'))
