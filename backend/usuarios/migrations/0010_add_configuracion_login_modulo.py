from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0009_permisomódulo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='permisomodulo',
            name='modulo',
            field=models.CharField(
                choices=[
                    ('dashboard', 'Dashboard'),
                    ('eventos', 'Eventos'),
                    ('presupuestos', 'Presupuestos'),
                    ('cobros', 'Cobros'),
                    ('gastos', 'Gastos'),
                    ('inventario', 'Inventario'),
                    ('catalogo', 'Catálogo'),
                    ('reportes', 'Reportes'),
                    ('configuracion', 'Configuración'),
                    ('configuracion_login', 'Visual Login'),
                ],
                max_length=30,
            ),
        ),
    ]
