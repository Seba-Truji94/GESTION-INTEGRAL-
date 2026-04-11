from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0006_add_linewaves_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='loginconfiguracion',
            name='hs_preset',
            field=models.CharField(
                max_length=10,
                default='one',
                choices=[
                    ('one', 'Preset 1 — Turbulento Violeta/Cyan'),
                    ('two', 'Preset 2 — Montaña Rojo/Gris'),
                    ('three', 'Preset 3 — XY Rojo/Dorado'),
                    ('four', 'Preset 4 — Long Race Rosa/Turquesa'),
                    ('five', 'Preset 5 — Turbulento Naranja/Azul'),
                    ('six', 'Preset 6 — Deep Rojo/Crema'),
                ],
                help_text='Preset de colores y distorsión para Hyperspeed',
            ),
        ),
        migrations.AddField(
            model_name='loginconfiguracion',
            name='hs_speed_up',
            field=models.FloatField(default=2.0, help_text='Factor de aceleración al hacer clic'),
        ),
    ]
