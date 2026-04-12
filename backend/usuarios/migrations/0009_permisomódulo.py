from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0008_add_hyperspeed_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='PermisoModulo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('modulo', models.CharField(choices=[('dashboard', 'Dashboard'), ('eventos', 'Eventos'), ('presupuestos', 'Presupuestos'), ('cobros', 'Cobros'), ('gastos', 'Gastos'), ('inventario', 'Inventario'), ('catalogo', 'Catálogo'), ('reportes', 'Reportes'), ('configuracion', 'Configuración')], max_length=30)),
                ('puede_ver', models.BooleanField(default=True)),
                ('puede_crear', models.BooleanField(default=True)),
                ('puede_editar', models.BooleanField(default=True)),
                ('puede_eliminar', models.BooleanField(default=False)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permisos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Permiso de Módulo',
                'verbose_name_plural': 'Permisos de Módulos',
                'unique_together': {('usuario', 'modulo')},
            },
        ),
    ]
