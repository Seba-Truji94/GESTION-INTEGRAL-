from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eventos', '0007_allow_decimals_in_costo_venta_unitario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='presupuesto',
            name='estado',
            field=models.CharField(
                choices=[
                    ('borrador', 'Borrador'),
                    ('enviado', 'Enviado'),
                    ('en_espera', 'En Espera'),
                    ('aprobado', 'Aprobado'),
                    ('rechazado', 'Rechazado'),
                ],
                default='borrador',
                max_length=20,
            ),
        ),
    ]
