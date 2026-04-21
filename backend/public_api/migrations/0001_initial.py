from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SolicitudPedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_cliente', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('telefono', models.CharField(blank=True, default='', max_length=20)),
                ('fecha_evento', models.DateField()),
                ('descripcion', models.TextField()),
                ('pax', models.PositiveIntegerField(default=0)),
                ('estado', models.CharField(choices=[('nueva', 'Nueva'), ('vista', 'Vista'), ('respondida', 'Respondida')], default='nueva', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Solicitud de Pedido',
                'verbose_name_plural': 'Solicitudes de Pedido',
                'ordering': ['-created_at'],
            },
        ),
    ]
