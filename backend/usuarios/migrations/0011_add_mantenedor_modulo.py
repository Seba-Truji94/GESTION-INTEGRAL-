from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0010_add_configuracion_login_modulo'),
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
                    ('mantenedor', 'Mantenedor'),
                ],
                max_length=30,
            ),
        ),
    ]
