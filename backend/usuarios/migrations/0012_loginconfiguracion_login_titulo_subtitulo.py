from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0011_add_mantenedor_modulo'),
    ]

    operations = [
        migrations.AddField(
            model_name='loginconfiguracion',
            name='login_titulo',
            field=models.CharField(blank=True, default='', help_text='Nombre de la empresa en la tarjeta de login', max_length=100),
        ),
        migrations.AddField(
            model_name='loginconfiguracion',
            name='login_subtitulo',
            field=models.CharField(blank=True, default='', help_text='Slogan o descripción en la tarjeta de login', max_length=200),
        ),
    ]
